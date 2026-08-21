"use client";

import { MessageCircle, X } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { ChatBubble } from "@/types/chat";

import { sendChatMessage } from "../actions";
import ChatPanel from "./ChatPanel";

const HIDDEN_PATHS = ["/dashboard/profile", "/dashboard/cart"];

// The product detail page ends in a pinned buy bar, so the floating bubble would land on top of it.
const HIDDEN_PREFIXES = ["/dashboard/product/"];

// The sheet unmounts its own content when closed, so the conversation is owned one level up and survives it.
const ChatSheet = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || pending) return;

    const history: ChatBubble[] = [
      ...bubbles,
      { role: "user", content: text, products: [] },
    ];
    setBubbles(history);
    setError(null);
    setPending(true);

    const result = await sendChatMessage(
      history.map(({ role, content }) => ({ role, content })),
    );

    if (result.ok) {
      setBubbles([
        ...history,
        { role: "assistant", content: result.reply, products: result.products },
      ]);
    } else {
      setError(result.message);
    }

    setPending(false);
  };

  if (
    HIDDEN_PATHS.includes(pathname) ||
    HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Tanya asisten gitar"
        className="text-text-primary bg-button-secondary fixed right-[26px] bottom-[100px] z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full"
      >
        <MessageCircle />
      </SheetTrigger>

      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="bg-primary border-divider flex h-[85dvh] gap-0 rounded-t-2xl p-0"
      >
        <SheetHeader className="border-divider flex-row items-start justify-between border-b px-[26px] py-[18px]">
          <div className="flex flex-col gap-1">
            <SheetTitle className="text-text-primary text-[18px] font-extrabold">
              Konsultasi Gitar
            </SheetTitle>
            <SheetDescription className="text-text-secondary text-xs">
              Tanya apa saja soal gitar, nanti aku carikan yang cocok.
            </SheetDescription>
          </div>
          <SheetClose
            aria-label="Tutup konsultasi"
            className="text-text-secondary hover:text-text-primary cursor-pointer"
          >
            <X size={20} />
          </SheetClose>
        </SheetHeader>

        <ChatPanel
          bubbles={bubbles}
          pending={pending}
          error={error}
          onAsk={ask}
          onSelectProduct={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
};

export default ChatSheet;
