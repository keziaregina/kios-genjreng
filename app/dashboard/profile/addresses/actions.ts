"use server";

import {
  ADDRESS_FIELDS,
  MAX_ADDRESSES,
  MAX_ADDRESS_NOTE_LENGTH,
  type AddressFieldKey,
} from "@/lib/addresses";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";
import { revalidateAddresses } from "@/lib/revalidate";
import type { ActionResult } from "@/types/action";
import type { AddressInput } from "@/types/address";

// A stuck save button should not be able to fill the list a hundred times a minute.
const addressLimiter = createRateLimiter({ limit: 20, windowMs: 60_000 });

const FAILURES: Record<string, string> = {
  NOT_FOUND: "Alamat tidak ditemukan",
  LIST_FULL: `Maksimal ${MAX_ADDRESSES} alamat tersimpan`,
};

function failureMessage(error: unknown): string | undefined {
  return error instanceof Error ? FAILURES[error.message] : undefined;
}

type AddressData = Record<AddressFieldKey, string> & { note: string | null };

type ParsedAddress = { ok: true; data: AddressData } | { ok: false; message: string };

function parseAddress(input: AddressInput): ParsedAddress {
  const values = {} as Record<AddressFieldKey, string>;

  for (const field of ADDRESS_FIELDS) {
    const value = String(input[field.key] ?? "").trim();

    if (value === "") return { ok: false, message: `${field.label} wajib diisi` };
    if (value.length > field.max) {
      return { ok: false, message: `${field.label} maksimal ${field.max} karakter` };
    }

    values[field.key] = value;
  }

  const note = String(input.note ?? "").trim();
  if (note.length > MAX_ADDRESS_NOTE_LENGTH) {
    return { ok: false, message: `Catatan maksimal ${MAX_ADDRESS_NOTE_LENGTH} karakter` };
  }

  return { ok: true, data: { ...values, note: note === "" ? null : note } };
}

function limited(userId: number) {
  return !addressLimiter.check(`address:${userId}`).allowed;
}

const LIMIT_MESSAGE = "Terlalu banyak perubahan alamat, coba lagi sebentar lagi.";

export async function createAddress(input: AddressInput): Promise<ActionResult> {
  const session = await requireUser();

  const fields = parseAddress(input);
  if (!fields.ok) return fields;

  if (limited(session.userId)) return { ok: false, message: LIMIT_MESSAGE };

  try {
    await prisma.$transaction(async (tx) => {
      const saved = await tx.address.count({ where: { userId: session.userId } });
      if (saved >= MAX_ADDRESSES) throw new Error("LIST_FULL");

      // The first address has to be the default, otherwise checkout opens with nothing selected.
      const isDefault = input.isDefault || saved === 0;
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId: session.userId },
          data: { isDefault: false },
        });
      }

      await tx.address.create({
        data: { ...fields.data, userId: session.userId, isDefault },
      });
    });
  } catch (error) {
    const message = failureMessage(error);
    if (message) return { ok: false, message };

    console.error("[createAddress]", error);
    return { ok: false, message: "Gagal menyimpan alamat" };
  }

  addressLimiter.record(`address:${session.userId}`);
  revalidateAddresses();
  return { ok: true };
}

export async function updateAddress(
  id: number,
  input: AddressInput,
): Promise<ActionResult> {
  const session = await requireUser();

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: FAILURES.NOT_FOUND };
  }

  const fields = parseAddress(input);
  if (!fields.ok) return fields;

  if (limited(session.userId)) return { ok: false, message: LIMIT_MESSAGE };

  try {
    await prisma.$transaction(async (tx) => {
      const owned = await tx.address.findFirst({
        where: { id, userId: session.userId },
        select: { isDefault: true },
      });

      if (!owned) throw new Error("NOT_FOUND");

      // A default is moved to another address, never switched off, or checkout loses its preselection.
      const isDefault = owned.isDefault || input.isDefault;
      if (isDefault && !owned.isDefault) {
        await tx.address.updateMany({
          where: { userId: session.userId },
          data: { isDefault: false },
        });
      }

      await tx.address.update({ where: { id }, data: { ...fields.data, isDefault } });
    });
  } catch (error) {
    const message = failureMessage(error);
    if (message) return { ok: false, message };

    console.error("[updateAddress]", error);
    return { ok: false, message: "Gagal menyimpan alamat" };
  }

  addressLimiter.record(`address:${session.userId}`);
  revalidateAddresses();
  return { ok: true };
}

export async function deleteAddress(id: number): Promise<ActionResult> {
  const session = await requireUser();

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: FAILURES.NOT_FOUND };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const removed = await tx.address.deleteMany({
        where: { id, userId: session.userId },
      });

      if (removed.count === 0) throw new Error("NOT_FOUND");

      // Deleting the default would leave checkout unselected, so the oldest survivor takes over.
      const defaults = await tx.address.count({
        where: { userId: session.userId, isDefault: true },
      });
      if (defaults > 0) return;

      const oldest = await tx.address.findFirst({
        where: { userId: session.userId },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      if (oldest) {
        await tx.address.update({ where: { id: oldest.id }, data: { isDefault: true } });
      }
    });
  } catch (error) {
    const message = failureMessage(error);
    if (message) return { ok: false, message };

    console.error("[deleteAddress]", error);
    return { ok: false, message: "Gagal menghapus alamat" };
  }

  revalidateAddresses();
  return { ok: true };
}

export async function setDefaultAddress(id: number): Promise<ActionResult> {
  const session = await requireUser();

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: FAILURES.NOT_FOUND };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const owned = await tx.address.findFirst({
        where: { id, userId: session.userId },
        select: { id: true },
      });

      if (!owned) throw new Error("NOT_FOUND");

      await tx.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
      await tx.address.update({ where: { id }, data: { isDefault: true } });
    });
  } catch (error) {
    const message = failureMessage(error);
    if (message) return { ok: false, message };

    console.error("[setDefaultAddress]", error);
    return { ok: false, message: "Gagal mengubah alamat utama" };
  }

  revalidateAddresses();
  return { ok: true };
}
