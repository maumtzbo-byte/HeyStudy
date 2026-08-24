const LOCALE = "es-MX";

// Un solo punto de construcción de Intl.DateTimeFormat en vez de repetirlo
// en cada page.tsx que muestra una fecha — antes había 5 copias con
// opciones que fueron divergiendo (una traía year, otra no; una fijaba
// timeZone: "UTC" y las demás no), sin ningún lugar central para
// corregirlo. Cada llamada sigue pudiendo pasar sus propias options.
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(LOCALE, options ?? { day: "numeric", month: "short", year: "numeric" }).format(date);
}
