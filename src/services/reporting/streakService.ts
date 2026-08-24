import "server-only";
import { prisma } from "@/lib/prisma/client";

function toDayNumber(date: Date): number {
  return Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
}

// Racha más larga que haya tenido nunca (para Wrapped — celebra el mejor
// momento, no el estado actual).
export function longestConsecutiveDayStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const days = [...new Set(dates.map(toDayNumber))].sort((a, b) => a - b);

  let longest = 1;
  let current = 1;
  for (let i = 1; i < days.length; i++) {
    current = days[i] === days[i - 1] + 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

// Racha activa terminando hoy (para el dashboard — es la que se rompe si
// no estudias, y es la que de verdad empuja a volver). Si hoy todavía no
// completa nada, sigue contando desde ayer para no "romper" la racha a
// media mañana; en cuanto pase un día completo sin actividad, cae a 0.
export function currentStreakDays(dates: Date[], today: Date): number {
  if (dates.length === 0) return 0;
  const dayNumbers = new Set(dates.map(toDayNumber));

  let cursor = toDayNumber(today);
  if (!dayNumbers.has(cursor)) {
    cursor -= 1;
    if (!dayNumbers.has(cursor)) return 0;
  }

  let streak = 0;
  while (dayNumbers.has(cursor)) {
    streak++;
    cursor--;
  }
  return streak;
}

// Un día "cuenta" si completó al menos un item de su plan ese día — misma
// señal que usa Wrapped.
export async function getStudyDates(studentProfileId: string): Promise<Date[]> {
  const plans = await prisma.studyPlan.findMany({
    where: { studentProfileId, items: { some: { completed: true } } },
    select: { forDate: true },
  });
  return plans.map((p) => p.forDate);
}
