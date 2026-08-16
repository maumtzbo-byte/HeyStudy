const FALLBACK_TIMEZONE = "America/Mexico_City";

// "Hoy" según la zona horaria del estudiante, normalizado a medianoche UTC
// para que embone con las columnas @db.Date de Prisma.
//
// Importa: usar la fecha UTC del servidor le daba el plan del día equivocado
// a cualquiera al oeste de UTC durante sus últimas horas del día — a las 7pm
// en Ciudad de México ya es el día siguiente en UTC, así que el plan "de hoy"
// se guardaba en el casillero de mañana.
export function todayInTimezone(timeZone: string | null | undefined): Date {
  const zone = timeZone || FALLBACK_TIMEZONE;
  let formatted: string;
  try {
    // en-CA entrega YYYY-MM-DD, que es justo lo que necesitamos.
    formatted = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    // Zona horaria inválida guardada en el perfil: no tiramos la petición.
    formatted = new Intl.DateTimeFormat("en-CA", {
      timeZone: FALLBACK_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }

  const [year, month, day] = formatted.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
