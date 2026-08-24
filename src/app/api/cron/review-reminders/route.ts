import { NextResponse } from "next/server";
import { sendReviewReminders } from "@/services/notifications/reviewReminderService";

// Disparado una vez al día por Vercel Cron (ver vercel.json). Vercel manda
// automáticamente Authorization: Bearer $CRON_SECRET cuando esa env var
// existe — si CRON_SECRET no está configurada, la comparación nunca hace
// match y la ruta queda cerrada por default en vez de abierta.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const summary = await sendReviewReminders();
  return NextResponse.json(summary);
}
