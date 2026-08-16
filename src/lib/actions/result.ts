import { unstable_rethrow } from "next/navigation";

// Forma única de resultado para todas las server actions. Antes cada acción
// inventaba la suya (algunas lanzaban, otras devolvían {error}, otras
// undefined), así que un fallo de la IA o de la base tumbaba la petición
// entera en vez de mostrarle algo útil al estudiante.

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

export function ok(): ActionResult<void>;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T | void> {
  return { ok: true, data: data as T };
}

export function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}

const GENERIC_ERROR = "Algo salió mal. Vuelve a intentarlo.";

// Errores que sí queremos mostrarle al estudiante tal cual (validaciones,
// "no encontrado"). Cualquier otra cosa se registra y se reemplaza por un
// mensaje genérico para no filtrar detalles internos.
export class UserFacingError extends Error {}

export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    // redirect() y notFound() de Next funcionan lanzando errores de control
    // de flujo: si los atrapáramos aquí, el redirect nunca ocurriría.
    unstable_rethrow(err);
    if (err instanceof UserFacingError) return { ok: false, error: err.message };
    console.error("[action]", err);
    return { ok: false, error: GENERIC_ERROR };
  }
}
