export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  responseMs?: number;
}

export type ModelId =
  | "llama-3.3-70b-versatile"
  | "llama-3.1-8b-instant"
  | "openai/gpt-oss-120b"
  | "openai/gpt-oss-20b"
  | "moonshotai/kimi-k2-instruct";

export interface ModelOption {
  id: ModelId;
  label: string;
  provider: string;
}

export const MODELS: ModelOption[] = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile", provider: "Groq" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant", provider: "Groq" },
  { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B", provider: "Groq" },
  { id: "openai/gpt-oss-20b", label: "GPT-OSS 20B", provider: "Groq" },
  { id: "moonshotai/kimi-k2-instruct", label: "Kimi K2 Instruct", provider: "Groq" },
];

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: ModelId;
  systemPrompt: string;
  messages: Message[];
}

export interface PromptTemplate {
  id: string;
  title: string;
  icon?: string;
  prompt: string;
  builtIn?: boolean;
}