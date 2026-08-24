"use server";

import { Prisma } from "@/lib/generated/prisma/client";
import { requireMerchant } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";
import { revalidateVouchers } from "@/lib/revalidate";
import {
  MAX_PERCENTAGE,
  MAX_VOUCHER_CODE_LENGTH,
  MIN_PERCENTAGE,
  normalizeVoucherCode,
} from "@/lib/vouchers";
import type { ActionResult } from "@/types/action";
import type { VoucherInput } from "@/types/voucher";

// A stuck save button should not be able to fill the list a hundred times a minute.
const voucherLimiter = createRateLimiter({ limit: 20, windowMs: 60_000 });

const FAILURES: Record<string, string> = {
  NOT_FOUND: "Voucher tidak ditemukan",
  CODE_TAKEN: "Kode voucher ini sudah dipakai",
};

function failureMessage(error: unknown): string | undefined {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return FAILURES.CODE_TAKEN;
  }
  return error instanceof Error ? FAILURES[error.message] : undefined;
}

type VoucherData = {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  amount: number;
  maxDiscount: number | null;
  minPurchase: number;
  usageLimit: number | null;
  expiresAt: Date | null;
  isActive: boolean;
};

type ParsedVoucher = { ok: true; data: VoucherData } | { ok: false; message: string };

function parseVoucher(input: VoucherInput): ParsedVoucher {
  const code = normalizeVoucherCode(String(input.code ?? ""));
  if (code === "") return { ok: false, message: "Kode voucher wajib diisi" };
  if (code.length > MAX_VOUCHER_CODE_LENGTH) {
    return { ok: false, message: `Kode voucher maksimal ${MAX_VOUCHER_CODE_LENGTH} karakter` };
  }

  const discountType = input.discountType;
  const amount = Number(input.amount);
  if (!Number.isInteger(amount)) return { ok: false, message: "Nilai diskon tidak valid" };
  if (discountType === "PERCENTAGE" && (amount < MIN_PERCENTAGE || amount > MAX_PERCENTAGE)) {
    return { ok: false, message: `Diskon persen harus antara ${MIN_PERCENTAGE}-${MAX_PERCENTAGE}` };
  }
  if (discountType === "FIXED" && amount <= 0) {
    return { ok: false, message: "Diskon nominal harus lebih dari 0" };
  }

  let maxDiscount: number | null = null;
  if (discountType === "PERCENTAGE" && String(input.maxDiscount ?? "").trim() !== "") {
    maxDiscount = Number(input.maxDiscount);
    if (!Number.isInteger(maxDiscount) || maxDiscount <= 0) {
      return { ok: false, message: "Diskon maksimal tidak valid" };
    }
  }

  const minPurchase = String(input.minPurchase ?? "").trim() === "" ? 0 : Number(input.minPurchase);
  if (!Number.isInteger(minPurchase) || minPurchase < 0) {
    return { ok: false, message: "Minimum belanja tidak valid" };
  }

  let usageLimit: number | null = null;
  if (String(input.usageLimit ?? "").trim() !== "") {
    usageLimit = Number(input.usageLimit);
    if (!Number.isInteger(usageLimit) || usageLimit <= 0) {
      return { ok: false, message: "Batas pemakaian tidak valid" };
    }
  }

  let expiresAt: Date | null = null;
  if (String(input.expiresAt ?? "").trim() !== "") {
    const parsed = new Date(input.expiresAt);
    if (Number.isNaN(parsed.getTime())) return { ok: false, message: "Tanggal kedaluwarsa tidak valid" };
    expiresAt = parsed;
  }

  return {
    ok: true,
    data: {
      code,
      discountType,
      amount,
      maxDiscount,
      minPurchase,
      usageLimit,
      expiresAt,
      isActive: input.isActive,
    },
  };
}

function limited(userId: number) {
  return !voucherLimiter.check(`voucher:${userId}`).allowed;
}

const LIMIT_MESSAGE = "Terlalu banyak perubahan voucher, coba lagi sebentar lagi.";

export async function createVoucher(input: VoucherInput): Promise<ActionResult> {
  const session = await requireMerchant();

  const fields = parseVoucher(input);
  if (!fields.ok) return fields;

  if (limited(session.userId)) return { ok: false, message: LIMIT_MESSAGE };

  try {
    await prisma.voucher.create({ data: { ...fields.data, userId: session.userId } });
  } catch (error) {
    const message = failureMessage(error);
    if (message) return { ok: false, message };

    console.error("[createVoucher]", error);
    return { ok: false, message: "Gagal menyimpan voucher" };
  }

  voucherLimiter.record(`voucher:${session.userId}`);
  revalidateVouchers();
  return { ok: true };
}

export async function updateVoucher(id: number, input: VoucherInput): Promise<ActionResult> {
  const session = await requireMerchant();

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: FAILURES.NOT_FOUND };
  }

  const fields = parseVoucher(input);
  if (!fields.ok) return fields;

  if (limited(session.userId)) return { ok: false, message: LIMIT_MESSAGE };

  try {
    await prisma.$transaction(async (tx) => {
      const owned = await tx.voucher.findFirst({
        where: { id, userId: session.userId },
        select: { id: true },
      });
      if (!owned) throw new Error("NOT_FOUND");

      await tx.voucher.update({ where: { id }, data: fields.data });
    });
  } catch (error) {
    const message = failureMessage(error);
    if (message) return { ok: false, message };

    console.error("[updateVoucher]", error);
    return { ok: false, message: "Gagal menyimpan voucher" };
  }

  voucherLimiter.record(`voucher:${session.userId}`);
  revalidateVouchers();
  return { ok: true };
}

export async function deleteVoucher(id: number): Promise<ActionResult> {
  const session = await requireMerchant();

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: FAILURES.NOT_FOUND };
  }

  const removed = await prisma.voucher.deleteMany({ where: { id, userId: session.userId } });
  if (removed.count === 0) return { ok: false, message: FAILURES.NOT_FOUND };

  revalidateVouchers();
  return { ok: true };
}

export async function toggleVoucherActive(id: number, isActive: boolean): Promise<ActionResult> {
  const session = await requireMerchant();

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: FAILURES.NOT_FOUND };
  }

  const updated = await prisma.voucher.updateMany({
    where: { id, userId: session.userId },
    data: { isActive },
  });
  if (updated.count === 0) return { ok: false, message: FAILURES.NOT_FOUND };

  revalidateVouchers();
  return { ok: true };
}
