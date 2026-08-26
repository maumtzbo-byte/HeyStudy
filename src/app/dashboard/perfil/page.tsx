import type { Metadata } from "next";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import {
  updateWeeklyReportEnabledAction,
  updateDeadlineRemindersEnabledAction,
  updateParentReportEnabledAction,
} from "@/app/dashboard/perfil/actions";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { DeleteAccountForm } from "@/components/account/DeleteAccountForm";
import { StudyMethodForm } from "@/components/account/StudyMethodForm";
import { ReviewRemindersToggle } from "@/components/account/ReviewRemindersToggle";
import { EmailToggle } from "@/components/account/EmailToggle";
import { ParentEmailForm } from "@/components/account/ParentEmailForm";
import { CopyReferralLink } from "@/components/account/CopyReferralLink";
import { getReferralStats, REFERRAL_REWARD_DAYS } from "@/services/referrals/referralService";

export const metadata: Metadata = { title: "Tu cuenta — HeyStudy" };

export default async function PerfilPage() {
  const { user, studentProfile } = await requireStudentProfile();
  const referralStats = await getReferralStats(studentProfile.id, user.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://heystudy.app";
  const referralLink = `${appUrl}/registro?ref=${referralStats.code}`;
  const bonusActive = referralStats.bonusPaidUntil && referralStats.bonusPaidUntil > new Date();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Tu cuenta</h1>
        <p className="text-muted">{studentProfile.displayName} · {user.email}</p>
      </div>

      <section className="flex flex-col gap-4">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Preferencias de estudio</p>

        <Card className="flex flex-col gap-3">
          <CardTitle>Tu manera de estudiar</CardTitle>
          <CardDescription>
            Si prefieres video, tu plan de estudio te sugiere videos de YouTube para los temas en los que
            vas más flojo.
          </CardDescription>
          <StudyMethodForm current={studentProfile.preferredStudyMethod} />
        </Card>

        <Card className="flex flex-col gap-3">
          <CardTitle>Recordatorios de repaso</CardTitle>
          <CardDescription>
            Un correo al día cuando tengas temas listos para repasar — es lo que hace que la repetición
            espaciada sirva de algo, en vez de depender de que te acuerdes de abrir la app.
          </CardDescription>
          <ReviewRemindersToggle enabled={studentProfile.reviewRemindersEnabled} />
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Notificaciones por correo</p>

        <Card className="flex flex-col gap-3">
          <CardTitle>Otros correos</CardTitle>
          <CardDescription>Resumen de tu semana y aviso cuando tengas tareas o exámenes por vencer.</CardDescription>
          <EmailToggle
            action={updateWeeklyReportEnabledAction}
            fieldName="weeklyReportEnabled"
            enabled={studentProfile.weeklyReportEnabled}
            label="Mándame un resumen de mi semana"
          />
          <EmailToggle
            action={updateDeadlineRemindersEnabledAction}
            fieldName="deadlineRemindersEnabled"
            enabled={studentProfile.deadlineRemindersEnabled}
            label="Avísame cuando tenga tareas o exámenes por vencer"
          />
        </Card>

        <Card className="flex flex-col gap-3">
          <CardTitle>Reporte para tu padre, madre o tutor</CardTitle>
          <CardDescription>
            Opcional y apagado por default. Sólo incluye tiempo estudiado, sesiones y exámenes próximos —
            nunca tus calificaciones, tu mastery por tema ni tus conversaciones con el tutor.
          </CardDescription>
          <ParentEmailForm currentEmail={studentProfile.parentEmail} />
          <EmailToggle
            action={updateParentReportEnabledAction}
            fieldName="parentReportEnabled"
            enabled={studentProfile.parentReportEnabled}
            label="Mandarle un resumen semanal"
          />
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Referidos</p>

        <Card className="flex flex-col gap-3">
          <CardTitle>Invita y gana días de plan pagado</CardTitle>
          <CardDescription>
            Por cada persona que se registre con tu link y termine su registro inicial, ganas{" "}
            {REFERRAL_REWARD_DAYS} días de plan pagado gratis.
          </CardDescription>
          <CopyReferralLink link={referralLink} />
          <p className="text-sm text-muted">
            {referralStats.referralCount} {referralStats.referralCount === 1 ? "persona registrada" : "personas registradas"}
            {bonusActive && referralStats.bonusPaidUntil
              ? ` · plan pagado activo hasta ${referralStats.bonusPaidUntil.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}`
              : ""}
          </p>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <p className="text-xs font-semibold tracking-[0.14em] text-danger uppercase">Zona de peligro</p>

        <Card className="flex flex-col gap-3 border-danger/30">
          <CardTitle>Eliminar cuenta</CardTitle>
          <CardDescription>
            Borra permanentemente tu cuenta y todos tus datos: materias, tareas, exámenes, materiales,
            diagnósticos, planes de estudio y conversaciones con el tutor.
          </CardDescription>
          <div>
            <DeleteAccountForm email={user.email ?? ""} />
          </div>
        </Card>
      </section>
    </div>
  );
}
