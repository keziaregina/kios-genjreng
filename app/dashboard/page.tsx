import React from "react";
import { Bolt } from "lucide-react";
import type { Metadata } from "next";
import { inter } from "@/app/ui/font";
import ProductImage from "@/components/ProductImage";
import { getCurrentUser } from "@/lib/auth/guards";
import { getCategories, getProducts, searchProducts } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProductTile from "./components/ProductTile";
import SearchInput from "./components/SearchInput";

export const metadata: Metadata = {
  title: "Beranda",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

const Dashboard = async () => {
  // One round trip for the whole page instead of four sequential awaits.
  const [user, categories, latest, cheapest] = await Promise.all([
    getCurrentUser(),
    getCategories(),
    getProducts(1),
    searchProducts({ limit: 8 }),
  ]);

  const firstName = user?.name.split(" ")[0] ?? "Kamu";
  const newest = latest[0];

  return (
    <div className={`px-[26px] py-[24px] ${inter.className}`}>
      <div className="flex justify-between items-center mb-[21px]">
        <div className="flex gap-0 flex-col font-bold">
          <span className="text-[15px] text-gray-500">Hai {firstName},</span>
          <span className="text-lg text-white">mau cari apa?</span>
        </div>
        <Link href="/dashboard/settings">
          <Bolt color="white" />
        </Link>
      </div>

      {/* Search */}
      <SearchInput />

      {categories.length > 0 && (
        <div className="flex flex-col gap-[11px] mb-[21px]">
          <div className="text-text-primary font-semibold">Cari tipe-mu</div>
          <div className="flex w-full overflow-x-scroll no-scrollbar gap-[9px]">
            {/* Chips hand the category name to search through the same param its own filter reads. */}
            {categories.map((category) => (
              <Button asChild className="px-7 py-6 rounded-2xl" key={category.id}>
                <Link
                  href={`/dashboard/search?category=${encodeURIComponent(category.name)}`}
                >
                  {category.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}

      {newest && (
        <div className="flex flex-col gap-[11px] mb-[21px]">
          <div>
            <div className="text-text-primary font-extrabold text-[20px]">
              Baru Datang Nih
            </div>
            <div className="text-text-secondary text-[12px]">
              Gitar yang baru masuk
            </div>
          </div>
          {/* The banner shows the newest row, so an empty catalogue hides it rather than faking stock. */}
          <Link
            href={`/dashboard/product/${newest.id}`}
            aria-label={`Lihat detail ${newest.name}`}
            className="w-full h-[218px] bg-linear-to-t from-button-primary to-gradient-pink-end rounded-2xl flex items-center gap-4 p-5 active:opacity-80"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-text-primary truncate text-[18px] font-extrabold">
                {newest.name}
              </span>
              <span className="text-text-primary text-[12px]">
                {newest.category.name}
              </span>
              <span className="text-text-primary text-[16px] font-bold">
                {formatPrice(newest.price)}
              </span>
            </div>
            <ProductImage
              src={newest.image}
              alt={`Foto ${newest.name}`}
              sizes="140px"
              iconSize={40}
              priority
              className="h-[178px] w-[140px] rounded-2xl"
            />
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-[11px]">
        <div>
          <div className="text-text-primary font-extrabold text-[18px]">
            Terpopuler
          </div>
          <div className="text-text-secondary text-[12px]">
            Harga paling ramah kantong
          </div>
        </div>
        {cheapest.length === 0 ? (
          <p className="text-text-secondary text-sm">Belum ada produk.</p>
        ) : (
          <div className="flex gap-[18px] overflow-x-scroll overflow-y-hidden no-scrollbar pb-2">
            {cheapest.map((product) => (
              <ProductTile
                key={product.id}
                product={product}
                className="w-[150px] shrink-0"
                imageClassName="h-[150px]"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
