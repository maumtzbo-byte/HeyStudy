import { NextResponse } from "next/server";
import { measureAnswer } from "@/services/diagnostic/microDiagnosticService";
import { clientIp } from "@/lib/http/clientIp";
import { UserFacingError } from "@/lib/actions/result";

// Topes de longitud de la entrada. No son cosmética: este endpoint es
// público y sin sesión, así que sin ellos alguien podría mandar textos
// arbitrarios en `question` y usar la ruta como un proxy gratis al modelo.
//
// Compromiso asumido y documentado: la pregunta y la respuesta de
// referencia viajan al cliente y regresan, así que un cliente malicioso
// puede mandar contenido propio en esos campos. La alternativa —firmarlos o
// guardarlos en servidor— pide un secreto nuevo o estado por sesión, y el
// techo del abuso aquí ya es bajo: 8 llamadas a Haiku por IP por hora, con
// un tope de tokens por llamada. Si esto crece, el arreglo correcto es
// firmar la pregunta con HMAC al generarla y verificarla aquí.
const MAX_QUESTION = 600;
const MAX_REFERENCE = 1200;
const MAX_ANSWER = 600;

export async function POST(request: Request) {
  let body: { question?: unknown; correctAnswer?: unknown; answer?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { question, correctAnswer, answer } = body;
  if (typeof question !== "string" || typeof answer !== "string") {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  if (question.length > MAX_QUESTION || answer.length > MAX_ANSWER) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const reference = typeof correctAnswer === "string" ? correctAnswer.slice(0, MAX_REFERENCE) : "";

  try {
    const ip = await clientIp();
    const measurement = await measureAnswer({
      question,
      correctAnswer: reference,
      studentAnswer: answer,
      ip,
    });
    return NextResponse.json(measurement);
  } catch (err) {
    if (err instanceof UserFacingError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    console.error("[micro-diagnostic/measure]", err);
    // Mensaje genérico y humano: el estudiante no tiene por qué cargar con
    // un fallo nuestro justo después de haber contestado algo.
    return NextResponse.json(
      { error: "No pudimos medir esta vez. No es tu respuesta, somos nosotros." },
      { status: 500 },
    );
  }
}
