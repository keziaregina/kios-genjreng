import type { PaymentMethod } from "./order";

/** One merchant block of the checkout form — becomes exactly one `Order` row. */
export type CheckoutGroupInput = {
  merchantId: number;
  courierId: string;
  note: string;
  protection: boolean;
  voucherCode: string | null;
};

/** What the checkout form sends. Every price is recomputed server-side, so no money travels in here. */
export type CheckoutInput = {
  addressId: number;
  paymentMethod: PaymentMethod;
  itemIds: number[];
  groups: CheckoutGroupInput[];
};
