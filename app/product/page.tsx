import type { Metadata } from "next";

import BackButton from "@/app/dashboard/profile/components/BackButton";
import { inter } from "@/app/ui/font";
import { requireMerchant } from "@/lib/auth/guards";
import { getCategories } from "@/lib/queries";

import ProductForm from "./components/Form";

export const metadata: Metadata = {
  title: "Tambah Produk",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

export default async function ProductPage() {
  await requireMerchant();

  // Server Component: query the database directly. No HTTP hop to our own API.
  const categories = await getCategories();

  return (
    <div
      className={`bg-primary relative min-h-screen px-[26px] pt-[64px] pb-[24px] ${inter.className}`}
    >
      <BackButton />

      <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">
        Tambah Produk
      </h1>

      <ProductForm categories={categories} />
    </div>
  );
}
