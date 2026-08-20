import React from "react";

import StarRating from "@/components/StarRating";
import { formatOrderDate } from "@/lib/orders";
import type { ReviewWithBuyer } from "@/types/review";

type ReviewListProps = { reviews: ReviewWithBuyer[] };

// Reviews are the only source of a rating now, so an empty list has to read as new, not broken.
const ReviewList = ({ reviews }: ReviewListProps) => (
  <section className="mt-[21px]">
    <h2 className="text-text-primary mb-[11px] text-sm font-bold">Ulasan Pembeli</h2>

    {reviews.length === 0 ? (
      <p className="text-text-secondary text-sm">Belum ada ulasan.</p>
    ) : (
      <ul className="flex flex-col gap-[11px]">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="bg-quarternary flex flex-col gap-1 rounded-xl px-4 py-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-text-primary truncate text-sm font-semibold">
                {review.buyer.name}
              </span>
              <StarRating value={review.rating} />
            </div>
            <span className="text-text-secondary text-xs">
              {formatOrderDate(review.createdAt)}
            </span>
            {review.comment && (
              <p className="text-text-primary text-sm">{review.comment}</p>
            )}
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default ReviewList;
