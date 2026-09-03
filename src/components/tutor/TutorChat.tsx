"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { UpgradeLink } from "@/components/analytics/UpgradeLink";
import { Mic, Volume2, Loader2, NotebookText, Sparkles } from "lucide-react";
import { sendMessageAction, generateWrapUpAction } from "@/app/dashboard/materias/[id]/tutor/actions";
import { startDiagnosticAction } from "@/app/dashboard/materias/[id]/diagnostico/actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardDescription } from "@/components/ui/Card";
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
  subjectId,
  subjectName,
  mode,
  initialMessages,
  initialNotes,
  canUseVoice,
}: {
  conversationId: string;
  subjectId: string;
  subjectName: string;
  mode: TutorMode;
  initialMessages: ChatMessage[];
  initialNotes: string | null;
  canUseVoice: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Libreta de notas + tema sugerido para practicar (ver
  // tutorService.generateWrapUp). suggestedTopic no se guarda en base de
  // datos — es efímero, se vuelve a calcular cada vez que se generan notas.
  const [notes, setNotes] = useState<string | null>(initialNotes);
  const [suggestedTopic, setSuggestedTopic] = useState<{ id: string; name: string } | null>(null);
  const [isGeneratingNotes, startNotesTransition] = useTransition();
  const [notesError, setNotesError] = useState<string | null>(null);
  const [isStartingPractice, startPracticeTransition] = useTransition();

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

  function handleGenerateNotes() {
    setNotesError(null);
    startNotesTransition(async () => {
      const result = await generateWrapUpAction(conversationId);
      if (!result.ok) {
        setNotesError(result.error);
        return;
      }
      setNotes(result.data.notes);
      setSuggestedTopic(result.data.suggestedTopic);
    });
  }

  function handlePractice(topicId: string) {
    setNotesError(null);
    startPracticeTransition(async () => {
      // Si tiene éxito redirige, así que sólo seguimos aquí cuando falló
      // (típicamente por el límite de diagnósticos del plan free).
      const result = await startDiagnosticAction(subjectId, topicId);
      if (!result.ok) setNotesError(result.error);
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
        <div className="flex flex-wrap items-center gap-2">
          {messages.length > 0 && (
            <Button type="button" variant="secondary" size="sm" disabled={isGeneratingNotes} onClick={handleGenerateNotes}>
              <NotebookText className="h-4 w-4" strokeWidth={1.75} />
              {isGeneratingNotes ? "Generando..." : notes ? "Actualizar mis notas" : "Generar mis notas"}
            </Button>
          )}
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
              <UpgradeLink source="tutor_voice_locked" className="font-medium text-accent hover:underline">
                Mejora tu plan
              </UpgradeLink>{" "}
              para que el tutor te responda en voz.
            </p>
          )}
        </div>
      </div>

      {notesError && <p className="text-sm text-danger">{notesError}</p>}

      {notes && (
        <Card className="flex flex-col gap-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <NotebookText className="h-4 w-4 text-accent" strokeWidth={1.75} />
            Tu libreta de esta conversación
          </p>
          <p className="whitespace-pre-line text-sm text-muted">{notes}</p>
          {suggestedTopic && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <p className="flex items-center gap-1.5 text-sm text-foreground">
                <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.75} />
                Te conviene practicar: <strong>{suggestedTopic.name}</strong>
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isStartingPractice}
                onClick={() => handlePractice(suggestedTopic.id)}
              >
                {isStartingPractice ? "Abriendo..." : "Practicar esto"}
              </Button>
            </div>
          )}
        </Card>
      )}

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
