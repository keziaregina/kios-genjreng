"use client";

import { Trash2 } from "lucide-react";
import React, { useState, useTransition } from "react";

import { removeCartItem } from "@/app/dashboard/cart/actions";
import ProductImage from "@/components/ProductImage";
import QuantityStepper from "@/components/QuantityStepper";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";
import type { CartItemWithProduct } from "@/types/cart";

import RemoveItemSheet from "./RemoveItemSheet";

type CartItemRowProps = {
  item: CartItemWithProduct;
  quantity: number;
  busy: boolean;
  selected: boolean;
  onSelectedChange: (next: boolean) => void;
  onQuantityChange: (next: number) => void;
};

// Quantity is owned by the list so the row and the summary can never quote two different numbers.
const CartItemRow = ({
  item,
  quantity,
  busy,
  selected,
  onSelectedChange,
  onQuantityChange,
}: CartItemRowProps) => {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const product = item.product;
  const soldOut = product.stock === 0;
  const shortStock = quantity > product.stock;

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removeCartItem(item.id);
      if (result.ok) toast.success("Barang dihapus dari keranjang");
      else toast.error(result.message);
      setConfirming(false);
    });
  };

  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={selected}
          onCheckedChange={(next) => onSelectedChange(next === true)}
          aria-label={`Pilih ${product.name}`}
          className="bg-text-primary data-[state=checked]:bg-button-primary"
        />

        <div className="bg-quarternary relative flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-3">
          <ProductImage
            src={product.image}
            alt={product.name}
            sizes="76px"
            iconSize={24}
            className="size-[76px] rounded-[10px]"
          />

          <div className="flex min-w-0 flex-1 flex-col gap-[2px] pr-8">
            <p className="text-text-primary line-clamp-2 text-sm font-bold">
              {product.name}
            </p>
            {product.weight !== null && (
              <p className="text-text-secondary truncate text-[11px]">
                Berat Satuan: {product.weight} kg
              </p>
            )}
            <p className="text-text-secondary truncate text-[11px]">
              Stok: {product.stock}
            </p>
            <p className="text-text-primary text-base font-extrabold">
              {formatPrice(product.price * quantity)}
            </p>
          </div>

          <Button
            type="button"
            size="icon-round"
            aria-label="Hapus dari keranjang"
            disabled={pending}
            onClick={() => setConfirming(true)}
            className="absolute right-3 bottom-3"
          >
            <Trash2 />
          </Button>
        </div>

        <QuantityStepper
          value={quantity}
          max={Math.max(product.stock, 1)}
          onChange={onQuantityChange}
          disabled={busy || pending || soldOut}
          orientation="vertical"
          tone="brand"
        />
      </div>

      <RemoveItemSheet
        item={{ ...item, quantity }}
        open={confirming}
        pending={pending}
        onOpenChange={setConfirming}
        onConfirm={handleRemove}
      />

      {/* Stock trouble is silent in the mockup, so the warning only appears when there actually is some. */}
      {(soldOut || shortStock) && (
        <p className="text-button-primary pl-[26px] text-xs">
          {soldOut ? "Stok habis" : `Stok tidak mencukupi, sisa ${product.stock}`}
        </p>
      )}
    </li>
  );
};

export default CartItemRow;
