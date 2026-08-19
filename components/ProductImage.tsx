import { Guitar } from "lucide-react";
import Image from "next/image";
import React from "react";

import { cn } from "@/lib/utils";

type ProductImageProps = {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  iconSize?: number;
  priority?: boolean;
};

// One fallback for photoless products, so every list and the detail page degrade identically.
const ProductImage = ({
  src,
  alt,
  sizes,
  className,
  iconSize = 24,
  priority,
}: ProductImageProps) => (
  <div className={cn("bg-quarternary relative shrink-0 overflow-hidden", className)}>
    {src ? (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    ) : (
      <span className="text-text-secondary flex size-full items-center justify-center">
        <Guitar size={iconSize} />
      </span>
    )}
  </div>
);

export default ProductImage;
