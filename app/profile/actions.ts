"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { deleteFileIfPresent, uploadFile } from "@/lib/storage";
import {
  fileExtensionForContentType,
  IMAGE_CONTENT_TYPES,
  isUploadLike,
  readValidatedUpload,
  type UploadLike,
} from "@/lib/upload-validation";

const MAX_PROFILE_IMAGE_BYTES = 4 * 1024 * 1024;

export type UpdateProfileAvatarState = {
  status: "idle" | "success" | "error";
  message: string;
};

async function persistProfileImage(file: UploadLike): Promise<string> {
  const { buffer, contentType } = await readValidatedUpload(file, {
    maxBytes: MAX_PROFILE_IMAGE_BYTES,
    allowedContentTypes: IMAGE_CONTENT_TYPES,
    fileLabel: "Profile image",
  });

  const key = `profiles/${Date.now()}-${crypto.randomUUID()}${fileExtensionForContentType(contentType)}`;
  return uploadFile(key, buffer, contentType);
}

export async function updateProfileAvatarAction(
  _prevState: UpdateProfileAvatarState,
  formData: FormData,
): Promise<UpdateProfileAvatarState> {
  const user = await requireCurrentUser();
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { avatarUrl: true },
  });
  const maybeImage = formData.get("avatar");

  if (!isUploadLike(maybeImage) || maybeImage.size <= 0) {
    return { status: "error", message: "Choose an image file to upload." };
  }

  try {
    const avatarUrl = await persistProfileImage(maybeImage);
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    });
    if (profile?.avatarUrl && profile.avatarUrl !== avatarUrl) {
      await deleteFileIfPresent(profile.avatarUrl);
    }
    return { status: "success", message: "Profile picture updated." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not upload profile image right now.";
    return { status: "error", message };
  }
}

export async function updateProfileAction(formData: FormData): Promise<void> {
  const user = await requireCurrentUser();
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { avatarUrl: true },
  });

  const hasDisplayName = formData.has("displayName");
  const hasBio = formData.has("bio");
  const displayName = hasDisplayName ? String(formData.get("displayName") ?? "").trim() : "";
  const bio = hasBio ? String(formData.get("bio") ?? "").trim() : "";

  let avatarUrl: string | undefined;
  const maybeImage = formData.get("avatar");
  if (isUploadLike(maybeImage) && maybeImage.size > 0) {
    try {
      avatarUrl = await persistProfileImage(maybeImage);
    } catch {
      // Image upload errors are handled through the dedicated avatar form action.
      avatarUrl = undefined;
    }
  }

  const updateData: {
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string;
  } = {};

  if (hasDisplayName) {
    updateData.displayName = displayName || null;
  }
  if (hasBio) {
    updateData.bio = bio || null;
  }
  if (avatarUrl) {
    updateData.avatarUrl = avatarUrl;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });
  if (profile?.avatarUrl && avatarUrl && profile.avatarUrl !== avatarUrl) {
    await deleteFileIfPresent(profile.avatarUrl);
  }

  redirect("/profile?saved=1");
}
