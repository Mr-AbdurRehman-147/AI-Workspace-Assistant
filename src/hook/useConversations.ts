import { useCallback, useEffect, useMemo, useState } from "react";
import type { Conversation, Message, ModelId } from "@/types";
import { MODELS } from "@/types";
import { storage } from "@/services/storage";

const DEFAULT_SYSTEM_PROMPT = "You are a helpful, precise AI assistant.";
const DEFAULT_MODEL: ModelId = "llama-3.3-70b-versatile";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function createConversation(overrides: Partial<Conversation> = {}): Conversation {
  const now = Date.now();
  return {
    id: uid(),
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    model: DEFAULT_MODEL,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    messages: [],
    ...overrides,
  };
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const list = storage.loadConversations();
    const validIds = new Set(MODELS.map((m) => m.id));
    const migrated = list.map((c) =>
      validIds.has(c.model) ? c : { ...c, model: DEFAULT_MODEL },
    );
    if (list.length === 0) {
      const first = createConversation();
      setConversations([first]);
      setActiveId(first.id);
    } else {
      setConversations(migrated);
      setActiveId(migrated[0].id);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) storage.saveConversations(conversations);
  }, [conversations, hydrated]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const update = useCallback((id: string, patch: Partial<Conversation> | ((c: Conversation) => Conversation)) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = typeof patch === "function" ? patch(c) : { ...c, ...patch };
        return { ...next, updatedAt: Date.now() };
      }),
    );
  }, []);

  const create = useCallback(
    (init?: Partial<Conversation>) => {
      const conv = createConversation({
        ...(active
          ? { model: active.model, systemPrompt: active.systemPrompt }
          : {}),
        ...init,
      });
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      return conv;
    },
    [active],
  );

  const remove = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (activeId === id) {
          if (filtered.length > 0) setActiveId(filtered[0].id);
          else {
            const fresh = createConversation();
            setActiveId(fresh.id);
            return [fresh];
          }
        }
        return filtered;
      });
    },
    [activeId],
  );

  const rename = useCallback(
    (id: string, title: string) => update(id, { title: title.trim() || "Untitled" }),
    [update],
  );

  const appendMessage = useCallback(
    (id: string, message: Message) =>
      update(id, (c) => {
        const messages = [...c.messages, message];
        const title =
          c.title === "New chat" && message.role === "user"
            ? message.content.slice(0, 48).replace(/\s+/g, " ").trim() || "New chat"
            : c.title;
        return { ...c, messages, title };
      }),
    [update],
  );

  const replaceMessages = useCallback(
    (id: string, messages: Message[]) => update(id, { messages }),
    [update],
  );

  return {
    hydrated,
    conversations,
    active,
    activeId,
    setActiveId,
    create,
    remove,
    rename,
    update,
    appendMessage,
    replaceMessages,
  };
}