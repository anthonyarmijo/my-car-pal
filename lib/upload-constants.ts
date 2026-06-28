export const IMAGE_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const DOCUMENT_CONTENT_TYPES = ["application/pdf", ...IMAGE_CONTENT_TYPES] as const;

export const IMAGE_FILE_ACCEPT = IMAGE_CONTENT_TYPES.join(",");
export const DOCUMENT_FILE_ACCEPT = DOCUMENT_CONTENT_TYPES.join(",");

export type UploadContentType = (typeof DOCUMENT_CONTENT_TYPES)[number];
