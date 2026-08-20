import React from "react";

import { formatPrice } from "@/lib/utils";
import type { CartGroup as CartGroupModel } from "@/types/cart";

import CartItemRow from "./CartItemRow";

// One group is exactly one future order, so its subtotal is what the merchant will actually be paid.
const CartGroup = ({ group }: { group: CartGroupModel }) => (
  <section className="flex flex-col gap-[11px]">
    <h2 className="text-text-primary truncate text-sm font-bold">
      Penjual: {group.merchant.name}
    </h2>

    <ul className="flex flex-col gap-[11px]">
      {group.items.map((item) => (
        <CartItemRow key={item.id} item={item} />
      ))}
    </ul>

    <div className="flex items-center justify-between">
      <span className="text-text-secondary text-xs">Subtotal</span>
      <span className="text-text-primary text-sm font-semibold">
        {formatPrice(group.subtotal)}
      </span>
    </div>
  </section>
);

export default CartGroup;
