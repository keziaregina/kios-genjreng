import type { DiscountType } from "@/types/voucher";

export const MAX_VOUCHER_CODE_LENGTH = 20;
export const MIN_PERCENTAGE = 1;
export const MAX_PERCENTAGE = 100;

// Codes are compared case-insensitively, so the form and the server both normalize the same way before matching.
export function normalizeVoucherCode(raw: string) {
  return raw.trim().toUpperCase();
}

// Client preview and server checkout both call this, so the discount shown never diverges from the discount charged.
export function computeDiscount(
  voucher: { discountType: DiscountType; amount: number; maxDiscount: number | null },
  subtotal: number,
) {
  if (voucher.discountType === "FIXED") return Math.min(voucher.amount, subtotal);
  const raw = Math.floor((subtotal * voucher.amount) / 100);
  const capped = voucher.maxDiscount !== null ? Math.min(raw, voucher.maxDiscount) : raw;
  return Math.min(capped, subtotal);
}
