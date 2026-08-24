import { NextResponse } from "next/server";
import { sendDeadlineReminders } from "@/services/notifications/deadlineReminderService";
import { isAuthorizedCronRequest } from "@/lib/cron/auth";

// Disparado una vez al día por Vercel Cron (ver vercel.json).
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const summary = await sendDeadlineReminders();
  return NextResponse.json(summary);
}
