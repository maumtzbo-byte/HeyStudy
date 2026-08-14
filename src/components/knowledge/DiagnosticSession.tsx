"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { submitAnswerAction, finishSessionAction, type AnswerActionState } from "@/app/dashboard/materias/[id]/diagnostico/actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardDescription } from "@/components/ui/Card";

interface DiagnosticQuestion {
  id: string;
  prompt: string;
  difficulty: "FACIL" | "MEDIO" | "DIFICIL";
  topicName: string;
  answered: boolean;
}

const DIFFICULTY_LABELS: Record<DiagnosticQuestion["difficulty"], string> = {
  FACIL: "Fácil",
  MEDIO: "Medio",
  DIFICIL: "Difícil",
};

function QuestionForm({ question, onAnswered }: { question: DiagnosticQuestion; onAnswered: () => void }) {
  const boundAction = submitAnswerAction.bind(null, question.id);
  const [state, formAction, isPending] = useActionState<AnswerActionState, FormData>(boundAction, undefined);

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {question.topicName} · {DIFFICULTY_LABELS[question.difficulty]}
        </p>
        <p className="mt-2 text-base font-medium text-foreground">{question.prompt}</p>
      </div>

      {state && "result" in state ? (
        <div className="flex flex-col gap-3">
          <div
            className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
              state.result.isCorrect ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
            }`}
          >
            {state.result.isCorrect ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{state.result.feedback}</span>
          </div>
          <Button type="button" onClick={onAnswered} className="self-start">
            Siguiente
          </Button>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-3">
          <Textarea name="studentResponse" rows={3} placeholder="Escribe tu respuesta" required />
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <Button type="submit" disabled={isPending} className="self-start">
            {isPending ? "Evaluando..." : "Responder"}
          </Button>
        </form>
      )}
    </Card>
  );
}

export function DiagnosticSession({
  subjectId,
  sessionId,
  questions,
  alreadyCompleted,
}: {
  subjectId: string;
  sessionId: string;
  questions: DiagnosticQuestion[];
  alreadyCompleted: boolean;
}) {
  const firstUnanswered = questions.findIndex((q) => !q.answered);
  const [index, setIndex] = useState(firstUnanswered === -1 ? questions.length : firstUnanswered);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (alreadyCompleted) return;
    if (index >= questions.length && questions.length > 0) {
      startTransition(() => finishSessionAction(sessionId, subjectId));
    }
  }, [index, questions.length, sessionId, subjectId, alreadyCompleted]);

  if (questions.length === 0) {
    return (
      <Card>
        <CardDescription>No se pudieron generar preguntas para este diagnóstico.</CardDescription>
      </Card>
    );
  }

  const current = questions[index];

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted">
          Pregunta {Math.min(index + 1, questions.length)} de {questions.length}
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${(Math.min(index, questions.length) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {current ? (
        <QuestionForm key={current.id} question={current} onAnswered={() => setIndex((i) => i + 1)} />
      ) : (
        <Card>
          <CardDescription>Guardando tu progreso...</CardDescription>
        </Card>
      )}
    </div>
  );
}
