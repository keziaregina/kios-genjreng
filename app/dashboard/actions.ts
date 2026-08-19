"use server";

import {
  createCompletion,
  type CompletionMessage,
} from "@/lib/ai/deepseek";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { chatTools, runTool } from "@/lib/ai/tools";
import { requireUser } from "@/lib/auth/guards";
import { createRateLimiter } from "@/lib/rate-limit";
import type { ChatMessage, ProductSuggestion } from "@/types/chat";

export type ChatResult =
  | { ok: true; reply: string; products: ProductSuggestion[] }
  | { ok: false; message: string };

const MAX_HISTORY = 20;
const MAX_CONTENT = 1000;
const MAX_ROUNDS = 3;
const PRODUCT_MARKER = /\[\[product:(\d+)\]\]/g;

// Every turn can cost three upstream calls, so the quota is per user and per minute.
const chatLimiter = createRateLimiter({ limit: 20, windowMs: 60_000 });

function invalid(history: ChatMessage[]): string | null {
  if (history.length === 0 || history.length > MAX_HISTORY) {
    return "Percakapan terlalu panjang, mulai lagi dari awal.";
  }
  if (history.some((item) => item.content.length > MAX_CONTENT)) {
    return "Pesan terlalu panjang.";
  }
  if (history[history.length - 1].role !== "user") {
    return "Pesan terakhir harus dari kamu.";
  }
  return null;
}

export async function sendChatMessage(history: ChatMessage[]): Promise<ChatResult> {
  const session = await requireUser();
  const key = `chat:${session.userId}`;

  const quota = chatLimiter.check(key);
  if (!quota.allowed) {
    return { ok: false, message: "Terlalu banyak pertanyaan, coba lagi sebentar lagi." };
  }

  const problem = invalid(history);
  if (problem) return { ok: false, message: problem };

  chatLimiter.record(key);

  const messages: CompletionMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((item) => ({ role: item.role, content: item.content })),
  ];
  const seen = new Map<number, ProductSuggestion>();

  try {
    for (let round = 0; round < MAX_ROUNDS; round += 1) {
      const { content, toolCalls } = await createCompletion(messages, chatTools);

      if (toolCalls.length === 0) {
        return finish(content, seen);
      }

      messages.push({ role: "assistant", content, tool_calls: toolCalls });

      for (const call of toolCalls) {
        const outcome = await runTool(call.function.name, call.function.arguments);
        outcome.products.forEach((product) => seen.set(product.id, product));
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: outcome.content,
        });
      }
    }

    const { content } = await createCompletion(messages, chatTools);
    return finish(content, seen);
  } catch (error) {
    console.error("[sendChatMessage]", error);
    return { ok: false, message: "Asisten sedang tidak bisa dihubungi." };
  }
}

// Only ids the tools actually returned survive, so a hallucinated id can never become a link.
function finish(content: string | null, seen: Map<number, ProductSuggestion>): ChatResult {
  const text = content?.trim();
  if (!text) return { ok: false, message: "Asisten tidak memberi jawaban." };

  const products: ProductSuggestion[] = [];
  const reply = text.replace(PRODUCT_MARKER, (marker, id: string) => {
    const product = seen.get(Number(id));
    if (!product) return "";
    if (!products.some((item) => item.id === product.id)) products.push(product);
    return marker;
  });

  return { ok: true, reply: reply.trim(), products };
}
