import { useEffect, useState } from "react";
import type { Conversation, PromptTemplate } from "@/types";
import { MODELS } from "@/types";
import { BUILT_IN_TEMPLATES } from "@/lib/templates";
import { storage } from "@/services/storage";
import { Download, FileText, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  conversation: Conversation;
  onUpdate: (patch: Partial<Conversation>) => void;
  onInsertPrompt: (prompt: string) => void;
  onClose?: () => void;
}

const SYSTEM_PRESETS = [
  { label: "Default", value: "You are a helpful, precise AI assistant." },
  { label: "Software Engineer", value: "You are a professional software engineer. Provide correct, idiomatic code and explain trade-offs." },
  { label: "Research Assistant", value: "You are an AI research assistant. Cite sources, be rigorous, note uncertainty." },
  { label: "Medical Advisor", value: "You are a medical advisor providing general educational information (not medical advice). Always recommend consulting a licensed professional." },
  { label: "Copywriter", value: "You are a senior copywriter. Write clear, punchy, on-brand copy with a strong hook." },
];

export function SettingsPanel({ conversation, onUpdate, onInsertPrompt, onClose }: Props) {
  const [customTemplates, setCustomTemplates] = useState<PromptTemplate[]>([]);
  const [newTplTitle, setNewTplTitle] = useState("");
  const [newTplPrompt, setNewTplPrompt] = useState("");

  useEffect(() => {
    setCustomTemplates(storage.loadTemplates());
  }, []);

  const persistTemplates = (list: PromptTemplate[]) => {
    setCustomTemplates(list);
    storage.saveTemplates(list);
  };

  const addTemplate = () => {
    if (!newTplTitle.trim() || !newTplPrompt.trim()) {
      toast.error("Title and prompt are required");
      return;
    }
    const t: PromptTemplate = {
      id: Math.random().toString(36).slice(2, 10),
      title: newTplTitle.trim(),
      prompt: newTplPrompt.trim(),
    };
    persistTemplates([t, ...customTemplates]);
    setNewTplTitle("");
    setNewTplPrompt("");
    toast.success("Template saved");
  };

  const removeTemplate = (id: string) => {
    persistTemplates(customTemplates.filter((t) => t.id !== id));
  };

  const exportAs = (format: "md" | "txt") => {
    const lines: string[] = [];
    if (format === "md") {
      lines.push(`# ${conversation.title}`);
      lines.push(`\n_Model: ${conversation.model} · Exported ${new Date().toLocaleString()}_\n`);
      if (conversation.systemPrompt) lines.push(`> **System:** ${conversation.systemPrompt}\n`);
      for (const m of conversation.messages) {
        lines.push(`\n---\n\n### ${m.role === "user" ? "You" : "Assistant"}\n\n${m.content}`);
      }
    } else {
      lines.push(`${conversation.title}`);
      lines.push(`Model: ${conversation.model}`);
      lines.push(`Exported: ${new Date().toLocaleString()}`);
      if (conversation.systemPrompt) lines.push(`\nSystem: ${conversation.systemPrompt}`);
      for (const m of conversation.messages) {
        lines.push(`\n[${m.role.toUpperCase()}]\n${m.content}`);
      }
    }
    const blob = new Blob([lines.join("\n")], { type: format === "md" ? "text/markdown" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${conversation.title.replace(/[^\w\-]+/g, "_") || "conversation"}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="flex h-full w-full flex-col bg-card text-card-foreground">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <div>
          <p className="text-sm font-semibold">Configuration</p>
          <p className="text-[11px] text-muted-foreground">Model, system prompt & templates</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {/* Model */}
        <section>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Model
          </label>
          <select
            value={conversation.model}
            onChange={(e) => onUpdate({ model: e.target.value as Conversation["model"] })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — {m.provider}
              </option>
            ))}
          </select>
        </section>

        {/* System prompt */}
        <section className="mt-5">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            System prompt
          </label>
          <textarea
            value={conversation.systemPrompt}
            onChange={(e) => onUpdate({ systemPrompt: e.target.value })}
            rows={4}
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            placeholder="Give the assistant instructions…"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SYSTEM_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => onUpdate({ systemPrompt: p.value })}
                className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* Templates */}
        <section className="mt-6">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Prompt templates
          </label>
          <div className="space-y-1">
            {BUILT_IN_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => onInsertPrompt(t.prompt)}
                className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left text-xs transition hover:border-border hover:bg-muted"
              >
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 truncate">{t.title}</span>
              </button>
            ))}
            {customTemplates.map((t) => (
              <div
                key={t.id}
                className="group flex items-center gap-1 rounded-lg border border-transparent px-1 py-1 hover:border-border hover:bg-muted"
              >
                <button
                  onClick={() => onInsertPrompt(t.prompt)}
                  className="flex flex-1 items-center gap-2 px-1 py-0.5 text-left text-xs"
                >
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span className="flex-1 truncate">{t.title}</span>
                </button>
                <button
                  onClick={() => removeTemplate(t.id)}
                  className="grid h-6 w-6 place-items-center rounded text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg border border-dashed border-border p-2.5">
            <input
              value={newTplTitle}
              onChange={(e) => setNewTplTitle(e.target.value)}
              placeholder="Template title"
              className="w-full rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary/40"
            />
            <textarea
              value={newTplPrompt}
              onChange={(e) => setNewTplPrompt(e.target.value)}
              placeholder="Prompt content…"
              rows={3}
              className="mt-1.5 w-full resize-y rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary/40"
            />
            <button
              onClick={addTemplate}
              className="mt-2 inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="h-3 w-3" />
              Save template
            </button>
          </div>
        </section>

        {/* Export */}
        <section className="mt-6">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Export
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => exportAs("md")}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs transition hover:border-primary/40 hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5" />
              Markdown
            </button>
            <button
              onClick={() => exportAs("txt")}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs transition hover:border-primary/40 hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5" />
              Plain text
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground">
          <p className="font-medium text-foreground">About</p>
          <p className="mt-1">
            AI Workspace is a client-side workspace. Responses are generated by a local mock provider so
            you can safely explore the UI. Swap the provider in <code>src/services/aiService.ts</code>.
          </p>
        </section>
      </div>
    </aside>
  );
}