import { OrderStatus } from "@/types/order";
import { Role } from "@/types/user";

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
