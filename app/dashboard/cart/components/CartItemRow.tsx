"use client";

import { Trash2 } from "lucide-react";
import React, { useState, useTransition } from "react";

import { removeCartItem, updateCartItemQuantity } from "@/app/dashboard/cart/actions";
import ProductImage from "@/components/ProductImage";
import QuantityStepper from "@/components/QuantityStepper";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cartItemTotal, hasStockIssue } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import type { CartItemWithProduct } from "@/types/cart";

// The server owns the real quantity, so the row keeps a local copy only to stop the stepper feeling laggy.
const CartItemRow = ({ item }: { item: CartItemWithProduct }) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const product = item.product;
  const soldOut = product.stock === 0;
  const shortStock = hasStockIssue(item);

  const changeQuantity = (next: number) => {
    const previous = quantity;
    setQuantity(next);
    startTransition(async () => {
      const result = await updateCartItemQuantity(item.id, next);
      if (!result.ok) {
        setQuantity(previous);
        toast.error(result.message);
      }
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removeCartItem(item.id);
      if (result.ok) toast.success("Barang dihapus dari keranjang");
      else toast.error(result.message);
    });
  };

  return (
    <li className="bg-quarternary flex flex-col gap-2 rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <ProductImage
          src={product.image}
          alt={product.name}
          sizes="56px"
          iconSize={20}
          className="size-[56px] rounded-[10px]"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-text-primary truncate text-sm font-semibold">
            {product.name}
          </p>
          <p className="text-text-secondary truncate text-xs">
            {product.category.name} · {formatPrice(product.price)}
          </p>
          <p className="text-button-primary text-sm font-bold">
            {formatPrice(cartItemTotal({ ...item, quantity }))}
          </p>
        </div>

        <Button
          type="button"
          size="icon-sm"
          variant="selected"
          aria-label="Hapus dari keranjang"
          disabled={pending}
          onClick={handleRemove}
        >
          <Trash2 />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-text-secondary text-xs">
          {soldOut ? "Stok habis" : `Sisa stok ${product.stock}`}
        </span>
        <QuantityStepper
          value={quantity}
          max={Math.max(product.stock, 1)}
          onChange={changeQuantity}
          disabled={pending || soldOut}
        />
      </div>

      {shortStock && (
        <p className="text-button-primary text-xs">Stok tidak mencukupi</p>
      )}
    </li>
  );
};

export default CartItemRow;
