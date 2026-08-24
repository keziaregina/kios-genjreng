import type { Voucher as VoucherModel } from "@/lib/generated/prisma/client";
import { DiscountType } from "@/lib/generated/prisma/enums";

/** Row shape of `Voucher`. Derived from prisma/schema.prisma — never hand-edit. */
export type Voucher = VoucherModel;

export { DiscountType };

/** What the voucher form sends: every numeric/date field as a raw string, checked server-side. */
export type VoucherInput = {
  code: string;
  discountType: DiscountType;
  amount: string;
  maxDiscount: string;
  minPurchase: string;
  usageLimit: string;
  expiresAt: string;
  isActive: boolean;
};
