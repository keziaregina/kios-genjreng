"use client";

import { Minus, Plus } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

type QuantityStepperProps = {
  value: number;
  max: number;
  onChange: (next: number) => void;
  min?: number;
  disabled?: boolean;
};

// The product page and the cart move quantities the same way, so the clamp lives in one control.
const QuantityStepper = ({
  value,
  max,
  onChange,
  min = 1,
  disabled,
}: QuantityStepperProps) => {
  const step = (by: number) => onChange(Math.min(Math.max(value + by, min), max));

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        size="icon-sm"
        variant="selected"
        aria-label="Kurangi jumlah"
        disabled={disabled || value <= min}
        onClick={() => step(-1)}
      >
        <Minus />
      </Button>
      <span className="text-text-primary w-6 text-center font-semibold">{value}</span>
      <Button
        type="button"
        size="icon-sm"
        variant="selected"
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
