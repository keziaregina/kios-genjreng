"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

type CheckoutSummaryProps = {
  subtotal: number;
  shippingCost: number;
  protectionFee: number;
  discount: number;
  total: number;
  groupCount: number;
  pending: boolean;
  disabled: boolean;
  onSubmit: () => void;
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-text-secondary text-xs">{label}</span>
    <span className="text-text-primary text-sm font-semibold">{value}</span>
  </div>
);

const CheckoutSummary = ({
  subtotal,
  shippingCost,
  protectionFee,
  discount,
  total,
  groupCount,
  pending,
  disabled,
  onSubmit,
}: CheckoutSummaryProps) => (
  <div className="bg-primary sticky bottom-0 flex flex-col gap-2 pt-[11px]">
    <div className="border-divider w-full border-t" />

    <Row label="Total barang" value={formatPrice(subtotal)} />
    <Row label="Ongkos kirim" value={formatPrice(shippingCost)} />
    {protectionFee > 0 && (
      <Row label="Perlindungan ekstra" value={formatPrice(protectionFee)} />
    )}
    {discount > 0 && <Row label="Diskon voucher" value={`- ${formatPrice(discount)}`} />}

    <div className="flex items-center justify-between">
      <span className="text-text-secondary text-sm">Total</span>
      <span className="text-text-primary text-base font-extrabold">
        {formatPrice(total)}
      </span>
    </div>

    {groupCount > 1 && (
      <p className="text-text-secondary text-xs">
        Pesanan akan dipecah jadi {groupCount} pesanan, satu per penjual
      </p>
    )}

    <Button
      type="button"
      size="form"
      disabled={pending || disabled}
      onClick={onSubmit}
    >
      {pending ? "Memproses..." : `Bayar · ${formatPrice(total)}`}
    </Button>
  </div>
);

export default CheckoutSummary;
