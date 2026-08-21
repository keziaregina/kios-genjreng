import { MapPin, StickyNote } from "lucide-react";
import React from "react";

import type { Order } from "@/types/order";

// Orders placed before checkout collected an address keep null columns, so every field reads with a fallback.
const OrderShipping = ({ order }: { order: Order }) => (
  <div className="flex flex-col gap-2">
    <div className="flex gap-3">
      <MapPin aria-hidden className="text-text-secondary size-4 shrink-0" />
      <div className="flex min-w-0 flex-col">
        <span className="text-text-primary text-xs font-semibold">
          {order.shipRecipient ?? "Penerima tidak tercatat"}
          {order.shipPhone ? ` · ${order.shipPhone}` : ""}
        </span>
        <span className="text-text-secondary text-xs">
          {order.shipAddress ?? "Alamat tidak tercatat"}
        </span>
      </div>
    </div>

    {order.note && (
      <div className="flex gap-3">
        <StickyNote aria-hidden className="text-text-secondary size-4 shrink-0" />
        <span className="text-text-secondary text-xs italic">{order.note}</span>
      </div>
    )}
  </div>
);

export default OrderShipping;
