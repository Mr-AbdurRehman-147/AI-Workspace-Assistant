import type { Message, ModelId } from "@/types";
import { chatCompletion } from "@/lib/groq.functions";

export interface AiRequest {
  model: ModelId;
  systemPrompt: string;
  messages: Message[];
  signal?: AbortSignal;
}

export interface AiResponse {
  content: string;
  responseMs: number;
}

export interface AiProvider {
  sendMessage(req: AiRequest): Promise<AiResponse>;
}

// Groq-backed provider. The interface stays provider-agnostic so a different
// backend (OpenAI, Anthropic, etc.) can be swapped in without UI changes.
export class GroqAiProvider implements AiProvider {
  async sendMessage({ model, systemPrompt, messages, signal }: AiRequest): Promise<AiResponse> {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const start = performance.now();
    const call = chatCompletion({
      data: {
        model,
        systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      },
    });

    const result = await new Promise<{ content: string }>((resolve, reject) => {
      const onAbort = () => reject(new DOMException("Aborted", "AbortError"));
      signal?.addEventListener("abort", onAbort, { once: true });
      call
        .then((r) => resolve(r as { content: string }))
        .catch(reject)
        .finally(() => signal?.removeEventListener("abort", onAbort));
    });

    return {
      content: result.content,
      responseMs: Math.round(performance.now() - start),
    };
  }
}

export const aiService: AiProvider = new GroqAiProvider();

// Rough token estimator: ~4 chars per token.
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}