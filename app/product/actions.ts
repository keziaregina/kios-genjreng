"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireMerchant } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { validateImageFile } from "@/lib/upload/limits";
import { removeUploadedImage, saveUploadedImage } from "@/lib/upload/save";
import type { ActionResult } from "@/types/action";

const STORE_PATH = "/dashboard/store";

type ProductFields = {
  name: string;
  price: number;
  categoryId: number;
  weight: number | null;
  rating: number | null;
  stock: number;
};

type ParsedFields =
  | ({ ok: true } & ProductFields)
  | { ok: false; message: string };

// Create and update read the same fields, so they share one parser.
function parseFields(formData: FormData): ParsedFields {
  const name = String(formData.get("name") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const categoryRaw = String(formData.get("categoryId") ?? "").trim();
  const weightRaw = String(formData.get("weight") ?? "").trim();
  const ratingRaw = String(formData.get("rating") ?? "").trim();
  const stockRaw = String(formData.get("stock") ?? "").trim();

  if (!name) return { ok: false, message: "Nama produk wajib diisi" };
  if (!priceRaw) return { ok: false, message: "Harga wajib diisi" };

  const price = Number(priceRaw);
  const categoryId = Number(categoryRaw);

  if (!Number.isInteger(price) || price < 0) {
    return { ok: false, message: "Harga harus bilangan bulat >= 0" };
  }
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { ok: false, message: "Kategori wajib dipilih" };
  }

  // Weight, rating, and stock are optional, so an empty box clears the column.
  const weight = weightRaw === "" ? null : Number(weightRaw);
  const rating = ratingRaw === "" ? null : Number(ratingRaw);
  const stock = stockRaw === "" ? 0 : Number(stockRaw);

  if (weight !== null && (!Number.isInteger(weight) || weight < 0)) {
    return { ok: false, message: "Berat harus bilangan bulat >= 0" };
  }
  if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 5)) {
    return { ok: false, message: "Rating harus antara 0 dan 5" };
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return { ok: false, message: "Stok harus bilangan bulat >= 0" };
  }

  return { ok: true, name, price, categoryId, weight, rating, stock };
}

type ReadImage = { path: string | null; message?: string };

// The client already checked this, but the client is not the security boundary.
async function readImage(formData: FormData): Promise<ReadImage> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { path: null };

  const invalid = validateImageFile(file);
  if (invalid) return { path: null, message: invalid };

  return { path: await saveUploadedImage(file) };
}

// A merchant may only ever touch rows that are already theirs.
async function findOwnedProduct(id: number, userId: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, userId: true, image: true },
  });
  if (!product || product.userId !== userId) return null;
  return product;
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  // Ownership comes from the session, never from the submitted form.
  const session = await requireMerchant();

  const fields = parseFields(formData);
  if (!fields.ok) return fields;

  const image = await readImage(formData);
  if (image.message) return { ok: false, message: image.message };

  try {
    await prisma.product.create({
      data: {
        name: fields.name,
        price: fields.price,
        categoryId: fields.categoryId,
        weight: fields.weight,
        rating: fields.rating,
        stock: fields.stock,
        userId: session.userId,
        image: image.path,
      },
    });
  } catch (error) {
    // The row is the source of truth, so a failed insert takes its orphan file with it.
    if (image.path) await removeUploadedImage(image.path);
    console.error("[createProduct]", error);
    return { ok: false, message: "Gagal menyimpan produk" };
  }

  revalidatePath(STORE_PATH);
  redirect(STORE_PATH);
}

export async function updateProduct(formData: FormData): Promise<ActionResult> {
  const session = await requireMerchant();

  const id = Number(String(formData.get("id") ?? ""));
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "Produk tidak ditemukan" };
  }

  const existing = await findOwnedProduct(id, session.userId);
  if (!existing) return { ok: false, message: "Produk tidak ditemukan" };

  const fields = parseFields(formData);
  if (!fields.ok) return fields;

  const image = await readImage(formData);
  if (image.message) return { ok: false, message: image.message };

  const cleared = formData.get("removeImage") === "1";
  const nextImage = image.path ?? (cleared ? null : existing.image);

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: fields.name,
        price: fields.price,
        categoryId: fields.categoryId,
        weight: fields.weight,
        rating: fields.rating,
        stock: fields.stock,
        image: nextImage,
      },
    });
  } catch (error) {
    if (image.path) await removeUploadedImage(image.path);
    console.error("[updateProduct]", error);
    return { ok: false, message: "Gagal menyimpan perubahan" };
  }

  // Only drop the old file once the row that referenced it is gone.
  if (existing.image && existing.image !== nextImage) {
    await removeUploadedImage(existing.image);
  }

  revalidatePath(STORE_PATH);
  revalidatePath(`/dashboard/product/${id}`);
  redirect(STORE_PATH);
}

export async function deleteProduct(id: number): Promise<ActionResult> {
  const session = await requireMerchant();

  const existing = await findOwnedProduct(id, session.userId);
  if (!existing) return { ok: false, message: "Produk tidak ditemukan" };

  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    console.error("[deleteProduct]", error);
    return { ok: false, message: "Gagal menghapus produk" };
  }

  if (existing.image) await removeUploadedImage(existing.image);

  revalidatePath(STORE_PATH);
  redirect(STORE_PATH);
}
