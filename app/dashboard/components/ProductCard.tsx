import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

import ProductImage from "@/components/ProductImage";
import { formatPrice } from "@/lib/utils";
import type { ProductSuggestion } from "@/types/chat";

type ProductCardProps = {
  product: ProductSuggestion;
  onSelect?: () => void;
};

// Sits on a darker surface than the chat bubble so a recommendation reads as something to tap.
const ProductCard = ({ product, onSelect }: ProductCardProps) => (
  <Link
    href={`/dashboard/product/${product.id}`}
    onClick={onSelect}
    aria-label={`Lihat detail ${product.name}`}
    className="bg-surface border-divider hover:border-button-primary flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors active:opacity-80"
  >
    <ProductImage
      src={product.image}
      alt={`Foto ${product.name}`}
      sizes="48px"
      iconSize={20}
      className="size-[48px] rounded-[10px]"
    />
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-text-primary truncate font-semibold">{product.name}</span>
      <span className="text-text-secondary text-xs">
        {product.category} · {formatPrice(product.price)}
      </span>
    </div>
    <span className="text-button-primary flex shrink-0 items-center gap-1 text-xs font-semibold">
      Lihat
      <ChevronRight size={16} />
    </span>
  </Link>
);

export default ProductCard;
