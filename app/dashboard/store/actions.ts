"use server";

import { requireMerchant } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { revalidateStore } from "@/lib/revalidate";
import { MAX_CITY_LENGTH, MAX_STORE_NAME_LENGTH } from "@/lib/store";
import type { ActionResult } from "@/types/action";
import type { StoreInput } from "@/types/store";

type StoreData = { storeName: string | null; city: string | null };

type ParsedStore = { ok: true; data: StoreData } | { ok: false; message: string };

function parseStore(input: StoreInput): ParsedStore {
  const storeName = String(input.storeName ?? "").trim();
  const city = String(input.city ?? "").trim();

  if (storeName.length > MAX_STORE_NAME_LENGTH) {
    return { ok: false, message: `Nama toko maksimal ${MAX_STORE_NAME_LENGTH} karakter` };
  }
  if (city.length > MAX_CITY_LENGTH) {
    return { ok: false, message: `Kota maksimal ${MAX_CITY_LENGTH} karakter` };
  }

  return { ok: true, data: { storeName: storeName || null, city: city || null } };
}

export async function updateStore(input: StoreInput): Promise<ActionResult> {
  const session = await requireMerchant();

  const fields = parseStore(input);
  if (!fields.ok) return fields;

  try {
    await prisma.user.update({ where: { id: session.userId }, data: fields.data });
  } catch (error) {
    console.error("[updateStore]", error);
    return { ok: false, message: "Gagal menyimpan profil toko" };
  }

  revalidateStore();
  return { ok: true };
}
