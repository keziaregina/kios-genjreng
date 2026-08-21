"use client";

import React from "react";

import type { CartGroup as CartGroupModel, CartItemWithProduct } from "@/types/cart";

import CartItemRow from "./CartItemRow";

type CartGroupProps = {
  group: CartGroupModel;
  unselected: Set<number>;
  busy: Set<number>;
  quantityOf: (item: CartItemWithProduct) => number;
  onSelectedChange: (itemId: number, next: boolean) => void;
  onQuantityChange: (item: CartItemWithProduct, next: number) => void;
};

// One group is exactly one future order, so the buyer still sees which merchant a row belongs to.
const CartGroup = ({
  group,
  unselected,
  busy,
  quantityOf,
  onSelectedChange,
  onQuantityChange,
}: CartGroupProps) => (
  <section className="flex flex-col gap-[11px]">
    <h2 className="text-text-primary truncate text-sm font-bold">
      Penjual: {group.merchant.name}
    </h2>

    <ul className="flex flex-col gap-[11px]">
      {group.items.map((item) => (
        <CartItemRow
          key={item.id}
          item={item}
          quantity={quantityOf(item)}
          busy={busy.has(item.id)}
          selected={!unselected.has(item.id)}
          onSelectedChange={(next) => onSelectedChange(item.id, next)}
          onQuantityChange={(next) => onQuantityChange(item, next)}
        />
      ))}
    </ul>
  </section>
);

export default CartGroup;
