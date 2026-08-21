"use client";

import React from "react";

import ProductImage from "@/components/ProductImage";
import { cartTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import type { CartItemWithProduct } from "@/types/cart";

import ConfirmSheet from "./ConfirmSheet";

type RemoveSelectedSheetProps = {
  items: CartItemWithProduct[];
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

// A card per item would outgrow the sheet, so the bulk preview is a strip of thumbnails plus what it costs.
const RemoveSelectedSheet = ({
  items,
  open,
  pending,
  onOpenChange,
  onConfirm,
}: RemoveSelectedSheetProps) => (
  <ConfirmSheet
    open={open}
    pending={pending}
    title={`Hapus ${items.length} item?`}
    onOpenChange={onOpenChange}
    onConfirm={onConfirm}
  >
    <ul className="no-scrollbar flex gap-2 overflow-x-auto">
      {items.map((item) => (
        <li key={item.id} className="relative shrink-0 mt-4">
          <ProductImage
            src={item.product.image}
            alt={item.product.name}
            sizes="56px"
            iconSize={20}
            className="bg-quarternary size-[56px] rounded-[10px]"
          />
          {item.quantity >= 1 && (
            <span className="z-50 bg-button-primary text-text-primary absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold">
              {item.quantity}
            </span>
          )}
        </li>
      ))}
    </ul>

    <div className="mt-[14px] flex items-center justify-between">
      <span className="text-text-secondary text-xs">Nilai barang</span>
      <span className="text-text-primary text-sm font-semibold">
        {formatPrice(cartTotal(items))}
      </span>
    </div>
  </ConfirmSheet>
);

export default RemoveSelectedSheet;
