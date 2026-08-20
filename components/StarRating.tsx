import { Star } from "lucide-react";
import React from "react";

import { MAX_RATING } from "@/lib/reviews";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  size?: number;
  className?: string;
};

// Averages land on halves, so the row rounds to whole stars and leaves the exact number to the label beside it.
const StarRating = ({ value, size = 12, className }: StarRatingProps) => (
  <span
    className={cn("flex items-center gap-0.5", className)}
    aria-label={`${value.toFixed(1)} dari ${MAX_RATING} bintang`}
  >
    {Array.from({ length: MAX_RATING }, (_, index) => (
      <Star
        key={index}
        size={size}
        className={cn(
          index < Math.round(value)
            ? "fill-rating text-rating"
            : "text-text-secondary",
        )}
      />
    ))}
  </span>
);

export default StarRating;
