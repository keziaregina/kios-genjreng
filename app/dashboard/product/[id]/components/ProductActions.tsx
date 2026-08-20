"use client";

import React, { useState, useTransition } from "react";

import { addToCart } from "@/app/dashboard/cart/actions";
import { createOrder } from "@/app/dashboard/orders/actions";
import QuantityStepper from "@/components/QuantityStepper";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

type ProductActionsProps = {
  productId: number;
  price: number;
  stock: number;
};

// One quantity feeds both destinations, so buying now and saving for later never disagree on the number.
const ProductActions = ({ productId, price, stock }: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  const soldOut = stock === 0;

  const changeQuantity = (next: number) => {
    setQuantity(next);
    setAdded(false);
    setError(null);
  };

  // A successful order redirects, so only the failure branch ever comes back here.
  const handleBuy = () => {
    setError(null);
    setAdded(false);
    startTransition(async () => {
      const result = await createOrder(productId, quantity);
      if (result && !result.ok) setError(result.message);
    });
  };

  const handleAdd = () => {
    setError(null);
    startTransition(async () => {
      const result = await addToCart(productId, quantity);
      if (result.ok) setAdded(true);
      else setError(result.message);
    });
  };

  return (
    <div className="flex flex-col gap-[11px]">
      {!soldOut && (
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Jumlah</span>
          <QuantityStepper
            value={quantity}
            max={stock}
            onChange={changeQuantity}
            disabled={pending}
          />
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

      {!soldOut && (
        <Button
          type="button"
          size="form"
          variant="accent"
          disabled={pending}
          onClick={handleAdd}
        >
          Tambah ke Keranjang
        </Button>
      )}

      {added && <p className="text-success text-xs">Masuk ke keranjang</p>}
      {error && <p className="text-button-primary text-xs">{error}</p>}
    </div>
  );
};

export default ProductActions;
