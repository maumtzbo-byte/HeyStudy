"use client";

import { useRef, useState } from "react";
import { Capsule, CapsuleRow } from "@/components/ui/Capsule";
import { Button, ButtonLink } from "@/components/ui/Button";
import { trackClient } from "@/components/analytics/PostHogProvider";

// El micro-diagnóstico: una pregunta real, la respuesta real de quien está
// leyendo, y una medición real de esa respuesta. Sin cuenta.
//
// REGLA QUE GOBIERNA TODO ESTE ARCHIVO: si no se pudo medir, la cápsula se
// queda GRIS. Nunca se muestra un resultado de ejemplo tras un error. Gris
// significa "no medido", que es exactamente lo que pasó — y es lo único que
// esta marca puede ofrecer sin usuarios: que no miente.

const SUBJECTS = ["Matemáticas", "Historia", "Biología", "Química", "Física", "Inglés"] as const;
const MAX_ANSWER = 600;
const COUNTER_FROM = 480;

type State =
  | { kind: "idle" }
  | { kind: "generating"; subject: string }
  | { kind: "answering"; subject: string; topic: string; question: string; correctAnswer: string }
  | { kind: "measuring"; subject: string; topic: string }
  | { kind: "measured"; subject: string; topic: string; mastery: number; errorPattern: string | null }
  | { kind: "error"; subject: string | null; message: string; canRetry: boolean };

export function MicroDiagnostic() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [answer, setAnswer] = useState("");
  const answerRef = useRef<HTMLTextAreaElement>(null);

  const activeSubject =
    state.kind === "idle" ? null : "subject" in state ? state.subject : null;

  async function pickSubject(subject: string) {
    setAnswer("");
    setState({ kind: "generating", subject });
    trackClient("subject_selected", { subject });

    try {
      const res = await fetch("/api/public/diagnostic/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      });
      const data = await res.json();

      if (!res.ok) {
        setState({ kind: "error", subject, message: data.error ?? "No pudimos preparar la pregunta.", canRetry: res.status !== 429 });
        trackClient("demo_error", { stage: "question", kind: String(res.status) });
        return;
      }

      setState({
        kind: "answering",
        subject,
        topic: data.topic,
        question: data.question,
        correctAnswer: data.correctAnswer ?? "",
      });
      // Foco automático sólo fuera de móvil: abrir el teclado sin permiso
      // taparía la pregunta que acaba de aparecer.
      if (window.matchMedia("(min-width: 768px)").matches) {
        requestAnimationFrame(() => answerRef.current?.focus());
      }
    } catch {
      setState({ kind: "error", subject, message: "Sin conexión. Vuelve a intentarlo cuando tengas señal.", canRetry: true });
      trackClient("demo_error", { stage: "question", kind: "network" });
    }
  }

  async function submitAnswer() {
    if (state.kind !== "answering") return;
    const trimmed = answer.trim();
    if (!trimmed) return;

    const { subject, topic, question, correctAnswer } = state;
    setState({ kind: "measuring", subject, topic });
    // Sólo la longitud, nunca el texto: lo que escribe un estudiante sobre
    // lo que no sabe no tiene por qué salir del navegador hacia analítica.
    trackClient("answer_submitted", { subject, answer_length: trimmed.length });

    try {
      const res = await fetch("/api/public/diagnostic/measure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, correctAnswer, answer: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setState({ kind: "error", subject, message: data.error ?? "No pudimos medir esta vez.", canRetry: res.status !== 429 });
        trackClient("demo_error", { stage: "measure", kind: String(res.status) });
        return;
      }

      setState({
        kind: "measured",
        subject,
        topic,
        mastery: data.masteryEstimate,
        errorPattern: data.errorPattern ?? null,
      });
      trackClient("measurement_shown", { subject, score_bucket: bucket(data.masteryEstimate) });
    } catch {
      setState({ kind: "error", subject, message: "Sin conexión. Vuelve a intentarlo cuando tengas señal.", canRetry: true });
      trackClient("demo_error", { stage: "measure", kind: "network" });
    }
  }

  function reset() {
    setAnswer("");
    setState({ kind: "idle" });
  }

  const busy = state.kind === "generating" || state.kind === "measuring";

  return (
    <div className="flex flex-col gap-8">
      {/* --- Chips de materia. Siempre visibles: cambiar de opinión no debe
             costar un paso atrás. --------------------------------------- */}
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">Elige una materia y te lo demuestro en 30 segundos.</p>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((subject) => {
            const selected = activeSubject === subject;
            const dimmed = activeSubject !== null && !selected;
            return (
              <button
                key={subject}
                type="button"
                disabled={busy}
                onClick={() => pickSubject(subject)}
                aria-pressed={selected}
                className={[
                  "inline-flex h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed",
                  selected
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border-strong/60 bg-surface text-foreground hover:border-border-strong",
                  dimmed ? "opacity-40" : "",
                ].join(" ")}
              >
                {subject}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Región del resultado. aria-live para que un lector de pantalla
             anuncie la medición en texto, no sólo la vea quien puede ver el
             llenado de la cápsula. ------------------------------------- */}
      <div aria-live="polite" className="min-h-[168px]">
        {state.kind === "idle" && (
          <div className="flex flex-col gap-3">
            <CapsuleRow fills={[null, null, null, null, null, null]} />
            <p className="text-sm text-subtle">Todavía no sabemos nada de ti.</p>
          </div>
        )}

        {state.kind === "generating" && (
          <div className="flex flex-col gap-3">
            <CapsuleRow fills={[null, null, null, null, null, null]} className="animate-pulse motion-reduce:animate-none" />
            <p className="text-sm text-muted">Buscando algo que valga la pena preguntarte…</p>
          </div>
        )}

        {state.kind === "answering" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium tracking-[0.08em] text-subtle uppercase">{state.topic}</p>
              <p className="font-display text-xl leading-snug font-semibold text-foreground">{state.question}</p>
            </div>
            <textarea
              ref={answerRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value.slice(0, MAX_ANSWER))}
              rows={3}
              placeholder="Contesta como puedas. No es examen."
              aria-label="Tu respuesta"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground placeholder:text-subtle focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={submitAnswer} disabled={!answer.trim()}>
                Medir mi respuesta
              </Button>
              {answer.length >= COUNTER_FROM && (
                <span className="text-xs text-muted tabular-nums">
                  {answer.length} / {MAX_ANSWER} · con dos o tres líneas basta
                </span>
              )}
              {!answer.trim() && (
                <span className="text-xs text-subtle">
                  Escribe lo que se te ocurra. Aunque no estés seguro — eso también se mide.
                </span>
              )}
            </div>
          </div>
        )}

        {state.kind === "measuring" && (
          <div className="flex flex-col gap-3">
            <Capsule fill={null} width={220} className="h-3 animate-pulse motion-reduce:animate-none" />
            <p className="text-sm text-muted">Midiendo tu respuesta…</p>
          </div>
        )}

        {state.kind === "measured" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium tracking-[0.08em] text-subtle uppercase">
                Tu nivel en {state.topic}
              </p>
              <div className="flex items-center gap-3">
                <Capsule fill={state.mastery} width={220} className="h-3" />
                <span className="font-display text-2xl font-bold text-foreground tabular-nums">
                  {Math.round(state.mastery * 100)}%
                </span>
              </div>
            </div>

            {/* El patrón de error puede venir en dos líneas o en cinco: su
                contenedor crece, no recorta. Si la IA no lo devuelve, esta
                línea simplemente no existe — no se inventa. */}
            {state.errorPattern && (
              <p className="max-w-prose text-sm leading-relaxed text-foreground">{state.errorPattern}</p>
            )}

            {/* La escala, sin números inventados: un tema medido, el resto
                gris. El argumento lo hace el contraste, no una cifra. */}
            <div className="flex flex-col gap-2 border-t border-border pt-5">
              <CapsuleRow fills={[state.mastery, null, null, null, null, null, null]} />
              <p className="text-sm text-muted">
                Eso fue un tema. El resto de {state.subject} sigue sin medir.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink href="/registro" onClick={() => trackClient("signup_from_demo", { subject: state.subject, score_bucket: bucket(state.mastery) })}>
                Medir el resto
              </ButtonLink>
              <Button type="button" variant="ghost" onClick={reset}>
                Probar otra materia
              </Button>
            </div>
          </div>
        )}

        {state.kind === "error" && (
          <div className="flex flex-col gap-4">
            {/* Gris, siempre. El error no produce un resultado de ejemplo. */}
            <CapsuleRow fills={[null, null, null, null]} />
            <p className="text-sm text-foreground">{state.message}</p>
            <div className="flex flex-wrap items-center gap-3">
              {state.canRetry && state.subject && (
                <Button type="button" variant="secondary" onClick={() => pickSubject(state.subject as string)}>
                  Intentar de nuevo
                </Button>
              )}
              {!state.canRetry && <ButtonLink href="/registro">Crear cuenta gratis</ButtonLink>}
              <Button type="button" variant="ghost" onClick={reset}>
                Elegir otra materia
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function bucket(score: number): "0-20" | "21-40" | "41-60" | "61-80" | "81-100" {
  const pct = Math.round(score * 100);
  if (pct <= 20) return "0-20";
  if (pct <= 40) return "21-40";
  if (pct <= 60) return "41-60";
  if (pct <= 80) return "61-80";
  return "81-100";
}
