"use client";

import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatBubble } from "@/types/chat";

import ProductCard from "./ProductCard";

type ChatPanelProps = {
  bubbles: ChatBubble[];
  pending: boolean;
  error: string | null;
  onAsk: (question: string) => void;
  onSelectProduct: () => void;
};

type ComposerValues = { message: string };

const PRODUCT_MARKER = /\[\[product:(\d+)\]\]/g;

const SUGGESTIONS = [
  "Gitar buat pemula?",
  "Budget 2 juta dapat apa?",
  "Beda akustik sama elektrik?",
];

const fieldClass =
  "bg-quarternary text-text-primary flex-1 rounded-xl px-4 py-3 text-sm font-semibold outline-none";

// The marker keeps the card where the model put it, instead of dumping every card at the end.
function renderBubble(bubble: ChatBubble, onSelectProduct: () => void) {
  const byId = new Map(bubble.products.map((product) => [product.id, product]));

  return bubble.content.split(PRODUCT_MARKER).map((part, index) => {
    const product = byId.get(Number(part));

    if (index % 2 === 1 && product) {
      return (
        <ProductCard
          key={`${index}-${product.id}`}
          product={product}
          onSelect={onSelectProduct}
        />
      );
    }
    if (index % 2 === 1) return null;
    if (!part.trim()) return null;

    return <p key={index}>{part.trim()}</p>;
  });
}

const ChatPanel = ({
  bubbles,
  pending,
  error,
  onAsk,
  onSelectProduct,
}: ChatPanelProps) => {
  const scroller = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset } = useForm<ComposerValues>();

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [bubbles, pending]);

  const onSubmit = handleSubmit((values) => {
    onAsk(values.message);
    reset();
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scroller}
        className="flex flex-1 flex-col overflow-y-auto px-[26px] py-[18px]"
      >
        {/* mt-auto pins a short conversation to the bottom the way a messaging app does. */}
        <div className="mt-auto flex flex-col gap-[14px]">
          {bubbles.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant="selected"
                  className="cursor-pointer rounded-2xl"
                  onClick={() => onAsk(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          )}

          {bubbles.map((bubble, index) => (
            <div
              key={index}
              className={cn(
                "text-text-primary flex max-w-[85%] flex-col gap-2 rounded-2xl px-4 py-3 text-sm",
                bubble.role === "user"
                  ? "bg-button-primary self-end"
                  : "bg-quarternary self-start",
              )}
            >
              {bubble.role === "user" ? (
                <p>{bubble.content}</p>
              ) : (
                renderBubble(bubble, onSelectProduct)
              )}
            </div>
          ))}

          {pending && (
            <p className="text-text-secondary self-start text-sm">
              Sedang mengetik...
            </p>
          )}
          {error && <p className="text-button-primary text-xs">{error}</p>}
        </div>
      </div>

      <form
        className="border-divider flex shrink-0 gap-2 border-t px-[26px] py-[18px]"
        onSubmit={onSubmit}
      >
        <input
          {...register("message")}
          placeholder="Tanya soal gitar..."
          autoComplete="off"
          className={fieldClass}
        />
        <Button
          type="submit"
          className="cursor-pointer px-5 py-6"
          disabled={pending}
        >
          Kirim
        </Button>
      </form>
    </div>
  );
};

export default ChatPanel;
