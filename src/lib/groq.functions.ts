import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { ChatInputSchema, assertSameOrigin } from "./groq.server";

export const chatCompletion = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ChatInputSchema.parse(data))
  .handler(async ({ data }) => {
    // Same-origin guard: this endpoint has no user auth, so at minimum
    // require requests to come from this app's own frontend.
    assertSameOrigin(
      getRequestHeader("origin") ?? null,
      getRequestHeader("host") ?? null,
    );

    const apiKey = process.env.groq_secret_key;
    if (!apiKey) {
      throw new Error(
        "Groq API key is not configured. Please set the `groq_secret_key` secret.",
      );
    }

    const payload = {
      model: data.model,
      messages: [
        ...(data.systemPrompt.trim()
          ? [{ role: "system" as const, content: data.systemPrompt }]
          : []),
        ...data.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    };

    let res: Response;
    try {
      res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error("Network error reaching Groq. Please try again.");
    }

    if (!res.ok) {
      let providerMessage = "";
      try {
        const errBody = (await res.json()) as { error?: { message?: string } };
        providerMessage = errBody?.error?.message ?? "";
      } catch {
        // ignore
      }

      if (res.status === 401) {
        throw new Error(
          "Invalid Groq API key. Please update the `groq_secret_key` secret.",
        );
      }
      if (res.status === 429) {
        throw new Error("Rate limit reached on Groq. Please wait and retry.");
      }
      if (res.status >= 500) {
        throw new Error("Groq service is unavailable. Please try again shortly.");
      }
      throw new Error(
        providerMessage || `Groq request failed (status ${res.status}).`,
      );
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    if (!content) {
      throw new Error("Groq returned an empty response.");
    }
    return { content };
  });