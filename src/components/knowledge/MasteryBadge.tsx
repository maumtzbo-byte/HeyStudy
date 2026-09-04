import { Capsule } from "@/components/ui/Capsule";

// Un solo color para el eje de conocimiento, con llenado variable.
//
// Antes esto pintaba el dominio de verde / ámbar / rojo según el score. El
// problema no era estético: cruzaba dos ejes distintos en un mismo canal.
// Rojo significa "urgente" en el resto del producto (entregas y exámenes
// encima), así que un tema débil pero sin prisa se leía como alarma, y el
// ojo tenía que decidir qué quería decir el color según dónde estuviera.
//
// Ahora el matiz responde una sola pregunta —¿esto está medido?— y la
// cantidad la responde el llenado. Verde/ámbar/rojo quedan libres para el
// eje de tiempo, donde sí significan una sola cosa.
//
// La etiqueta de texto no es decorativa: el gris de "sin evidencia" no
// alcanza contraste para portar el estado por sí solo, así que la palabra
// hace ese trabajo. Ningún estado de esta app se comunica sólo por color.
function getMasteryLabel(score: number, confidence: number) {
  if (confidence === 0) return "Sin evidencia";
  if (score >= 0.7) return "Dominado";
  if (score >= 0.4) return "En progreso";
  return "Débil";
}

export function MasteryBadge({ score, confidence }: { score: number; confidence: number }) {
  const measured = confidence > 0;
  const label = getMasteryLabel(score, confidence);
  const pct = measured ? Math.round(score * 100) : 0;

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={
          measured
            ? "rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"
            : "rounded-full bg-border/60 px-2.5 py-1 text-xs font-medium text-muted"
        }
      >
        {label}
        {measured ? ` · ${pct}%` : ""}
      </span>
      <Capsule fill={measured ? score : null} width={48} className="h-1.5" />
    </span>
  );
}
