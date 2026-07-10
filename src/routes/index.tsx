import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useTheme } from "@/hooks/useTheme";
import { Sidebar } from "@/components/Sidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { SettingsPanel } from "@/components/SettingsPanel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const {
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
  } = useConversations();
  const { theme, toggle } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [pendingPrompt, setPendingPrompt] = useState<{ value: string; nonce: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 1024px)").matches) setSettingsOpen(false);
  }, []);

  const insertPrompt = (p: string) => {
    setPendingPrompt({ value: p, nonce: Date.now() });
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1024px)").matches) {
      setSettingsOpen(false);
    }
  };

  if (!hydrated || !active) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={() => create()}
          onRename={rename}
          onDelete={remove}
          theme={theme}
          onToggleTheme={toggle}
        />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border shadow-xl">
            <Sidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={setActiveId}
              onNew={() => create()}
              onRename={rename}
              onDelete={remove}
              theme={theme}
              onToggleTheme={toggle}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <ChatInterface
        conversation={active}
        appendMessage={appendMessage}
        replaceMessages={replaceMessages}
        update={update}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onToggleSettings={() => setSettingsOpen((v) => !v)}
        settingsOpen={settingsOpen}
        pendingPrompt={pendingPrompt}
      />

      <div
        className={cn(
          "hidden shrink-0 border-l border-border transition-[width] duration-200 lg:block",
          settingsOpen ? "w-80" : "w-0 overflow-hidden",
        )}
      >
        {settingsOpen && (
          <SettingsPanel
            conversation={active}
            onUpdate={(patch) => update(active.id, patch)}
            onInsertPrompt={insertPrompt}
          />
        )}
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSettingsOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[22rem] max-w-[92vw] border-l border-border bg-card shadow-xl">
            <SettingsPanel
              conversation={active}
              onUpdate={(patch) => update(active.id, patch)}
              onInsertPrompt={insertPrompt}
              onClose={() => setSettingsOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}