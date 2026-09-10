import { randomUUID } from "node:crypto";

import { del, put } from "@vercel/blob";

import { ACCEPTED_IMAGE_TYPES } from "./limits";

const BLOB_PREFIX = "products/";

// A random name plus a whitelisted extension means a crafted filename can never escape the folder.
export async function saveUploadedImage(file: File) {
  const filename = `${BLOB_PREFIX}${randomUUID()}${ACCEPTED_IMAGE_TYPES[file.type]}`;
  const blob = await put(filename, file, { access: "public" });
  return blob.url;
}

// Best-effort cleanup; a leftover byte blob is cheaper than blocking the merchant on a retry.
export async function removeUploadedImage(publicPath: string) {
  if (!publicPath.startsWith("https://")) return;
  await del(publicPath).catch(() => {});
}
