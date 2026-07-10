import { useState } from "react";
import type { Message } from "@/types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Check, Copy, RefreshCw, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  message: Message;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
}

export function MessageBubble({ message, onRegenerate, canRegenerate }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className={cn("group flex w-full gap-3 px-4 py-4 sm:px-6", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7l4 10 4-6 4 6 4-10" />
          </svg>
        </div>
      )}

      <div className={cn("flex min-w-0 max-w-[min(100%,52rem)] flex-col", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm shadow-sm ring-1 ring-inset transition",
            isUser
              ? "bg-primary text-primary-foreground ring-primary/20"
              : "bg-card text-card-foreground ring-border",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {!isUser && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground opacity-0 transition group-hover:opacity-100">
            <button
              onClick={copy}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-muted hover:text-foreground"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            {canRegenerate && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-muted hover:text-foreground"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </button>
            )}
            {message.responseMs != null && (
              <span className="ml-auto tabular-nums">{(message.responseMs / 1000).toFixed(2)}s</span>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground ring-1 ring-border">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex w-full gap-3 px-4 py-4 sm:px-6">
      <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7l4 10 4-6 4 6 4-10" />
        </svg>
      </div>
      <div className="rounded-2xl bg-card px-4 py-3 shadow-sm ring-1 ring-inset ring-border">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
        </div>
      </div>
    </div>
  );
}