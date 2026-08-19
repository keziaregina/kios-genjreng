import { Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { inter } from "@/app/ui/font";
import ProductImage from "@/components/ProductImage";
import { requireMerchant } from "@/lib/auth/guards";
import { getProductsByUser } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Toko Saya",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

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
            <li key={product.id}>
              <Link
                href={`/product/${product.id}/edit`}
                aria-label={`Edit ${product.name}`}
                className="bg-quarternary text-text-primary flex items-center gap-3 rounded-xl px-4 py-3 active:opacity-80"
              >
                <ProductImage
                  src={product.image}
                  alt={`Foto ${product.name}`}
                  sizes="44px"
                  iconSize={20}
                  className="size-[44px] rounded-[10px]"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-semibold">{product.name}</span>
                  <span className="text-text-secondary text-xs">
                    {product.category.name} · {formatPrice(product.price)}
                  </span>
                </div>
                <Pencil size={16} className="text-text-secondary shrink-0" />
              </Link>
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
