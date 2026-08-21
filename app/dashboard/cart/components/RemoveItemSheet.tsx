"use client";

import { Star } from "lucide-react";
import React from "react";

import ProductImage from "@/components/ProductImage";
import { formatPrice } from "@/lib/utils";
import type { CartItemWithProduct } from "@/types/cart";

import ConfirmSheet from "./ConfirmSheet";

type RemoveItemSheetProps = {
  item: CartItemWithProduct;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

// Deleting a row is one tap away from the stepper, so the buyer gets to see what is about to leave the cart.
const RemoveItemSheet = ({
  item,
  open,
  pending,
  onOpenChange,
  onConfirm,
}: RemoveItemSheetProps) => {
  const product = item.product;

  return (
    <ConfirmSheet
      open={open}
      pending={pending}
      title="Hapus item ini?"
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    >
      <div className="bg-quarternary flex items-stretch gap-3 overflow-hidden rounded-2xl">
        <ProductImage
          src={product.image}
          alt={product.name}
          sizes="110px"
          iconSize={28}
          className="bg-primary size-[110px] shrink-0"
        />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-[2px] py-3 pr-3">
          <div className="flex items-start gap-2">
            <p className="text-text-primary line-clamp-2 flex-1 text-sm font-bold">
              {product.name}
            </p>
            {product.rating !== null && product.reviewCount > 0 && (
              <span className="text-text-primary flex shrink-0 items-center gap-1 text-[11px] font-semibold">
                <Star size={11} className="fill-rating text-rating" />
                {product.rating.toFixed(1)}
              </span>
            )}
          </div>

          {product.weight !== null && (
            <p className="text-text-secondary truncate text-[11px]">
              Berat Satuan: {product.weight} kg
            </p>
          )}

          <p className="text-text-primary mt-1 text-base font-extrabold">
            {formatPrice(product.price * item.quantity)}
          </p>
        </div>
      </div>
    </ConfirmSheet>
  );
};

export default RemoveItemSheet;
