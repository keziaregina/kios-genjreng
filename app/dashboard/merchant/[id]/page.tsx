import { MapPin, Store } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import ProductTile from "@/app/dashboard/components/ProductTile";
import BackButton from "@/app/dashboard/profile/components/BackButton";
import StarRating from "@/components/StarRating";
import { parseId } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { getMerchant, getProductsByUser } from "@/lib/queries";
import { storeLabel, storeStats } from "@/lib/store";
import { formatSold } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

async function load(params: PageProps["params"]) {
  const id = parseId((await params).id);
  if (!id) return null;
  return getMerchant(id);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const merchant = await load(params);
  return { title: merchant ? storeLabel(merchant) : "Toko tidak ditemukan" };
}

const MerchantPage = async ({ params }: PageProps) => {
  await requireUser();

  const merchant = await load(params);
  if (!merchant) notFound();

  const products = await getProductsByUser(merchant.id);
  const stats = storeStats(products);

  return (
    <PageContainer className="relative pt-[64px]">
      <BackButton />

      <div className="border-divider flex items-center gap-3 border-b pb-[16px]">
        <span className="bg-avatar-bg text-text-primary flex size-14 shrink-0 items-center justify-center rounded-full">
          <Store size={26} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="text-text-primary truncate text-[20px] font-extrabold">
            {storeLabel(merchant)}
          </h1>
          {merchant.city && (
            <span className="text-text-secondary flex items-center gap-1 text-xs">
              <MapPin size={12} />
              {merchant.city}
            </span>
          )}
        </div>
      </div>

      <dl className="border-divider mb-[21px] flex items-center gap-[21px] border-b py-[12px]">
        <div className="flex flex-col gap-0.5">
          <dt className="text-text-secondary text-[11px]">Produk</dt>
          <dd className="text-text-primary text-sm font-bold">{stats.productCount}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-text-secondary text-[11px]">Terjual</dt>
          <dd className="text-text-primary text-sm font-bold">
            {formatSold(stats.soldCount)}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-text-secondary text-[11px]">Penilaian</dt>
          <dd className="text-text-primary flex items-center gap-1 text-sm font-bold">
            {stats.rating === null ? (
              "Belum ada"
            ) : (
              <>
                <StarRating value={stats.rating} />
                {stats.rating.toFixed(1)} ({stats.reviewCount})
              </>
            )}
          </dd>
        </div>
      </dl>

      {products.length === 0 ? (
        <p className="text-text-secondary text-sm">Toko ini belum menjual gitar.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-[18px] gap-y-[21px]">
          {products.map((product, index) => (
            <ProductTile key={product.id} product={product} priority={index < 2} />
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default MerchantPage;
