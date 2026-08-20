"use client";

import React, { useState, useTransition } from "react";

import { updateOrderStatus } from "@/app/dashboard/orders/actions";
import { Button } from "@/components/ui/button";
import { STATUS_ACTION_LABEL, nextStatuses } from "@/lib/orders";
import { OrderStatus } from "@/types/order";
import type { Role } from "@/types/user";

type StatusActionsProps = {
  orderId: number;
  status: OrderStatus;
  side: Role;
};

// The server re-checks the same transition table, so a stale button cannot force an illegal move.
const StatusActions = ({ orderId, status, side }: StatusActionsProps) => {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const moves = nextStatuses(side, status);
  if (moves.length === 0) return null;

  const handleMove = (next: OrderStatus) => {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      if (!result.ok) setError(result.message);
    });
  };

  return (
    <div className="flex flex-col gap-2">
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
      {error && <p className="text-button-primary text-xs">{error}</p>}
    </div>
  );
};

export default StatusActions;
