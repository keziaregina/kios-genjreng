import React from "react";
import type { Metadata } from "next";

import { inter } from "@/app/ui/font";
import { getCategories, searchProducts, type ProductSort } from "@/lib/queries";
import ProductTile from "../components/ProductTile";
import SearchInput from "../components/SearchInput";
import CategoryFilter from "./components/CategoryFilter";
import SectionHeader from "./components/SectionHeader";

export const metadata: Metadata = {
  title: "Cari Gitar",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

const sortTitles: Record<ProductSort, string> = {
  terpopuler: "Terpopuler",
  termurah: "Harga Terjangkau",
  terbaru: "Baru Datang",
};

const isProductSort = (value: string): value is ProductSort =>
  value in sortTitles;

const SearchPage = async (props: {
  searchParams?: Promise<{
    query?: string;
    category?: string;
    sort?: string;
  }>;
}) => {
  const searchParams = await props.searchParams;
  const query = searchParams?.query ?? "";
  const category = searchParams?.category ?? "";
  const sortRaw = searchParams?.sort ?? "";
  const sort = isProductSort(sortRaw) ? sortRaw : undefined;
  const isFiltering = Boolean(query || category || sort);

  // A bare visit only needs two preview rows; anything filtered collapses into one full list.
  const [categories, popular, cheapest, results] = await Promise.all([
    getCategories(),
    isFiltering
      ? []
      : searchProducts({ sort: "terpopuler", limit: 4 }),
    isFiltering ? [] : searchProducts({ sort: "termurah", limit: 4 }),
    isFiltering
      ? searchProducts({
          keyword: query || undefined,
          category: category || undefined,
          sort: sort ?? "terpopuler",
          limit: 20,
        })
      : [],
  ]);

  const resultTitle = sort && !query && !category ? sortTitles[sort] : "Hasil Pencarian";

  return (
    <div className={`px-[26px] py-[24px] ${inter.className}`}>
      <SearchInput />

      <CategoryFilter
        categories={categories}
        activeCategory={category}
        query={query}
      />

      <div className="border-surface w-full border-t" />

      {isFiltering ? (
        <div className="mt-[18px] flex flex-col gap-[14px]">
          <div>
            <h1 className="text-text-primary text-[18px] font-extrabold">
              {resultTitle}
            </h1>
            <p className="text-text-secondary text-[12px]">
              {`${results.length} gitar`}
              {query ? ` untuk "${query}"` : ""}
              {category ? ` di kategori ${category}` : ""}
            </p>
          </div>

          {results.length === 0 ? (
            <p className="text-text-secondary text-sm">
              Gitar tidak ditemukan. Coba kata kunci atau kategori lain.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-[18px] gap-y-[21px]">
              {results.map((product, index) => (
                <ProductTile
                  key={product.id}
                  product={product}
                  priority={index < 2}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-[18px] flex flex-col gap-[24px]">
          <section>
            <SectionHeader
              title="Terpopuler"
              href="/dashboard/search?sort=terpopuler"
            />
            <div className="grid grid-cols-2 gap-x-[18px] gap-y-[21px]">
              {popular.map((product, index) => (
                <ProductTile
                  key={product.id}
                  product={product}
                  priority={index < 2}
                />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader
              title="Harga Terjangkau"
              href="/dashboard/search?sort=termurah"
            />
            <div className="grid grid-cols-2 gap-x-[18px] gap-y-[21px]">
              {cheapest.map((product) => (
                <ProductTile
                  key={product.id}
                  product={product}
                  imageClassName="h-[120px]"
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
