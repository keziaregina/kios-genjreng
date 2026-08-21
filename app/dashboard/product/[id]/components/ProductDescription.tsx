"use client";

import React, { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type ProductDescriptionProps = { text: string };

// Only copy that really overflows four lines earns a toggle, so a short blurb keeps a clean block.
const ProductDescription = ({ text }: ProductDescriptionProps) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || expanded) return;

    const measure = () => setOverflows(node.scrollHeight > node.clientHeight + 1);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [expanded]);

  return (
    <div className="mt-1">
      <p
        ref={ref}
        className={cn(
          "text-text-secondary text-sm font-semibold",
          !expanded && "line-clamp-4",
        )}
      >
        {text}
      </p>

      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-button-primary mt-1 cursor-pointer text-xs font-bold"
        >
          {expanded ? "Lebih sedikit" : "Selengkapnya"}
        </button>
      )}
    </div>
  );
};

export default ProductDescription;
