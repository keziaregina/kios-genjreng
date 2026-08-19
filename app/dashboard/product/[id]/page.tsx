import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import BackButton from "@/app/dashboard/profile/components/BackButton";
import { inter } from "@/app/ui/font";
import { parseId } from "@/lib/api";
import { getProduct } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

async function load(params: PageProps["params"]) {
  const id = parseId((await params).id);
  if (!id) return null;
  return getProduct(id);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await load(params);
  return { title: product?.name ?? "Produk tidak ditemukan" };
}

const ProductPage = async ({ params }: PageProps) => {
  const product = await load(params);
  if (!product) notFound();

  return (
    <div className={`relative px-[26px] pt-[64px] pb-[24px] ${inter.className}`}>
      <BackButton />

      <div className="bg-quarternary mb-[21px] h-[218px] w-full rounded-[10px]" />

      <h1 className="text-text-primary text-[20px] font-extrabold">{product.name}</h1>
      <p className="text-button-primary mt-1 text-[18px] font-bold">
        {formatPrice(product.price)}
      </p>

      <dl className="mt-[21px] flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-text-secondary">Kategori</dt>
          <dd className="text-text-primary font-semibold">{product.category.name}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">Penjual</dt>
          <dd className="text-text-primary font-semibold">{product.user.name}</dd>
        </div>
      </dl>
    </div>
  );
};

export default ProductPage;
