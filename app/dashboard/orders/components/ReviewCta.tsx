import Link from "next/link";
import React from "react";

import { buttonVariants } from "@/components/ui/button";
import { OrderStatus, type OrderWithRelations } from "@/types/order";

type ReviewCtaProps = { order: OrderWithRelations };

// The card only nudges while something is still unrated, so a fully reviewed order stops asking.
const ReviewCta = ({ order }: ReviewCtaProps) => {
  if (order.status !== OrderStatus.COMPLETED) return null;

  const reviewed = new Set(order.reviews.map((review) => review.productId));
  if (order.items.every((item) => reviewed.has(item.productId))) return null;

  return (
    <Link
      href={`/dashboard/orders/${order.id}`}
      className={buttonVariants({ size: "sm", className: "self-start" })}
    >
      Beri Ulasan
    </Link>
  );
};

export default ReviewCta;
