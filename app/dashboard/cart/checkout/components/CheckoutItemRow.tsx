"use client";

import React, { useState, useTransition } from "react";

import { updateCartItemQuantity } from "@/app/dashboard/cart/actions";
import ProductImage from "@/components/ProductImage";
import QuantityStepper from "@/components/QuantityStepper";
import { cartItemTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import type { CartItemWithProduct } from "@/types/cart";

// The spec line only shows what the merchant actually filled in, so a sparse product never prints empty separators.
function specLine(product: CartItemWithProduct["product"]) {
  return [
    product.weight != null ? `${product.weight} kg` : null,
    product.warranty ? `garansi ${product.warranty}` : null,
    product.material,
  ]
    .filter(Boolean)
    .join(", ");
}

const CheckoutItemRow = ({ item }: { item: CartItemWithProduct }) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const product = item.product;
  const specs = specLine(product);

  const changeQuantity = (next: number) => {
    const previous = quantity;
    setQuantity(next);
    setError(null);
    startTransition(async () => {
      const result = await updateCartItemQuantity(item.id, next);
      if (!result.ok) {
        setQuantity(previous);
        setError(result.message);
      }
    });
  };

  return (
    <li className="bg-quarternary flex flex-col gap-2 rounded-xl px-4 py-3">
      <div className="flex gap-3">
        <ProductImage
          src={product.image}
          alt={product.name}
          sizes="72px"
          iconSize={24}
          className="size-[72px] rounded-[10px]"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-text-primary truncate text-sm font-semibold">
            {product.name}
          </p>
          {specs && <p className="text-text-secondary text-xs">{specs}</p>}
          <p className="text-button-primary text-sm font-bold">
            {formatPrice(cartItemTotal({ ...item, quantity }))}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-text-secondary text-xs">
          {formatPrice(product.price)} per unit
        </span>
        <QuantityStepper
          value={quantity}
          max={Math.max(product.stock, 1)}
          onChange={changeQuantity}
          disabled={pending}
        />
      </div>

      {error && <p className="text-button-primary text-xs">{error}</p>}
    </li>
  );
};

export default CheckoutItemRow;
