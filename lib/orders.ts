import { OrderStatus, PaymentMethod } from "@/types/order";
import { Role } from "@/types/user";

// Direct buy and cart checkout must refuse the same absurd quantities, so the ceiling lives beside the other order rules.
export const MAX_QUANTITY = 99;

// No gateway is wired up yet, so a method is a promise about how the buyer will pay on delivery day.
export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  [PaymentMethod.COD]: "Bayar di Tempat (COD)",
  [PaymentMethod.TRANSFER]: "Transfer Bank",
};

export const PAYMENT_DESCRIPTION: Record<PaymentMethod, string> = {
  [PaymentMethod.COD]: "Bayar tunai saat barang sampai",
  [PaymentMethod.TRANSFER]: "Transfer manual ke rekening penjual",
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

export function nextStatuses(role: Role, status: OrderStatus): OrderStatus[] {
  return moves[role][status];
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
