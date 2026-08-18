"use server";

import { revalidatePath } from "next/cache";

import { requireMerchant } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types/action";

export type CreateProductInput = {
  name: string;
  price: number;
  categoryId: number;
};

export async function createProduct(
  input: CreateProductInput,
): Promise<ActionResult> {
  // Ownership comes from the session, never from the submitted form.
  const session = await requireMerchant();
  const name = input.name?.trim();

  if (!name) return { ok: false, message: "Nama produk wajib diisi" };
  if (!Number.isInteger(input.price) || input.price < 0) {
    return { ok: false, message: "Harga harus bilangan bulat >= 0" };
  }
  if (!input.categoryId) return { ok: false, message: "Kategori wajib dipilih" };

  try {
    await prisma.product.create({
      data: {
        name,
        price: input.price,
        categoryId: input.categoryId,
        userId: session.userId,
      },
    });
  } catch (error) {
    console.error("[createProduct]", error);
    return { ok: false, message: "Gagal menyimpan produk" };
  }

  revalidatePath("/product");
  revalidatePath("/dashboard/store");
  return { ok: true };
}
