// Extension comes from this map, never from the filename the browser sent.
export const ACCEPTED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const IMAGE_ACCEPT = Object.keys(ACCEPTED_IMAGE_TYPES).join(",");
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// Form and action reject with the same sentence, so client and server never disagree.
export function validateImageFile(file: { type: string; size: number }) {
  if (!ACCEPTED_IMAGE_TYPES[file.type]) {
    return "Format foto harus JPG, PNG, atau WEBP";
  }
  if (file.size > MAX_IMAGE_BYTES) return "Ukuran foto maksimal 2MB";
  return null;
}
