import type { Conversation, PromptTemplate } from "@/types";

const CONV_KEY = "aiw.conversations.v1";
const TPL_KEY = "aiw.templates.v1";
const THEME_KEY = "aiw.theme";

function isBrowser() {
  return typeof window !== "undefined";
}

export const storage = {
  loadConversations(): Conversation[] {
    if (!isBrowser()) return [];
    try {
      const raw = window.localStorage.getItem(CONV_KEY);
      return raw ? (JSON.parse(raw) as Conversation[]) : [];
    } catch {
      return [];
    }
  },
  saveConversations(list: Conversation[]) {
    if (!isBrowser()) return;
    window.localStorage.setItem(CONV_KEY, JSON.stringify(list));
  },
  loadTemplates(): PromptTemplate[] {
    if (!isBrowser()) return [];
    try {
      const raw = window.localStorage.getItem(TPL_KEY);
      return raw ? (JSON.parse(raw) as PromptTemplate[]) : [];
    } catch {
      return [];
    }
  },
  saveTemplates(list: PromptTemplate[]) {
    if (!isBrowser()) return;
    window.localStorage.setItem(TPL_KEY, JSON.stringify(list));
  },
  loadTheme(): "light" | "dark" | null {
    if (!isBrowser()) return null;
    const v = window.localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : null;
  },
  saveTheme(t: "light" | "dark") {
    if (!isBrowser()) return;
    window.localStorage.setItem(THEME_KEY, t);
  },
};