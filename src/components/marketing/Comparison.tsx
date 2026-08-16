import { Check, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* ----------------------------------------------------------------------- */
/* Comparativa contra las alternativas reales del estudiante.               */
/*                                                                          */
/* Las columnas son con lo que de verdad compite HeyStudy, no marcas de     */
/* paja. Y los valores son honestos: donde la alternativa gana, gana — un   */
/* tutor particular sí resuelve dudas mejor que cualquier software, y decir */
/* lo contrario quema la credibilidad de toda la tabla.                     */
/*                                                                          */
/* En móvil no se usa la tabla: cuatro columnas en 390px obligan a scroll   */
/* horizontal y entonces sólo se ve una, que es justo perder la comparación.*/
/* Debajo de md cada fila se vuelve una tarjeta con las cuatro respuestas   */
/* visibles a la vez.                                                       */
/* ----------------------------------------------------------------------- */

type Verdict = "yes" | "partial" | "no";

const COLUMNS = ["HeyStudy", "Estudiar por tu cuenta", "IA de uso general", "Tutor particular"] as const;
const SHORT_COLUMNS = ["HeyStudy", "Por tu cuenta", "IA general", "Tutor"] as const;

const ROWS: { feature: string; values: [Verdict, Verdict, Verdict, Verdict] }[] = [
  { feature: "Detecta qué temas te fallan", values: ["yes", "no", "partial", "yes"] },
  { feature: "Te dice qué estudiar hoy", values: ["yes", "no", "partial", "partial"] },
  { feature: "Se reordena con tu progreso", values: ["yes", "no", "no", "partial"] },
  { feature: "Usa tus materias y tus fechas", values: ["yes", "partial", "no", "yes"] },
  { feature: "Disponible a cualquier hora", values: ["yes", "yes", "yes", "no"] },
  { feature: "Resuelve dudas en vivo, cara a cara", values: ["no", "no", "no", "yes"] },
  { feature: "Empieza gratis", values: ["yes", "yes", "partial", "no"] },
];

const VERDICT_LABEL: Record<Verdict, string> = {
  yes: "Sí",
  partial: "A medias",
  no: "No",
};

function Verdict({ value, labelled = false }: { value: Verdict; labelled?: boolean }) {
  const Icon = value === "yes" ? Check : value === "partial" ? Minus : X;
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-full",
        value === "yes" && "bg-accent text-accent-foreground",
        value === "partial" && "bg-border text-muted",
        value === "no" && "bg-transparent text-subtle",
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden />
      {labelled && <span className="sr-only">{VERDICT_LABEL[value]}</span>}
    </span>
  );
}

export function Comparison() {
  return (
    <>
      {/* Móvil — una tarjeta por criterio, las cuatro respuestas a la vista */}
      <ul className="flex flex-col gap-3 md:hidden">
        {ROWS.map(({ feature, values }) => (
          <li key={feature} className="rounded-2xl border border-border bg-background p-4">
            <p className="text-sm font-medium text-foreground">{feature}</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {values.map((v, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl px-1 py-2.5",
                    i === 0 && "bg-accent-soft",
                  )}
                >
                  <Verdict value={v} />
                  <span
                    className={cn(
                      "text-center text-[10px] leading-tight",
                      i === 0 ? "font-semibold text-foreground" : "text-subtle",
                    )}
                  >
                    {SHORT_COLUMNS[i]}
                  </span>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {/* md+ — la tabla completa */}
      <table className="hidden w-full border-collapse text-left md:table">
        <caption className="sr-only">
          Comparación de HeyStudy contra estudiar por tu cuenta, una IA de uso general y un tutor particular
        </caption>
        <thead>
          <tr>
            <th scope="col" className="w-[34%] pb-4" />
            {COLUMNS.map((col, i) => (
              <th
                key={col}
                scope="col"
                className={cn(
                  "pb-4 text-center align-bottom text-sm font-semibold",
                  i === 0 ? "text-foreground" : "font-medium text-muted",
                )}
              >
                {i === 0 ? (
                  <span className="inline-block rounded-lg bg-accent px-3 py-1.5 text-accent-foreground">{col}</span>
                ) : (
                  col
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ feature, values }) => (
            <tr key={feature} className="border-t border-border">
              <th scope="row" className="py-4 pr-4 text-sm font-medium text-foreground">
                {feature}
              </th>
              {values.map((v, i) => (
                <td key={i} className={cn("py-4 text-center", i === 0 && "bg-accent-soft/60")}>
                  <Verdict value={v} labelled />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
