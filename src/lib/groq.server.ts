import { z } from "zod";
import { MODELS } from "@/types";

const modelIds = MODELS.map((m) => m.id) as [string, ...string[]];

export const MAX_SYSTEM_PROMPT = 8_000;
export const MAX_MESSAGE_CONTENT = 16_000;
export const MAX_MESSAGES = 100;

export const ChatInputSchema = z.object({
  model: z.enum(modelIds),
  systemPrompt: z.string().max(MAX_SYSTEM_PROMPT).default(""),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(MAX_MESSAGE_CONTENT),
      }),
    )
    .min(1)
    .max(MAX_MESSAGES),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

/**
 * Origin guard. The chat endpoint has no user auth (this app is anonymous),
 * so we at minimum require the request to originate from one of this app's
 * own frontends to make direct scripted abuse of the Groq key harder.
 *
 * Note: an exact Origin.host === Host comparison does not work in the
 * Lovable preview, where the browser Origin is a `*.lovableproject.com`
 * domain but the server Host is the internal proxy host. Instead, allow
 * Origin hosts that belong to Lovable-hosted frontends or localhost.
 */
const ALLOWED_ORIGIN_SUFFIXES = [
  ".lovableproject.com",
  ".lovable.app",
  ".lovable.dev",
  ".lovable.host",
];

export function assertSameOrigin(originHeader: string | null, hostHeader: string | null) {
  if (!originHeader) {
    // Browsers always send Origin on cross-site POSTs; a missing Origin on
    // a POST typically means a non-browser client — reject.
    throw new Error("Forbidden: missing origin header.");
  }
  let originHost: string;
  try {
    originHost = new URL(originHeader).host;
  } catch {
    throw new Error("Forbidden: invalid origin.");
  }

  const hostname = originHost.split(":")[0];

  // Exact match with the request Host (production same-origin case).
  if (hostHeader && originHost === hostHeader) return;

  // Localhost dev.
  if (hostname === "localhost" || hostname === "127.0.0.1") return;

  // Lovable-hosted frontends (preview/published).
  if (ALLOWED_ORIGIN_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) return;

  throw new Error("Forbidden: cross-origin request rejected.");
}