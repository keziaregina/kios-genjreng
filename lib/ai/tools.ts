import type { ToolDefinition } from "@/lib/ai/deepseek";
import { getCategories, searchProducts } from "@/lib/queries";
import { storeLabel } from "@/lib/store";
import type { ProductSuggestion } from "@/types/chat";

export const chatTools: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "listCategories",
      description: "Daftar semua kategori gitar yang tersedia di toko.",
      parameters: { type: "object", properties: {}, required: [], additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "searchProducts",
      description:
        "Cari produk di katalog. Semua filter opsional; tanpa filter berarti produk termurah.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "Nama kategori persis, misal Akustik" },
          keyword: { type: "string", description: "Potongan nama produk" },
          maxPrice: { type: "number", description: "Batas harga tertinggi dalam Rupiah" },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
];

type ToolOutcome = { content: string; products: ProductSuggestion[] };

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

// A bad argument is something the model can recover from, so it comes back as text instead of throwing.
export async function runTool(name: string, rawArguments: string): Promise<ToolOutcome> {
  let parsed: Record<string, unknown> = {};

  if (rawArguments.trim()) {
    try {
      parsed = JSON.parse(rawArguments) as Record<string, unknown>;
    } catch {
      return { content: "Argumen bukan JSON yang valid.", products: [] };
    }
  }

  if (name === "listCategories") {
    const categories = await getCategories();
    return { content: JSON.stringify(categories.map((item) => item.name)), products: [] };
  }

  if (name === "searchProducts") {
    const maxPrice = parsed.maxPrice;

    if (maxPrice !== undefined && (typeof maxPrice !== "number" || maxPrice < 0)) {
      return { content: "maxPrice harus angka >= 0.", products: [] };
    }

    const rows = await searchProducts({
      category: optionalString(parsed.category),
      keyword: optionalString(parsed.keyword),
      maxPrice: typeof maxPrice === "number" ? maxPrice : undefined,
    });

    const products: ProductSuggestion[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: row.price,
      category: row.category.name,
      image: row.image,
    }));

    return {
      content: JSON.stringify(
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          price: row.price,
          category: row.category.name,
          merchant: storeLabel(row.user),
        })),
      ),
      products,
    };
  }

  return { content: `Tool ${name} tidak dikenal.`, products: [] };
}
