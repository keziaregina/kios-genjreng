import Link from "next/link";
import React from "react";

import { formatOrderDate } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import type { OrderWithRelations } from "@/types/order";

import StatusBadge from "./StatusBadge";

type OrderCardProps = {
  order: OrderWithRelations;
  counterparty: string;
  children?: React.ReactNode;
};

// The counterparty label flips per side: a buyer reads the seller, a seller reads the buyer.
const OrderCard = ({ order, counterparty, children }: OrderCardProps) => (
  <li className="bg-quarternary flex flex-col gap-2 rounded-xl px-4 py-3">
    <Link
      href={`/dashboard/orders/${order.id}`}
      aria-label={`Lihat pesanan #${order.id}`}
      className="flex flex-col gap-2 active:opacity-80"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-text-secondary text-xs">
          #{order.id} · {formatOrderDate(order.createdAt)}
        </span>
        <StatusBadge status={order.status} />
      </div>

      <ul className="flex flex-col gap-0.5">
        {order.items.map((item) => (
          <li key={item.id} className="text-text-primary truncate text-sm font-semibold">
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-2">
        <span className="text-text-secondary truncate text-xs">{counterparty}</span>
        <span className="text-button-primary shrink-0 text-sm font-bold">
          {formatPrice(order.total)}
        </span>
      </div>
    </Link>

    {children}
  </li>
);

export default OrderCard;
