import { Star } from "lucide-react";
import Link from "next/link";
import React from "react";

import ProductImage from "@/components/ProductImage";
import { cn, formatPrice, formatSold } from "@/lib/utils";
import type { ProductWithRelations } from "@/types/product";

type ProductTileProps = {
  product: ProductWithRelations;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
};

// Width comes from the caller so the same tile fits a scrolling strip and a grid cell.
const ProductTile = ({
  product,
  priority,
  className,
  imageClassName,
}: ProductTileProps) => (
  <Link
    href={`/dashboard/product/${product.id}`}
    aria-label={`Lihat detail ${product.name}`}
    className={cn("flex flex-col gap-1 active:opacity-80", className)}
  >
    <div className="relative">
      <ProductImage
        src={product.image}
        alt={`Foto ${product.name}`}
        sizes="(max-width: 480px) 45vw, 160px"
        iconSize={32}
        priority={priority}
        className={cn("h-[168px] w-full rounded-[10px]", imageClassName)}
      />
      {product.rating !== null && (
        <span className="bg-primary/80 text-text-primary absolute bottom-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
          <Star size={10} className="fill-rating text-rating" />
          {product.rating.toFixed(1)}
        </span>
      )}
    </div>
    <span className="text-text-primary line-clamp-2 text-[13px] font-semibold">
      {product.name}
    </span>
    {product.weight !== null && (
      <span className="text-text-secondary text-[11px]">
        Berat Satuan: {product.weight} kg
      </span>
    )}
    {product.soldCount > 0 && (
      <span className="text-text-secondary text-[11px]">
        Terjual {formatSold(product.soldCount)}
      </span>
    )}
    <span className="text-button-primary text-[15px] font-bold">
      {formatPrice(product.price)}
    </span>
  </Link>
);

export default ProductTile;
