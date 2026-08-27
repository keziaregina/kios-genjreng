"use client";

import { ShoppingCart } from "lucide-react";
import React, { useTransition } from "react";

import { addToCart, buyNow } from "@/app/dashboard/cart/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type ProductActionsProps = {
  productId: number;
  stock: number;
};

// The dashboard main is not a real scrollport, so the bar pins to the viewport instead of the content end.
const ProductActions = ({ productId, stock }: ProductActionsProps) => {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const soldOut = stock === 0;

  // Buy now redirects to checkout, so only the failure branch ever comes back here.
  const handleBuy = () => {
    startTransition(async () => {
      const result = await buyNow(productId, 1);
      if (result && !result.ok) toast.error(result.message);
    });
  };

  const handleAdd = () => {
    startTransition(async () => {
      const result = await addToCart(productId, 1);
      if (result.ok) toast.success("Masuk ke keranjang");
      else toast.error(result.message);
    });
  };

  return (
    <div className="bg-primary border-divider fixed inset-x-0 bottom-0 z-40 border-t px-[26px] pt-[12px] pb-[24px]">
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
