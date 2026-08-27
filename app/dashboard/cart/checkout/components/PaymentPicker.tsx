"use client";

import { ChevronRight, Wallet } from "lucide-react";
import React, { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PAYMENT_DESCRIPTION, PAYMENT_LABEL } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/types/order";

type PaymentPickerProps = {
  value: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  disabled: boolean;
};

const METHODS = Object.values(PaymentMethod);

const PaymentPicker = ({ value, onSelect, disabled }: PaymentPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 py-[12px] text-left active:opacity-80 disabled:opacity-50"
      >
        <Wallet aria-hidden className="text-text-primary size-5 shrink-0" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-text-primary text-sm font-semibold">Pembayaran</span>
          <span className="text-text-secondary truncate text-xs">
            {PAYMENT_LABEL[value]}
          </span>
        </span>
        <ChevronRight size={16} className="text-text-secondary shrink-0" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="bg-primary border-divider rounded-t-2xl"
        >
          <SheetHeader>
            <SheetTitle className="text-text-primary">Pilih Pembayaran</SheetTitle>
            <SheetDescription className="text-text-secondary">
              Kartu dibayar sekarang lewat Stripe; COD dan transfer dibayar
              setelah penjual mengonfirmasi.
            </SheetDescription>
          </SheetHeader>

          <ul className="flex flex-col gap-[11px] px-4 pb-6">
            {METHODS.map((method) => (
              <li key={method}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(method);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full flex-col gap-1 rounded-xl border px-4 py-3 text-left",
                    method === value
                      ? "border-button-primary bg-quarternary"
                      : "border-divider",
                  )}
                >
                  <span className="text-text-primary text-sm font-bold">
                    {PAYMENT_LABEL[method]}
                  </span>
                  <span className="text-text-secondary text-xs">
                    {PAYMENT_DESCRIPTION[method]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default PaymentPicker;
