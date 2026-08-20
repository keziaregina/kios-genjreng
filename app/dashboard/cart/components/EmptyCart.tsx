import { ShoppingBasket } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";

// An empty cart is a dead end, so it points straight back at the catalogue.
const EmptyCart = () => (
  <div className="flex flex-col items-center gap-[11px] py-[48px] text-center">
    <ShoppingBasket className="text-text-secondary size-10" />
    <h2 className="text-text-primary text-base font-bold">Keranjang masih kosong</h2>
    <p className="text-text-secondary text-sm">Belum ada gitar yang kamu simpan.</p>
    <Button asChild size="form" className="mt-[11px]">
      <Link href="/dashboard/search">Cari Gitar</Link>
    </Button>
  </div>
);

export default EmptyCart;
