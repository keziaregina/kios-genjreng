import React from "react";

import { STATUS_LABEL } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types/order";

// Colour carries the same meaning as the label so a glance down the list is enough.
const tone: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-quarternary text-text-secondary",
  [OrderStatus.CONFIRMED]: "bg-quarternary text-text-primary",
  [OrderStatus.SHIPPED]: "bg-rating/20 text-rating",
  [OrderStatus.COMPLETED]: "bg-success/20 text-success",
  [OrderStatus.CANCELLED]: "bg-button-primary/20 text-button-primary",
};

const StatusBadge = ({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
      tone[status],
      className,
    )}
  >
    {STATUS_LABEL[status]}
  </span>
);

export default StatusBadge;
