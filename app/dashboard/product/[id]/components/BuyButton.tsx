"use client";

import { Minus, Plus } from "lucide-react";
import React, { useState, useTransition } from "react";

import { createOrder } from "@/app/dashboard/orders/actions";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

type BuyButtonProps = {
  productId: number;
  price: number;
  stock: number;
};

const BuyButton = ({ productId, price, stock }: BuyButtonProps) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const soldOut = stock === 0;

  // A successful order redirects, so only the failure branch ever comes back here.
  const handleBuy = () => {
    setError(null);
    startTransition(async () => {
      const result = await createOrder(productId, quantity);
      if (result && !result.ok) setError(result.message);
    });
  };

  const step = (by: number) =>
    setQuantity((current) => Math.min(Math.max(current + by, 1), stock));

  return (
    <div className="flex flex-col gap-[11px]">
      {!soldOut && (
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Jumlah</span>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="icon-sm"
              variant="selected"
              aria-label="Kurangi jumlah"
              disabled={quantity <= 1 || pending}
              onClick={() => step(-1)}
            >
              <Minus />
            </Button>
            <span className="text-text-primary w-6 text-center font-semibold">
              {quantity}
            </span>
            <Button
              type="button"
              size="icon-sm"
              variant="selected"
              aria-label="Tambah jumlah"
              disabled={quantity >= stock || pending}
              onClick={() => step(1)}
            >
              <Plus />
            </Button>
          </div>
        </div>
      )}

      <Button
        type="button"
        size="form"
        disabled={soldOut || pending}
        onClick={handleBuy}
      >
        {soldOut
          ? "Stok habis"
          : pending
            ? "Memproses..."
            : `Beli Sekarang · ${formatPrice(price * quantity)}`}
      </Button>

      {error && <p className="text-button-primary text-xs">{error}</p>}
    </div>
  );
};

export default BuyButton;
