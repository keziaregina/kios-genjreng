"use server";

import { requireUser } from "@/lib/auth/guards";
import { getVoucherByCode } from "@/lib/queries";
import { createRateLimiter } from "@/lib/rate-limit";
import { computeDiscount, normalizeVoucherCode } from "@/lib/vouchers";

// Guessing codes across merchants should not be free, so previews are rate-limited too.
const previewLimiter = createRateLimiter({ limit: 20, windowMs: 60_000 });

const FAILURES = {
  NOT_FOUND: "Kode voucher tidak ditemukan",
  EXPIRED: "Voucher sudah kedaluwarsa",
  MIN_PURCHASE: "Belanja belum mencapai minimum voucher ini",
  USAGE_LIMIT: "Voucher sudah mencapai batas pemakaian",
};

// "Apply" is a preview: it validates and prices the code but writes nothing, so checkout stays the only place money moves.
export async function previewVoucher(
  merchantId: number,
  rawCode: string,
  subtotal: number,
): Promise<{ ok: true; discount: number } | { ok: false; message: string }> {
  const session = await requireUser();

  if (!Number.isInteger(merchantId) || merchantId <= 0) {
    return { ok: false, message: FAILURES.NOT_FOUND };
  }

  const key = `voucherApply:${session.userId}`;
  if (!previewLimiter.check(key).allowed) {
    return { ok: false, message: "Terlalu banyak percobaan kode, coba lagi sebentar lagi." };
  }
  previewLimiter.record(key);

  const code = normalizeVoucherCode(String(rawCode ?? ""));
  if (code === "") return { ok: false, message: FAILURES.NOT_FOUND };

  const voucher = await getVoucherByCode(merchantId, code);
  if (!voucher || !voucher.isActive) return { ok: false, message: FAILURES.NOT_FOUND };
  if (voucher.expiresAt && voucher.expiresAt < new Date()) {
    return { ok: false, message: FAILURES.EXPIRED };
  }
  if (subtotal < voucher.minPurchase) return { ok: false, message: FAILURES.MIN_PURCHASE };
  if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
    return { ok: false, message: FAILURES.USAGE_LIMIT };
  }

  return { ok: true, discount: computeDiscount(voucher, subtotal) };
}
