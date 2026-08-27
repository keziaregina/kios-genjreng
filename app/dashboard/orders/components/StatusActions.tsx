"use client";

import React, { useTransition } from "react";

import { updateOrderStatus } from "@/app/dashboard/orders/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { STATUS_ACTION_LABEL, STATUS_LABEL, nextStatuses } from "@/lib/orders";
import { OrderStatus } from "@/types/order";
import type { Role } from "@/types/user";

type StatusActionsProps = {
  orderId: number;
  status: OrderStatus;
  side: Role;
  paid: boolean;
};

// The server re-checks the same transition table, so a stale button cannot force an illegal move.
const StatusActions = ({ orderId, status, side, paid }: StatusActionsProps) => {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const moves = nextStatuses(side, status, paid);
  if (moves.length === 0) return null;

  const handleMove = (next: OrderStatus) => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      if (result.ok) toast.success(`Pesanan ${STATUS_LABEL[next].toLowerCase()}`);
      else toast.error(result.message);
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {moves.map((next) => (
        <Button
          key={next}
          type="button"
          size="sm"
          variant={next === OrderStatus.CANCELLED ? "selected" : "default"}
          disabled={pending}
          onClick={() => handleMove(next)}
        >
          {STATUS_ACTION_LABEL[next]}
        </Button>
      ))}
    </div>
  );
};

export default StatusActions;
