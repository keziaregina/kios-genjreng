"use client";

import { Star } from "lucide-react";
import React from "react";

import { MAX_RATING, MIN_RATING, RATING_LABEL } from "@/lib/reviews";
import { cn } from "@/lib/utils";

type StarInputProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

// The parent owns the value the way QuantityStepper does, so the form keeps one source of truth.
const StarInput = ({ value, onChange, disabled }: StarInputProps) => (
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-1">
      {Array.from({ length: MAX_RATING }, (_, index) => index + MIN_RATING).map(
        (star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            aria-label={`Beri ${star} bintang`}
            aria-pressed={value === star}
            onClick={() => onChange(star)}
            className="disabled:opacity-50"
          >
            <Star
              size={24}
              className={cn(
                star <= value ? "fill-rating text-rating" : "text-text-secondary",
              )}
            />
          </button>
        ),
      )}
    </div>
    {value > 0 && (
      <span className="text-text-secondary text-xs font-semibold">
        {RATING_LABEL[value]}
      </span>
    )}
  </div>
);

export default StarInput;
