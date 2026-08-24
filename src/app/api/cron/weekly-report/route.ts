import { NextResponse } from "next/server";
import { sendWeeklyReports } from "@/services/notifications/weeklyReportService";
import { isAuthorizedCronRequest } from "@/lib/cron/auth";

// Disparado una vez a la semana por Vercel Cron (ver vercel.json).
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const summary = await sendWeeklyReports();
  return NextResponse.json(summary);
}
