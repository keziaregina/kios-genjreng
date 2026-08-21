"use client";

import { Minus, Plus } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuantityStepperProps = {
  value: number;
  max: number;
  onChange: (next: number) => void;
  min?: number;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  tone?: "muted" | "brand";
};

// The product page and the cart move quantities the same way, so the clamp lives in one control.
const QuantityStepper = ({
  value,
  max,
  onChange,
  min = 1,
  disabled,
  orientation = "horizontal",
  tone = "muted",
}: QuantityStepperProps) => {
  const step = (by: number) => onChange(Math.min(Math.max(value + by, min), max));

  const buttonProps =
    tone === "brand"
      ? ({ size: "icon-sm", variant: "outline" } as const)
      : ({ size: "icon-sm", variant: "selected" } as const);

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        // Reversing keeps plus on top like the mockup while the DOM order stays minus-value-plus for tabbing.
        orientation === "vertical" && "flex-col-reverse gap-1",
      )}
    >
      <Button
        type="button"
        {...buttonProps}
        aria-label="Kurangi jumlah"
        disabled={disabled || value <= min}
        onClick={() => step(-1)}
      >
        <Minus />
      </Button>
      <span className="text-text-primary w-6 text-center font-semibold">{value}</span>
      <Button
        type="button"
        {...buttonProps}
        aria-label="Tambah jumlah"
        disabled={disabled || value >= max}
        onClick={() => step(1)}
      >
        <Plus />
      </Button>
    </div>
  );
};

export default QuantityStepper;
