import { OrderStatus, PaymentMethod } from "@/types/order";
import { PaymentStatus } from "@/types/payment";
import { Role } from "@/types/user";

// Direct buy and cart checkout must refuse the same absurd quantities, so the ceiling lives beside the other order rules.
export const MAX_QUANTITY = 99;

// Only CARD collects money at checkout; the other two are still a promise about how the buyer will pay later.
export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  [PaymentMethod.COD]: "Bayar di Tempat (COD)",
  [PaymentMethod.TRANSFER]: "Transfer Bank",
  [PaymentMethod.CARD]: "Kartu Kredit/Debit",
};

export const PAYMENT_DESCRIPTION: Record<PaymentMethod, string> = {
  [PaymentMethod.COD]: "Bayar tunai saat barang sampai",
  [PaymentMethod.TRANSFER]: "Transfer manual ke rekening penjual",
  [PaymentMethod.CARD]: "Bayar sekarang di halaman Stripe (mode uji)",
};

// A card order carries a gateway state the other methods do not, so it gets its own label table.
export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  [PaymentStatus.REQUIRES_PAYMENT]: "Belum dibayar",
  [PaymentStatus.PROCESSING]: "Sedang diproses",
  [PaymentStatus.SUCCEEDED]: "Lunas",
  [PaymentStatus.FAILED]: "Gagal",
  [PaymentStatus.CANCELLED]: "Dibatalkan",
};

// Every legal move lives in one table so the buttons and the server guard can never disagree.
const moves: Record<Role, Record<OrderStatus, OrderStatus[]>> = {
  [Role.MERCHANT]: {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELLED]: [],
  },
  [Role.BUYER]: {
    [OrderStatus.PENDING]: [OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [],
    [OrderStatus.SHIPPED]: [],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELLED]: [],
  },
};

// A card order is settled by Stripe; COD and transfer are settled off-platform, so they count as paid from the start.
export function isOrderPaid(order: {
  paymentMethod: PaymentMethod;
  payment: { status: PaymentStatus } | null;
}): boolean {
  if (order.paymentMethod !== PaymentMethod.CARD) return true;
  return order.payment?.status === PaymentStatus.SUCCEEDED;
}

export function nextStatuses(
  role: Role,
  status: OrderStatus,
  paid = true,
): OrderStatus[] {
  const legal = moves[role][status];
  // Everything but cancelling is withheld while a card order is unpaid, or a merchant ships goods nobody paid for.
  return paid ? legal : legal.filter((next) => next === OrderStatus.CANCELLED);
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Menunggu",
  [OrderStatus.CONFIRMED]: "Dikonfirmasi",
  [OrderStatus.SHIPPED]: "Dikirim",
  [OrderStatus.COMPLETED]: "Selesai",
  [OrderStatus.CANCELLED]: "Dibatalkan",
};

/** Label for the button that moves an order *into* this status. */
export const STATUS_ACTION_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Kembalikan",
  [OrderStatus.CONFIRMED]: "Konfirmasi",
  [OrderStatus.SHIPPED]: "Kirim",
  [OrderStatus.COMPLETED]: "Selesaikan",
  [OrderStatus.CANCELLED]: "Batalkan",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

// Order cards all stamp the same way, so the formatter lives beside the other order helpers.
export function formatOrderDate(date: Date) {
  return dateFormatter.format(date);
}
