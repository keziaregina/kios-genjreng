"use client";

import Link from "next/link";
import React from "react";

import VoucherField from "@/app/dashboard/cart/components/VoucherField";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

type CartSummaryProps = {
  subtotal: number;
  shippingCost: number;
  total: number;
  merchantCount: number;
  blocked: boolean;
  checkoutHref: string;
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-text-secondary text-xs">{label}</span>
    <span className="text-text-primary text-sm font-semibold">{value}</span>
  </div>
);

// Nothing is selected until a row is ticked, so the bar has to say why the button will not move.
const CartSummary = ({
  subtotal,
  shippingCost,
  total,
  merchantCount,
  blocked,
  checkoutHref,
}: CartSummaryProps) => {
  const empty = merchantCount === 0;
  const disabled = empty || blocked;

  return (
    <div className="bg-primary fixed inset-x-0 bottom-0 z-20 flex flex-col gap-3 px-[26px] pt-[14px] pb-[24px]">
      <VoucherField />

      <div className="flex flex-col gap-2">
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        <Row label="Ongkir" value={formatPrice(shippingCost)} />
      </div>

      <div className="border-divider w-full border-t border-dashed" />

      <div className="flex items-center justify-between">
        <span className="text-text-primary text-sm font-bold">Total</span>
        <span className="text-text-primary text-base font-extrabold">
          {formatPrice(total)}
        </span>
      </div>

      {merchantCount > 1 && (
        <p className="text-text-secondary text-xs">Pesanan akan dipecah per penjual</p>
      )}

      {disabled ? (
        <Button type="button" size="form" disabled>
          Checkout
        </Button>
      ) : (
        <Button asChild size="form">
          <Link href={checkoutHref}>Checkout</Link>
        </Button>
      )}

      {disabled && (
        <p className="text-button-primary text-xs">
          {empty ? "Pilih minimal satu barang" : "Ada barang yang stoknya tidak cukup"}
        </p>
      )}
    </div>
  );
};

export default CartSummary;
