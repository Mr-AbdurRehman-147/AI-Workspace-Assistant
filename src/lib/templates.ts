import type { PromptTemplate } from "@/types";

export const BUILT_IN_TEMPLATES: PromptTemplate[] = [
  {
    id: "summarize",
    title: "Summarize Text",
    icon: "FileText",
    prompt: "Summarize the following text in clear, concise bullet points:\n\n",
    builtIn: true,
  },
  {
    id: "explain-code",
    title: "Explain Code",
    icon: "Code2",
    prompt: "Explain what the following code does, step by step:\n\n```\n\n```",
    builtIn: true,
  },
  {
    id: "rewrite",
    title: "Rewrite Content",
    icon: "PenLine",
    prompt: "Rewrite the following text to be clearer, more engaging, and grammatically correct:\n\n",
    builtIn: true,
  },
  {
    id: "translate",
    title: "Translate",
    icon: "Languages",
    prompt: "Translate the following text to English (or specify a target language):\n\n",
    builtIn: true,
  },
  {
    id: "ideas",
    title: "Generate Ideas",
    icon: "Lightbulb",
    prompt: "Generate 10 creative ideas about the following topic:\n\n",
    builtIn: true,
  },
  {
    id: "brainstorm",
    title: "Brainstorm",
    icon: "Sparkles",
    prompt: "Let's brainstorm together. Ask me questions to help me think through this:\n\n",
    builtIn: true,
  },
  {
    id: "email",
    title: "Create Email",
    icon: "Mail",
    prompt: "Write a professional email about the following. Include subject line and sign-off:\n\n",
    builtIn: true,
  },
];