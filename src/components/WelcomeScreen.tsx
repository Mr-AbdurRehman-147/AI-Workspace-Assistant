import { BUILT_IN_TEMPLATES } from "@/lib/templates";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  onPickTemplate: (prompt: string) => void;
}

export function WelcomeScreen({ onPickTemplate }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-16 text-center">
      <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7l4 10 4-6 4 6 4-10" />
        </svg>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">What can I help you build?</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Ask anything, or start from a template. Your conversations stay on this device.
      </p>

      <div className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BUILT_IN_TEMPLATES.slice(0, 6).map((t) => {
          const Icon = (Icons as unknown as Record<string, LucideIcon>)[t.icon || "Sparkles"] ?? Icons.Sparkles;
          return (
            <button
              key={t.id}
              onClick={() => onPickTemplate(t.prompt)}
              className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium">{t.title}</div>
              <div className="line-clamp-2 text-xs text-muted-foreground">
                {t.prompt.replace(/\n+/g, " ").slice(0, 90)}…
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}