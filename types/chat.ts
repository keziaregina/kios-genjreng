export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

// What the chat renders as a card — a narrowed `ProductWithRelations`, safe to send to the client.
export type ProductSuggestion = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string | null;
};

// One rendered turn: the text plus the cards its markers resolved to.
export type ChatBubble = ChatMessage & { products: ProductSuggestion[] };
