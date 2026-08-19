export const DEEPSEEK_MODEL = "deepseek-v4-pro";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const TIMEOUT_MS = 30_000;

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type CompletionMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | { role: "assistant"; content: string | null; tool_calls: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

export type ToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required: string[];
      additionalProperties: false;
    };
  };
};

type CompletionResponse = {
  choices: {
    message: { content: string | null; tool_calls?: ToolCall[] };
    finish_reason: string;
  }[];
};

// Fail loudly instead of sending an unauthenticated request on every chat turn.
function apiKey(): string {
  const raw = process.env.DEEPSEEK_API_KEY;
  if (!raw) throw new Error("DEEPSEEK_API_KEY is missing");
  return raw;
}

export async function createCompletion(
  messages: CompletionMessage[],
  tools: ToolDefinition[],
): Promise<{ content: string | null; toolCalls: ToolCall[] }> {
  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({ model: DEEPSEEK_MODEL, messages, tools }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek responded ${response.status}`);
  }

  const data: CompletionResponse = await response.json();
  const message = data.choices[0]?.message;

  return { content: message?.content ?? null, toolCalls: message?.tool_calls ?? [] };
}
