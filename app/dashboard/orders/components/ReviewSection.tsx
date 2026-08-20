import React from "react";

import type { OrderWithRelations } from "@/types/order";

import ReviewForm from "./ReviewForm";

type ReviewSectionProps = { order: OrderWithRelations };

// A review is written once, so a product already rated drops its form and keeps the receipt line.
const ReviewSection = ({ order }: ReviewSectionProps) => {
  const reviewed = new Set(order.reviews.map((review) => review.productId));

  return (
    <section className="mt-[21px] flex flex-col gap-2">
      <h2 className="text-text-primary text-sm font-bold">Ulasan</h2>

      {order.items.map((item) =>
        reviewed.has(item.productId) ? (
          <p key={item.id} className="text-text-secondary text-xs">
            {item.name} — sudah diulas
          </p>
        ) : (
          <ReviewForm
            key={item.id}
            orderId={order.id}
            productId={item.productId}
            productName={item.name}
          />
        ),
      )}
    </section>
  );
};

export default ReviewSection;
