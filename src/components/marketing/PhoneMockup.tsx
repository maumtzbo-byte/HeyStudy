import { DAILY_PLAN, EXAM_CONTEXT, FIXED_LEVEL_BAR_CLASS } from "@/components/marketing/visualData";

// Marco de teléfono real (no una foto generada) envolviendo la misma UI
// del plan diario — así el contenido siempre es exacto y on-brand. El
// volumen 3D lo da el padre (perspective + rotateY animado por scroll).
export function PhoneMockup() {
  return (
    <div className="relative w-[264px] rounded-[2.75rem] border-[10px] border-foreground bg-foreground shadow-2xl sm:w-[300px]">
      <div className="absolute top-0 left-1/2 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-foreground" />
      <div className="relative overflow-hidden rounded-[2rem] bg-surface">
        <div className="h-[560px] overflow-hidden px-5 pt-9 pb-6 sm:h-[636px]">
          <p className="text-xs text-muted">
            Buenos días, <span className="font-medium text-foreground">Alex</span>
          </p>
          <p className="text-[11px] text-subtle">Esto es lo que necesitas hoy.</p>

          <div className="mt-4 rounded-xl border border-border bg-background p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[9px] font-semibold tracking-wide text-subtle uppercase">
                  Preparación · {EXAM_CONTEXT.subject}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">Examen en {EXAM_CONTEXT.daysLeft} días</p>
              </div>
              <span className="font-display text-xl font-semibold text-foreground tabular-nums">
                {EXAM_CONTEXT.readiness}%
              </span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-accent" style={{ width: `${EXAM_CONTEXT.readiness}%` }} />
            </div>
          </div>

          <p className="mt-5 text-[10px] font-semibold tracking-wide text-subtle uppercase">Hoy</p>
          <div className="mt-2.5 flex flex-col gap-2.5">
            {DAILY_PLAN.map((task) => (
              <div key={task.topic} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[9px] font-medium tracking-wide text-subtle uppercase">{task.subject}</p>
                    <p className="mt-0.5 text-xs font-medium text-foreground">{task.topic}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium text-muted tabular-nums">{task.minutes} min</span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
                  <div className={`h-full rounded-full ${FIXED_LEVEL_BAR_CLASS[task.level]}`} style={{ width: "58%" }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-accent py-3 text-center text-xs font-medium text-accent-foreground">
            Empezar sesión
          </div>
        </div>
      </div>
    </div>
  );
}
