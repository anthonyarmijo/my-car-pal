import { promises as fs } from "node:fs";
import path from "node:path";
import { del as blobDelete, put } from "@vercel/blob";

type StorageDriver = "local" | "vercel-blob";

const BLOB_PREFIX = "blob:";
const LOCAL_UPLOAD_PREFIX = "/uploads/";
const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const PRIVATE_BLOB_HOST_SUFFIX = ".private.blob.vercel-storage.com";

function normalizeUploadKey(key: string): string {
  const normalized = path.posix.normalize(key.replace(/\\/g, "/")).replace(/^\/+/, "");

  if (!normalized || normalized.startsWith("../") || normalized === "..") {
    throw new Error("Upload path is invalid.");
  }

  return normalized;
}

function blobStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function storageDriver(): StorageDriver {
  const explicitDriver = process.env.FILE_STORAGE_DRIVER?.trim().toLowerCase();

  if (explicitDriver === "local" || explicitDriver === "vercel-blob") {
    return explicitDriver;
  }

  return blobStorageConfigured() ? "vercel-blob" : "local";
}

function normalizeBlobPathname(pathname: string): string {
  const normalized = path.posix.normalize(pathname.replace(/\\/g, "/")).replace(/^\/+/, "");

  if (!normalized || normalized.startsWith("../") || normalized === "..") {
    throw new Error("Blob path is invalid.");
  }

  return normalized;
}

function isLegacyBlobPathname(value: string): boolean {
  return (
    Boolean(value) &&
    !value.startsWith(BLOB_PREFIX) &&
    !value.startsWith(LOCAL_UPLOAD_PREFIX) &&
    !value.startsWith("http://") &&
    !value.startsWith("https://") &&
    !value.startsWith("file:") &&
    value.includes("/")
  );
}

export function isBlobLocator(value: string): boolean {
  return value.startsWith(BLOB_PREFIX) || isLegacyBlobPathname(value);
}

export function blobPathnameFromLocator(locator: string): string {
  if (locator.startsWith(BLOB_PREFIX)) {
    return normalizeBlobPathname(locator.slice(BLOB_PREFIX.length));
  }

  if (isLegacyBlobPathname(locator)) {
    return normalizeBlobPathname(locator);
  }

  throw new Error("Blob locator is invalid.");
}

export function privateBlobUrlFromLocator(locator: string): string {
  const storeId = process.env.BLOB_STORE_ID;
  if (!storeId) {
    throw new Error("BLOB_STORE_ID is required to resolve blob locators.");
  }

  return `https://${storeId}${PRIVATE_BLOB_HOST_SUFFIX}/${blobPathnameFromLocator(locator)}`;
}

function blobAppPathFromLocator(locator: string): string {
  return `/api/files?locator=${encodeURIComponent(locator)}`;
}

export async function uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string> {
  const normalizedKey = normalizeUploadKey(key);

  if (storageDriver() === "local") {
    const localPath = path.join(LOCAL_UPLOADS_DIR, normalizedKey);
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, buffer);
    return `${LOCAL_UPLOAD_PREFIX}${normalizedKey}`;
  }

  if (!blobStorageConfigured()) {
    throw new Error("Vercel Blob is selected but BLOB_READ_WRITE_TOKEN is not configured.");
  }

  const blob = await put(normalizedKey, buffer, {
    access: "private",
    contentType,
    addRandomSuffix: true,
  });
  return `${BLOB_PREFIX}${blob.pathname}`;
}

export async function getSignedUrl(locator: string): Promise<string> {
  if (!locator) {
    return locator;
  }

  if (isBlobLocator(locator)) {
    return blobAppPathFromLocator(locator);
  }

  if (locator.startsWith(LOCAL_UPLOAD_PREFIX)) {
    return locator;
  }

  return locator;
}

export async function resolveStoredFileUrl(value: string): Promise<string> {
  if (value.startsWith(BLOB_PREFIX) || value.startsWith(LOCAL_UPLOAD_PREFIX)) {
    return getSignedUrl(value);
  }

  return value;
}

export async function deleteFile(locator: string): Promise<void> {
  if (!locator) {
    return;
  }

  if (isBlobLocator(locator)) {
    await blobDelete(blobPathnameFromLocator(locator));
    return;
  }

  if (locator.startsWith(LOCAL_UPLOAD_PREFIX)) {
    const localPath = path.join(process.cwd(), "public", locator.replace(/^\//, ""));
    await fs.unlink(localPath).catch(() => undefined);
    return;
  }
}

export async function deleteFileIfPresent(locator: string | null | undefined): Promise<void> {
  if (!locator) {
    return;
  }

  await deleteFile(locator).catch(() => undefined);
}
