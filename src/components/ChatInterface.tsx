import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowUp, Eraser, PanelLeft, PanelRight, Square } from "lucide-react";
import type { Conversation, Message } from "@/types";
import { MODELS } from "@/types";
import { aiService, estimateTokens } from "@/services/aiService";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { WelcomeScreen } from "./WelcomeScreen";
import { cn } from "@/lib/utils";

interface Props {
  conversation: Conversation;
  appendMessage: (id: string, m: Message) => void;
  replaceMessages: (id: string, list: Message[]) => void;
  update: (id: string, patch: Partial<Conversation>) => void;
  onToggleSidebar: () => void;
  onToggleSettings: () => void;
  settingsOpen: boolean;
  pendingPrompt?: { value: string; nonce: number } | null;
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function ChatInterface({
  conversation,
  appendMessage,
  replaceMessages,
  update,
  onToggleSidebar,
  onToggleSettings,
  settingsOpen,
  pendingPrompt,
}: Props) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const model = useMemo(
    () => MODELS.find((m) => m.id === conversation.model) ?? MODELS[0],
    [conversation.model],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation.messages, isSending]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [conversation.id]);

  useEffect(() => {
    if (!pendingPrompt) return;
    setInput((prev) => (prev ? prev + "\n\n" + pendingPrompt.value : pendingPrompt.value));
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, [pendingPrompt]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 220) + "px";
  }, [input]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        toast.error("Please enter a prompt");
        return;
      }
      if (isSending) return;

      const userMsg: Message = {
        id: uid(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };
      appendMessage(conversation.id, userMsg);
      setInput("");
      setIsSending(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await aiService.sendMessage({
          model: conversation.model,
          systemPrompt: conversation.systemPrompt,
          messages: [...conversation.messages, userMsg],
          signal: controller.signal,
        });
        appendMessage(conversation.id, {
          id: uid(),
          role: "assistant",
          content: res.content,
          createdAt: Date.now(),
          responseMs: res.responseMs,
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          toast.message("Response stopped");
        } else {
          const msg = err instanceof Error ? err.message : "Unknown error";
          toast.error(`Request failed: ${msg}`);
        }
      } finally {
        setIsSending(false);
        abortRef.current = null;
        setTimeout(() => textareaRef.current?.focus(), 0);
      }
    },
    [appendMessage, conversation.id, conversation.messages, conversation.model, conversation.systemPrompt, isSending],
  );

  const regenerate = useCallback(async () => {
    if (isSending) return;
    const msgs = [...conversation.messages];
    // Remove trailing assistant messages back to last user
    while (msgs.length && msgs[msgs.length - 1].role === "assistant") msgs.pop();
    if (msgs.length === 0) return;
    replaceMessages(conversation.id, msgs);
    setIsSending(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await aiService.sendMessage({
        model: conversation.model,
        systemPrompt: conversation.systemPrompt,
        messages: msgs,
        signal: controller.signal,
      });
      appendMessage(conversation.id, {
        id: uid(),
        role: "assistant",
        content: res.content,
        createdAt: Date.now(),
        responseMs: res.responseMs,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if ((err as Error).name !== "AbortError") toast.error(`Request failed: ${msg}`);
    } finally {
      setIsSending(false);
      abortRef.current = null;
    }
  }, [appendMessage, conversation.id, conversation.messages, conversation.model, conversation.systemPrompt, isSending, replaceMessages]);

  const stop = () => abortRef.current?.abort();

  const clearConversation = () => {
    if (conversation.messages.length === 0) return;
    if (!confirm("Clear all messages in this conversation?")) return;
    replaceMessages(conversation.id, []);
    update(conversation.id, { title: "New chat" });
    toast.success("Conversation cleared");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  const totalTokens = useMemo(() => {
    return (
      estimateTokens(conversation.systemPrompt) +
      conversation.messages.reduce((n, m) => n + estimateTokens(m.content), 0) +
      estimateTokens(input)
    );
  }, [conversation.messages, conversation.systemPrompt, input]);

  const isEmpty = conversation.messages.length === 0;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur">
        <button
          onClick={onToggleSidebar}
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h2 className="truncate text-sm font-medium">{conversation.title}</h2>
          <span className="hidden shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:inline">
            {model.label}
          </span>
        </div>
        <button
          onClick={clearConversation}
          className="hidden items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex"
        >
          <Eraser className="h-3.5 w-3.5" />
          Clear
        </button>
        <button
          onClick={onToggleSettings}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-md hover:bg-muted",
            settingsOpen ? "bg-muted text-foreground" : "text-muted-foreground",
          )}
          aria-label="Toggle settings"
        >
          <PanelRight className="h-4 w-4" />
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <WelcomeScreen onPickTemplate={(p) => { setInput(p); textareaRef.current?.focus(); }} />
        ) : (
          <div className="mx-auto w-full max-w-4xl">
            {conversation.messages.map((m, i) => (
              <MessageBubble
                key={m.id}
                message={m}
                canRegenerate={
                  !isSending &&
                  m.role === "assistant" &&
                  i === conversation.messages.length - 1
                }
                onRegenerate={regenerate}
              />
            ))}
            {isSending && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border bg-background/80 px-3 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder={`Message ${model.label}…  (Shift + Enter for newline)`}
              className="max-h-[220px] min-h-[36px] flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground"
              disabled={isSending}
            />
            {isSending ? (
              <button
                onClick={stop}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-destructive text-destructive-foreground shadow-sm transition hover:opacity-90"
                aria-label="Stop"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
            <span>Enter to send · Shift + Enter for newline</span>
            <span className="tabular-nums">~{totalTokens.toLocaleString()} tokens</span>
          </div>
        </div>
      </div>
    </div>
  );
}