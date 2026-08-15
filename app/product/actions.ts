"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export type CreateProductInput = {
  name: string;
  price: number;
  categoryId: number;
  userId: number;
};

export type ActionResult = { ok: true } | { ok: false; message: string };

export async function createProduct(
  input: CreateProductInput,
): Promise<ActionResult> {
  const name = input.name?.trim();

  if (!name) return { ok: false, message: "Nama produk wajib diisi" };
  if (!Number.isInteger(input.price) || input.price < 0) {
    return { ok: false, message: "Harga harus bilangan bulat >= 0" };
  }
  if (!input.categoryId) return { ok: false, message: "Kategori wajib dipilih" };
  if (!input.userId) return { ok: false, message: "Penjual wajib dipilih" };

  try {
    await prisma.product.create({
      data: {
        name,
        price: input.price,
        categoryId: input.categoryId,
        userId: input.userId,
      },
    });
  } catch (error) {
    console.error("[createProduct]", error);
    return { ok: false, message: "Gagal menyimpan produk" };
  }

  revalidatePath("/product");
  return { ok: true };
}
