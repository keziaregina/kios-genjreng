import Link from "next/link";
import React from "react";

import ProductImage from "@/components/ProductImage";
import { formatPrice } from "@/lib/utils";
import type { ProductWithRelations } from "@/types/product";

type ProductTileProps = {
  product: ProductWithRelations;
  priority?: boolean;
};

// Horizontal strips scroll, so each tile keeps a fixed width instead of shrinking to fit.
const ProductTile = ({ product, priority }: ProductTileProps) => (
  <Link
    href={`/dashboard/product/${product.id}`}
    aria-label={`Lihat detail ${product.name}`}
    className="flex w-[105px] shrink-0 flex-col gap-1.5 active:opacity-80"
  >
    <ProductImage
      src={product.image}
      alt={`Foto ${product.name}`}
      sizes="105px"
      iconSize={32}
      priority={priority}
      className="h-[150px] w-[105px] rounded-2xl"
    />
    <span className="text-text-primary truncate text-sm font-semibold">
      {product.name}
    </span>
    <span className="text-text-secondary text-xs">
      {formatPrice(product.price)}
    </span>
  </Link>
);

export default ProductTile;
