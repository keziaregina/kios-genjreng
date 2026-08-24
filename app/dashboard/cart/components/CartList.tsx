"use client";

import { Trash2 } from "lucide-react";
import React, { useEffect, useState, useTransition } from "react";

import { removeCartItems, updateCartItemQuantity } from "@/app/dashboard/cart/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cartTotal, hasStockIssue } from "@/lib/cart";
import { orderTotal, shippingEstimate } from "@/lib/checkout";
import type { CartGroup as CartGroupModel, CartItemWithProduct } from "@/types/cart";

import CartGroup from "./CartGroup";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";
import RemoveSelectedSheet from "./RemoveSelectedSheet";

// Tracking what is switched off keeps rows that arrive later ticked by default, and forgets ids that were deleted.
const CartList = ({ groups }: { groups: CartGroupModel[] }) => {
  const [unselected, setUnselected] = useState<Set<number>>(new Set());
  const [drafts, setDrafts] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState<Set<number>>(new Set());
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  // A draft only covers the gap until the server payload catches up, then it stops shadowing the real row.
  useEffect(() => {
    setDrafts((current) => {
      const rows = new Map(
        groups.flatMap((group) => group.items).map((item) => [item.id, item.quantity]),
      );
      const kept = Object.entries(current).filter(
        ([id, quantity]) => rows.get(Number(id)) !== quantity,
      );
      return kept.length === Object.keys(current).length
        ? current
        : Object.fromEntries(kept);
    });
  }, [groups]);

  const quantityOf = (item: CartItemWithProduct) => drafts[item.id] ?? item.quantity;
  const withQuantity = (item: CartItemWithProduct) => ({
    ...item,
    quantity: quantityOf(item),
  });

  const chosen = groups.flatMap((group) =>
    group.items.filter((item) => !unselected.has(item.id)).map(withQuantity),
  );
  const merchantCount = groups.filter((group) =>
    group.items.some((item) => !unselected.has(item.id)),
  ).length;

  const costs = {
    subtotal: cartTotal(chosen),
    shippingCost: shippingEstimate(merchantCount),
    protectionFee: 0,
    discount: 0,
  };

  const toggle = (itemId: number, next: boolean) => {
    setUnselected((current) => {
      const draft = new Set(current);
      if (next) draft.delete(itemId);
      else draft.add(itemId);
      return draft;
    });
  };

  const markBusy = (itemId: number, on: boolean) => {
    setBusy((current) => {
      const draft = new Set(current);
      if (on) draft.add(itemId);
      else draft.delete(itemId);
      return draft;
    });
  };

  const changeQuantity = (item: CartItemWithProduct, next: number) => {
    setDrafts((current) => ({ ...current, [item.id]: next }));
    markBusy(item.id, true);

    startTransition(async () => {
      const result = await updateCartItemQuantity(item.id, next);
      if (!result.ok) {
        toast.error(result.message);
        setDrafts((current) => {
          const draft = { ...current };
          delete draft[item.id];
          return draft;
        });
      }
      markBusy(item.id, false);
    });
  };

  const handleRemoveSelected = () => {
    startTransition(async () => {
      const result = await removeCartItems(chosen.map((item) => item.id));
      if (result.ok) toast.success("Barang terpilih dihapus");
      else toast.error(result.message);
      setOpen(false);
    });
  };

  return (
    <>
      <div className="relative mb-[21px] flex items-center justify-center">
        <h1 className="text-text-primary text-[20px] font-extrabold">Keranjang</h1>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Hapus barang terpilih"
          disabled={pending || chosen.length === 0}
          onClick={() => setOpen(true)}
          className="text-text-primary absolute right-0"
        >
          <Trash2 />
        </Button>
      </div>

      <RemoveSelectedSheet
        items={chosen}
        open={open}
        pending={pending}
        onOpenChange={setOpen}
        onConfirm={handleRemoveSelected}
      />

      {groups.length === 0 ? (
        <EmptyCart />
      ) : (
        // The summary sheet is pinned over the page, so the list keeps its own runway underneath.
        <div className="flex flex-col gap-[21px] pb-[308px]">
          {groups.map((group) => (
            <CartGroup
              key={group.merchant.id}
              group={group}
              unselected={unselected}
              busy={busy}
              quantityOf={quantityOf}
              onSelectedChange={toggle}
              onQuantityChange={changeQuantity}
            />
          ))}

          <CartSummary
            subtotal={costs.subtotal}
            shippingCost={costs.shippingCost}
            total={orderTotal(costs)}
            merchantCount={merchantCount}
            blocked={chosen.some(hasStockIssue)}
            checkoutHref={`/dashboard/cart/checkout?items=${chosen.map((item) => item.id).join(",")}`}
          />
        </div>
      )}
    </>
  );
};

export default CartList;
