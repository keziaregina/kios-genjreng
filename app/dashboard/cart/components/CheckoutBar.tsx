"use client";

import Link from "next/link";
import React, { useState, useTransition } from "react";

import { clearCart } from "@/app/dashboard/cart/actions";
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

// Ordering now happens on its own page, so this bar only quotes the goods and hands the buyer over.
const CheckoutBar = ({ total, groupCount, blocked }: CheckoutBarProps) => {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

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
        <span className="text-text-secondary text-sm">Total barang</span>
        <span className="text-text-primary text-base font-extrabold">
          {formatPrice(total)}
        </span>
      </div>

      {blocked ? (
        <Button type="button" size="form" disabled>
          Checkout · {formatPrice(total)}
        </Button>
      ) : (
        <Button asChild size="form">
          <Link href="/dashboard/cart/checkout">
            Checkout · {formatPrice(total)}
          </Link>
        </Button>
      )}

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
