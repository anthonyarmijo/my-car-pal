import { DOCUMENT_CONTENT_TYPES, IMAGE_CONTENT_TYPES, type UploadContentType } from "@/lib/upload-constants";
export {
  DOCUMENT_CONTENT_TYPES,
  DOCUMENT_FILE_ACCEPT,
  IMAGE_CONTENT_TYPES,
  IMAGE_FILE_ACCEPT,
  type UploadContentType,
} from "@/lib/upload-constants";

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d];
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46];
const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50];

export type UploadLike = {
  name?: string;
  size: number;
  type: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

const CONTENT_TYPE_ALIASES: Record<string, UploadContentType> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
};

type ValidationOptions = {
  allowedContentTypes: readonly UploadContentType[];
  buffer: Buffer;
  declaredContentType: string;
  fileLabel: string;
  maxBytes: number;
};

function startsWithSignature(buffer: Uint8Array, signature: number[], offset = 0): boolean {
  if (buffer.length < offset + signature.length) {
    return false;
  }

  return signature.every((value, index) => buffer[offset + index] === value);
}

function detectContentType(buffer: Uint8Array): UploadContentType | null {
  if (startsWithSignature(buffer, JPEG_SIGNATURE)) {
    return "image/jpeg";
  }

  if (startsWithSignature(buffer, PNG_SIGNATURE)) {
    return "image/png";
  }

  if (startsWithSignature(buffer, PDF_SIGNATURE)) {
    return "application/pdf";
  }

  if (startsWithSignature(buffer, RIFF_SIGNATURE) && startsWithSignature(buffer, WEBP_SIGNATURE, 8)) {
    return "image/webp";
  }

  return null;
}

function normalizeDeclaredContentType(value: string): UploadContentType | "" {
  const normalized = value.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  if (!normalized) {
    return "";
  }

  return CONTENT_TYPE_ALIASES[normalized] ?? (normalized as UploadContentType);
}

function buildAllowedTypesLabel(allowedContentTypes: readonly UploadContentType[]): string {
  if (allowedContentTypes.length === IMAGE_CONTENT_TYPES.length) {
    return "JPEG, PNG, or WebP";
  }

  return "PDF, JPEG, PNG, or WebP";
}

export function isUploadLike(value: unknown): value is UploadLike {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "arrayBuffer" in value &&
    typeof value.arrayBuffer === "function" &&
    "size" in value &&
    typeof value.size === "number" &&
    "type" in value &&
    typeof value.type === "string"
  );
}

export function fileExtensionForContentType(contentType: UploadContentType): string {
  switch (contentType) {
    case "application/pdf":
      return ".pdf";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/jpeg":
    default:
      return ".jpg";
  }
}

export function validateUploadedFile({
  allowedContentTypes,
  buffer,
  declaredContentType,
  fileLabel,
  maxBytes,
}: ValidationOptions): UploadContentType {
  if (buffer.length === 0) {
    throw new Error(`${fileLabel} is empty.`);
  }

  if (buffer.length > maxBytes) {
    throw new Error(`${fileLabel} must be ${Math.floor(maxBytes / (1024 * 1024))}MB or smaller.`);
  }

  const detectedContentType = detectContentType(buffer);
  if (!detectedContentType || !allowedContentTypes.includes(detectedContentType)) {
    const allowedLabel = buildAllowedTypesLabel(allowedContentTypes);
    const suffix = allowedContentTypes.length === IMAGE_CONTENT_TYPES.length ? " image" : " file";
    throw new Error(`${fileLabel} must be a ${allowedLabel}${suffix}.`);
  }

  const normalizedDeclaredContentType = normalizeDeclaredContentType(declaredContentType);
  if (normalizedDeclaredContentType && normalizedDeclaredContentType !== detectedContentType) {
    throw new Error(`${fileLabel} content type did not match the uploaded file.`);
  }

  return detectedContentType;
}

export async function readValidatedUpload(
  file: UploadLike,
  options: Omit<ValidationOptions, "buffer" | "declaredContentType">,
): Promise<{ buffer: Buffer; contentType: UploadContentType }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = validateUploadedFile({
    ...options,
    buffer,
    declaredContentType: file.type,
  });

  return { buffer, contentType };
}
