import { NextResponse } from "next/server";
import { generateDemoPlan } from "@/services/marketing/demoPlanService";
import { clientIp } from "@/lib/http/clientIp";
import { UserFacingError } from "@/lib/actions/result";

export async function POST(request: Request) {
  let subject: unknown;
  try {
    const body = await request.json();
    subject = body?.subject;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (typeof subject !== "string") {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  try {
    const ip = await clientIp();
    const items = await generateDemoPlan({ subject, ip });
    return NextResponse.json({ items });
  } catch (err) {
    if (err instanceof UserFacingError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    console.error("[demo-plan] error inesperado", err);
    return NextResponse.json({ error: "No se pudo generar el ejemplo." }, { status: 500 });
  }
}
