import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getCurrentUser";
import { synthesizeSpeech } from "@/services/ai/ttsService";
import { UserFacingError } from "@/lib/actions/result";

// Ruta aparte (no server action) porque el cliente necesita un <audio> o
// fetch+blob apuntando a una URL que devuelva audio/mpeg crudo — una server
// action no puede servir eso directo.
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  let text: unknown;
  try {
    const body = await request.json();
    text = body?.text;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  try {
    const audio = await synthesizeSpeech(user.id, text);
    return new NextResponse(new Uint8Array(audio), {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (err) {
    if (err instanceof UserFacingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[tutor/speak] error inesperado", err);
    return NextResponse.json({ error: "No se pudo generar el audio." }, { status: 500 });
  }
}
