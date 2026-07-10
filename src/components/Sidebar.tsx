import { useMemo, useState } from "react";
import type { Conversation } from "@/types";
import { AppLogo } from "./AppLogo";
import { MessageSquare, Moon, Pencil, Plus, Search, Sun, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onClose?: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
  theme,
  onToggleTheme,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return list;
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q)),
    );
  }, [conversations, query]);

  const commitRename = (id: string) => {
    onRename(id, draftTitle);
    setEditingId(null);
  };

  const handleDelete = (c: Conversation) => {
    if (!confirm(`Delete "${c.title}"?`)) return;
    onDelete(c.id);
    toast.success("Conversation deleted");
  };

  return (
    <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-3">
        <AppLogo className="min-w-0 flex-1" />
        {onClose && (
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="p-3">
        <button
          onClick={onNew}
          className="group flex w-full items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="px-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="w-full rounded-lg border border-sidebar-border bg-sidebar-accent/40 py-1.5 pl-8 pr-2 text-xs outline-none placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="mt-2 min-h-0 flex-1 overflow-y-auto px-2 py-1">
        {filtered.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            {query ? "No matches" : "No conversations yet"}
          </p>
        )}
        <ul className="space-y-0.5">
          {filtered.map((c) => {
            const isActive = c.id === activeId;
            const isEditing = editingId === c.id;
            return (
              <li key={c.id}>
                <div
                  className={cn(
                    "group relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  {isEditing ? (
                    <input
                      autoFocus
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      onBlur={() => commitRename(c.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(c.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="min-w-0 flex-1 rounded border border-primary/40 bg-background px-1 py-0.5 text-xs outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        onSelect(c.id);
                        onClose?.();
                      }}
                      className="min-w-0 flex-1 truncate text-left text-xs"
                      title={c.title}
                    >
                      {c.title}
                    </button>
                  )}
                  {!isEditing && (
                    <div className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(c.id);
                          setDraftTitle(c.title);
                        }}
                        className="grid h-6 w-6 place-items-center rounded hover:bg-background/60"
                        aria-label="Rename"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(c);
                        }}
                        className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-background/60 hover:text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <button
          onClick={onToggleTheme}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </aside>
  );
}