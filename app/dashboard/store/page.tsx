import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { inter } from "@/app/ui/font";
import { requireMerchant } from "@/lib/auth/guards";
import { getProductsByUser } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Toko Saya",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const StorePage = async () => {
  const session = await requireMerchant();
  const products = await getProductsByUser(session.userId);

  return (
    <div className={`px-[26px] py-[24px] ${inter.className}`}>
      <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">
        Toko Saya
      </h1>

      {products.length === 0 ? (
        <p className="text-text-secondary mb-[21px] text-sm">Belum ada produk.</p>
      ) : (
        <ul className="mb-[21px] flex flex-col gap-2">
          {products.map((product) => (
            <li
              key={product.id}
              className="bg-quarternary text-text-primary flex items-center justify-between rounded-xl px-4 py-3"
            >
              <span className="font-semibold">{product.name}</span>
              <span className="text-text-secondary text-xs">
                {product.category.name} · {priceFormatter.format(product.price)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/product"
        className="bg-button-primary text-text-primary inline-flex rounded-xl px-4 py-3 text-sm font-semibold"
      >
        Tambah Produk
      </Link>
    </div>
  );
};

export default StorePage;
