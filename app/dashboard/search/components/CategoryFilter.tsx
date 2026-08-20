import Link from "next/link";
import React from "react";

import ProductImage from "@/components/ProductImage";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/category";

type CategoryFilterProps = {
  categories: Category[];
  activeCategory: string;
  query: string;
};

// The Category table has no image column, so chip art is matched by name and falls back to the guitar icon.
const categoryImages: Record<string, string> = {
  Akustik: "/assets/category/akustik.png",
  Bass: "/assets/category/bass.png",
  Melodi: "/assets/category/melodi.png",
};

const buildHref = (query: string, category: string) => {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (category) params.set("category", category);
  const search = params.toString();
  return search ? `/dashboard/search?${search}` : "/dashboard/search";
};

const CategoryFilter = ({
  categories,
  activeCategory,
  query,
}: CategoryFilterProps) => (
  <div className="mb-[14px] flex w-full gap-[12px] overflow-x-scroll no-scrollbar pb-1">
    {categories.map((category) => {
      const isActive = category.name === activeCategory;

      return (
        <Button
          asChild
          key={category.id}
          variant={isActive ? "default" : "selected"}
          className="h-auto shrink-0 rounded-2xl py-2 pr-5 pl-2"
        >
          <Link
            href={buildHref(query, isActive ? "" : category.name)}
            aria-pressed={isActive}
          >
            <ProductImage
              src={categoryImages[category.name] ?? null}
              alt={`Ikon ${category.name}`}
              sizes="40px"
              iconSize={18}
              className="size-10 rounded-2xl"
            />
            <span className="text-sm font-semibold">{category.name}</span>
          </Link>
        </Button>
      );
    })}
  </div>
);

export default CategoryFilter;
