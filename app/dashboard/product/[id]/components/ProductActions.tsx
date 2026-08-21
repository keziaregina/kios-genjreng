"use client";

import { ShoppingCart } from "lucide-react";
import React, { useState, useTransition } from "react";

import { addToCart } from "@/app/dashboard/cart/actions";
import { createOrder } from "@/app/dashboard/orders/actions";
import { Button } from "@/components/ui/button";

type ProductActionsProps = {
  productId: number;
  stock: number;
};

// The dashboard main is not a real scrollport, so the bar pins to the viewport instead of the content end.
const ProductActions = ({ productId, stock }: ProductActionsProps) => {
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  const soldOut = stock === 0;

  // A successful order redirects, so only the failure branch ever comes back here.
  const handleBuy = () => {
    setError(null);
    setAdded(false);
    startTransition(async () => {
      const result = await createOrder(productId, 1);
      if (result && !result.ok) setError(result.message);
    });
  };

  const handleAdd = () => {
    setError(null);
    startTransition(async () => {
      const result = await addToCart(productId, 1);
      if (result.ok) setAdded(true);
      else setError(result.message);
    });
  };

  return (
    <div className="bg-primary border-divider fixed inset-x-0 bottom-0 z-40 border-t px-[26px] pt-[12px] pb-[24px]">
      {added && <p className="text-success mb-2 text-xs">Masuk ke keranjang</p>}
      {error && <p className="text-button-primary mb-2 text-xs">{error}</p>}

      <div className="flex items-center gap-[11px]">
        <Button
          type="button"
          variant="accent"
          aria-label="Tambah ke keranjang"
          disabled={soldOut || pending}
          onClick={handleAdd}
          className="size-[56px] rounded-xl [&_svg:not([class*='size-'])]:size-6"
        >
          <ShoppingCart />
        </Button>

        <Button
          type="button"
          size="form"
          disabled={soldOut || pending}
          onClick={handleBuy}
          className="flex-1 text-[16px] font-bold"
        >
          {soldOut ? "Stok habis" : pending ? "Memproses..." : "Beli Sekarang"}
        </Button>
      </div>
    </div>
  );
};

export default ProductActions;
