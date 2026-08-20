"use client";

import React, { useState, useTransition } from "react";

import { checkout, clearCart } from "@/app/dashboard/cart/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

type CheckoutBarProps = {
  total: number;
  groupCount: number;
  blocked: boolean;
};

// Checkout redirects on success, so only the failure branch ever comes back to this component.
const CheckoutBar = ({ total, groupCount, blocked }: CheckoutBarProps) => {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleCheckout = () => {
    setError(null);
    startTransition(async () => {
      const result = await checkout();
      if (result && !result.ok) setError(result.message);
    });
  };

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await clearCart();
      if (!result.ok) setError(result.message);
      setOpen(false);
    });
  };

  return (
    <div className="bg-primary sticky bottom-0 flex flex-col gap-2 pt-[11px]">
      {groupCount > 1 && (
        <p className="text-text-secondary text-xs">Pesanan akan dipecah per penjual</p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-sm">Total</span>
        <span className="text-text-primary text-base font-extrabold">
          {formatPrice(total)}
        </span>
      </div>

      <Button
        type="button"
        size="form"
        disabled={pending || blocked}
        onClick={handleCheckout}
      >
        {pending ? "Memproses..." : `Checkout · ${formatPrice(total)}`}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="ghost" size="form" className="text-button-primary">
            Kosongkan Keranjang
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kosongkan keranjang?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua barang akan dihapus dari keranjang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
            <AlertDialogAction disabled={pending} onClick={handleClear}>
              Kosongkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {blocked && (
        <p className="text-button-primary text-xs">Ada barang yang stoknya tidak cukup</p>
      )}
      {error && <p className="text-button-primary text-xs">{error}</p>}
    </div>
  );
};

export default CheckoutBar;
