import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import BackButton from "@/app/dashboard/profile/components/BackButton";
import ProductImage from "@/components/ProductImage";
import StarRating from "@/components/StarRating";
import { inter } from "@/app/ui/font";
import { parseId } from "@/lib/api";
import { getSession } from "@/lib/auth/guards";
import { getProduct, getProductReviews } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";

import ProductActions from "./components/ProductActions";
import ReviewList from "./components/ReviewList";

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
  const [product, session] = await Promise.all([load(params), getSession()]);
  if (!product) notFound();

  const reviews = await getProductReviews(product.id);

  // Nobody buys from their own shelf, so the seller sees the listing without the order controls.
  const canBuy = session !== null && session.userId !== product.userId;

  return (
    <div className={`relative px-[26px] pt-[64px] pb-[24px] ${inter.className}`}>
      <BackButton />

      <ProductImage
        src={product.image}
        alt={`Foto ${product.name}`}
        sizes="100vw"
        priority
        iconSize={40}
        className="mb-[21px] h-[218px] w-full rounded-[10px]"
      />

      <h1 className="text-text-primary text-[20px] font-extrabold">{product.name}</h1>
      <p className="text-button-primary mt-1 text-[18px] font-bold">
        {formatPrice(product.price)}
      </p>

      {product.rating !== null && (
        <div className="mt-2 flex items-center gap-2">
          <StarRating value={product.rating} size={14} />
          <span className="text-text-secondary text-xs font-semibold">
            {product.rating.toFixed(1)} · {product.reviewCount} ulasan
          </span>
        </div>
      )}

      <dl className="mt-[21px] flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-text-secondary">Kategori</dt>
          <dd className="text-text-primary font-semibold">{product.category.name}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">Penjual</dt>
          <dd className="text-text-primary font-semibold">{product.user.name}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">Stok</dt>
          <dd className="text-text-primary font-semibold">
            {product.stock > 0 ? `${product.stock} tersisa` : "Habis"}
          </dd>
        </div>
      </dl>

      {canBuy && (
        <div className="mt-[21px]">
          <ProductActions
            productId={product.id}
            price={product.price}
            stock={product.stock}
          />
        </div>
      )}

      <ReviewList reviews={reviews} />
    </div>
  );
};

export default ProductPage;
