import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { ACCEPTED_IMAGE_TYPES } from "./limits";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads";

// A random name plus a whitelisted extension means a crafted filename can never escape the folder.
export async function saveUploadedImage(file: File) {
  const filename = `${randomUUID()}${ACCEPTED_IMAGE_TYPES[file.type]}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(
    path.join(UPLOAD_DIR, filename),
    Buffer.from(await file.arrayBuffer()),
  );
  return `${PUBLIC_PREFIX}/${filename}`;
}

// Best-effort cleanup; a leftover byte blob is cheaper than blocking the merchant on a retry.
export async function removeUploadedImage(publicPath: string) {
  if (!publicPath.startsWith(`${PUBLIC_PREFIX}/`)) return;
  await unlink(path.join(UPLOAD_DIR, path.basename(publicPath))).catch(() => {});
}
