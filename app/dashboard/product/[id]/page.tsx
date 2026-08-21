import type { Metadata } from "next";
import { User } from "lucide-react";
import { notFound } from "next/navigation";
import React from "react";

import BackButton from "@/app/dashboard/profile/components/BackButton";
import ProductImage from "@/components/ProductImage";
import StarRating from "@/components/StarRating";
import { inter } from "@/app/ui/font";
import { parseId } from "@/lib/api";
import { getSession } from "@/lib/auth/guards";
import { getProduct, getProductReviews } from "@/lib/queries";
import { cn, formatPrice, formatSold } from "@/lib/utils";

import ProductActions from "./components/ProductActions";
import ProductDescription from "./components/ProductDescription";
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

  // A blank column is a spec the merchant never filled, so the row disappears instead of printing nothing.
  const specs: { label: string; value: string }[] = [];
  if (product.weight !== null) {
    specs.push({ label: "Berat Satuan", value: `${product.weight} kg` });
  }
  if (product.warranty) specs.push({ label: "Garansi", value: product.warranty });
  if (product.material) specs.push({ label: "Material", value: product.material });
  specs.push({ label: "Kategori", value: product.category.name });
  specs.push({
    label: "Stok",
    value: product.stock > 0 ? `${product.stock} tersisa` : "Habis",
  });

  return (
    <div className={cn("relative", inter.className)}>
      <BackButton className="bg-primary/60 hover:bg-primary/80 fixed size-10 rounded-full backdrop-blur-sm has-[>svg]:px-0" />

      <ProductImage
        src={product.image}
        alt={`Foto ${product.name}`}
        sizes="100vw"
        priority
        iconSize={40}
        className="h-[390px] w-full"
      />

      <div
        className={cn(
          "flex flex-col px-[26px] pt-[16px]",
          canBuy ? "pb-[120px]" : "pb-[24px]",
        )}
      >
        <div className="flex items-center gap-[11px]">
          {product.soldCount > 0 && (
            <span className="bg-button-primary text-text-primary rounded-[4px] px-2 py-1 text-[10px] font-bold">
              Terjual {formatSold(product.soldCount)}
            </span>
          )}
          {product.rating !== null && (
            <span className="text-text-primary flex items-center gap-1 text-[10px] font-bold">
              <StarRating value={product.rating} size={12} />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        <h1 className="text-text-primary mt-[11px] text-[20px] font-extrabold">
          {product.name}
        </h1>

        {product.description && <ProductDescription text={product.description} />}

        <p className="text-button-primary mt-[11px] text-[20px] font-extrabold">
          {formatPrice(product.price)}
        </p>

        <div className="border-divider mt-[16px] flex items-center gap-3 border-y py-[12px]">
          <span className="bg-avatar-bg text-text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
            <User size={22} />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="text-text-primary truncate text-sm font-semibold">
              {product.user.name}
            </span>
            <span className="text-text-secondary text-xs">Penjual</span>
          </div>
        </div>

        <dl className="mt-[16px] flex flex-col gap-1 text-xs">
          <dt className="text-text-secondary mb-1 font-semibold">Detail Produk :</dt>
          {specs.map((spec) => (
            <dd key={spec.label} className="text-text-secondary">
              {spec.label}: <span className="text-text-primary">{spec.value}</span>
            </dd>
          ))}
        </dl>

        <ReviewList reviews={reviews} />
      </div>

      {canBuy && <ProductActions productId={product.id} stock={product.stock} />}
    </div>
  );
};

export default ProductPage;
