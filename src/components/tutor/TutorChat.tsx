"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendMessageAction } from "@/app/dashboard/materias/[id]/tutor/actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { CardDescription } from "@/components/ui/Card";
import type { TutorMode } from "@/services/ai/types";

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

const MODE_LABELS: Record<TutorMode, string> = {
  socratico: "Socrático",
  explicar: "Explicar",
  pista: "Pista",
  practica: "Practicar",
};

export function TutorChat({
  conversationId,
  subjectName,
  mode,
  initialMessages,
}: {
  conversationId: string;
  subjectName: string;
  mode: TutorMode;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const content = input.trim();
    if (!content || isPending) return;
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");
    startTransition(async () => {
      const result = await sendMessageAction(conversationId, content);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: result.data }]);
    });
  }

  return (
    // 8rem = DashboardHeader's h-16 (4rem) + dashboard layout's py-8 (4rem)
    // — si cualquiera de los dos cambia, este cálculo hay que revisarlo.
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col gap-4">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">Tutor IA</h1>
        <p className="text-sm text-muted">
          {subjectName} · Modo {MODE_LABELS[mode]}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border border-border bg-surface p-4">
        {messages.length === 0 ? (
          <CardDescription>Escribe tu primera pregunta para empezar.</CardDescription>
        ) : (
          messages.map((m, i) => (
            <div
              key={m.id ?? i}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "self-end bg-accent text-accent-foreground"
                  : "self-start border border-border bg-background text-foreground"
              }`}
            >
              {m.content}
            </div>
          ))
        )}
        {isPending && (
          <div className="self-start rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-muted">
            Pensando...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-end gap-2">
        <Textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escribe tu pregunta..."
          className="flex-1"
        />
        <Button type="button" disabled={isPending || !input.trim()} onClick={handleSend}>
          Enviar
        </Button>
      </div>
    </div>
  );
}
