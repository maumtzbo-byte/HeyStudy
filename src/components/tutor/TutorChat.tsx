"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Mic, Volume2, Loader2 } from "lucide-react";
import { sendMessageAction } from "@/app/dashboard/materias/[id]/tutor/actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { CardDescription } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
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

// Tipado mínimo de la Web Speech API (no está en lib.dom.d.ts) — sólo lo que
// usamos para dictar la pregunta. Ni Safari ni Firefox la soportan hoy, por
// eso todo lo que la usa está detrás de un feature-detect en tiempo de
// ejecución, nunca asumido.
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}
interface SpeechRecognitionResultListLike {
  [index: number]: SpeechRecognitionResultLike;
  length: number;
}
interface SpeechRecognitionEventLike extends Event {
  results: SpeechRecognitionResultListLike;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function TutorChat({
  conversationId,
  subjectName,
  mode,
  initialMessages,
  canUseVoice,
}: {
  conversationId: string;
  subjectName: string;
  mode: TutorMode;
  initialMessages: ChatMessage[];
  canUseVoice: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Voz: dictar la pregunta (Web Speech API, gratis) y escuchar la
  // respuesta (voz de IA por ElevenLabs, beneficio de plan pagado — ver
  // ttsService.ts). Son dos capacidades independientes: dictar no requiere
  // plan pagado, pero aquí solo se ofrece junto con "modo voz" para no
  // fragmentar la UI en un tercer estado a medias.
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const prevMessageCountRef = useRef(initialMessages.length);

  useEffect(() => {
    // Feature-detect en el cliente: `window` no existe en SSR, así que esto
    // no puede resolverse durante el render sin desincronizar del HTML del
    // servidor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSpeechSupported(getSpeechRecognitionCtor() !== null);
    return () => {
      recognitionRef.current?.stop();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const playMessage = useCallback(
    async (index: number, text: string) => {
      if (playingIndex === index) {
        audioRef.current?.pause();
        setPlayingIndex(null);
        return;
      }
      setSpeechError(null);
      setLoadingIndex(index);
      try {
        const res = await fetch("/api/tutor/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "No pudimos generar el audio.");
        }
        const blob = await res.blob();
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        if (audioRef.current) {
          audioRef.current.src = url;
          await audioRef.current.play();
          setPlayingIndex(index);
        }
      } catch (err) {
        setSpeechError(err instanceof Error ? err.message : "No pudimos generar el audio.");
      } finally {
        setLoadingIndex(null);
      }
    },
    [playingIndex],
  );

  // Modo voz: cuando llega una respuesta nueva del tutor, se lee sola —
  // así no hay que tocar la pantalla entre pregunta y respuesta.
  useEffect(() => {
    if (voiceMode && messages.length > prevMessageCountRef.current) {
      const last = messages[messages.length - 1];
      // playMessage hace fetch + play, no un simple espejo de estado — es
      // justo el caso de "reaccionar a un cambio externo" que sí pertenece
      // en un efecto.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (last.role === "assistant") void playMessage(messages.length - 1, last.content);
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, voiceMode, playMessage]);

  function toggleListening() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new Ctor();
    recognition.lang = "es-MX";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1]?.[0]?.transcript ?? "";
      setInput((prev) => (prev ? `${prev} ${transcript}`.trim() : transcript));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      setSpeechError("No pudimos escucharte. Intenta de nuevo.");
    };
    recognitionRef.current = recognition;
    setSpeechError(null);
    recognition.start();
    setIsListening(true);
  }

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
      <audio ref={audioRef} onEnded={() => setPlayingIndex(null)} className="hidden" />

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">Tutor IA</h1>
          <p className="text-sm text-muted">
            {subjectName} · Modo {MODE_LABELS[mode]}
          </p>
        </div>
        {canUseVoice ? (
          <Button
            type="button"
            variant={voiceMode ? "primary" : "secondary"}
            size="sm"
            onClick={() => setVoiceMode((v) => !v)}
          >
            <Volume2 className="h-4 w-4" strokeWidth={1.75} />
            {voiceMode ? "Modo voz activado" : "Activar modo voz"}
          </Button>
        ) : (
          <p className="text-xs text-subtle">
            <Link href="/#precios" className="font-medium text-accent hover:underline">
              Mejora tu plan
            </Link>{" "}
            para que el tutor te responda en voz.
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border border-border bg-surface p-4">
        {messages.length === 0 ? (
          <CardDescription>Escribe tu primera pregunta para empezar.</CardDescription>
        ) : (
          messages.map((m, i) => (
            <div
              key={m.id ?? i}
              className={cn(
                "flex max-w-[85%] items-end gap-1.5",
                m.role === "user" ? "self-end flex-row-reverse" : "self-start",
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm",
                  m.role === "user"
                    ? "bg-accent text-accent-foreground"
                    : "border border-border bg-background text-foreground",
                )}
              >
                {m.content}
              </div>
              {m.role === "assistant" && canUseVoice && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={playingIndex === i ? "Pausar audio" : "Escuchar respuesta"}
                  disabled={loadingIndex === i}
                  onClick={() => playMessage(i, m.content)}
                  className="shrink-0"
                >
                  {loadingIndex === i ? (
                    <Loader2 className="h-4 w-4 animate-spin text-subtle" strokeWidth={1.75} />
                  ) : (
                    <Volume2 className={cn("h-4 w-4", playingIndex === i ? "text-accent" : "text-subtle")} strokeWidth={1.75} />
                  )}
                </Button>
              )}
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
      {speechError && <p className="text-sm text-danger">{speechError}</p>}

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
        {canUseVoice && speechSupported && (
          <Button
            type="button"
            variant={isListening ? "primary" : "secondary"}
            size="icon"
            aria-label={isListening ? "Detener dictado" : "Dictar pregunta"}
            onClick={toggleListening}
            className={isListening ? "animate-pulse" : undefined}
          >
            <Mic className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        )}
        <Button type="button" disabled={isPending || !input.trim()} onClick={handleSend}>
          Enviar
        </Button>
      </div>
    </div>
  );
}
