import { NextResponse } from "next/server";
import { generateMicroQuestion } from "@/services/diagnostic/microDiagnosticService";
import { clientIp } from "@/lib/http/clientIp";
import { UserFacingError } from "@/lib/actions/result";

export async function POST(request: Request) {
  let subject: unknown;
  try {
    subject = (await request.json())?.subject;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  if (typeof subject !== "string") {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  try {
    const ip = await clientIp();
    const question = await generateMicroQuestion({ subject, ip });
    return NextResponse.json(question);
  } catch (err) {
    if (err instanceof UserFacingError) {
      // 429 para el tope, 400 para "materia no válida". El cliente los
      // distingue para mostrar el copy correcto.
      const status = err.message.includes("Materia") ? 400 : 429;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[micro-diagnostic/question]", err);
    return NextResponse.json({ error: "No pudimos preparar la pregunta." }, { status: 500 });
  }
}
