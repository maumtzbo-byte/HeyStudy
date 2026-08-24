import type { Metadata } from "next";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { DeleteAccountForm } from "@/components/account/DeleteAccountForm";
import { StudyMethodForm } from "@/components/account/StudyMethodForm";
import { ReviewRemindersToggle } from "@/components/account/ReviewRemindersToggle";

export const metadata: Metadata = { title: "Tu cuenta — HeyStudy" };

export default async function PerfilPage() {
  const { user, studentProfile } = await requireStudentProfile();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tu cuenta</h1>
        <p className="text-muted">{studentProfile.displayName} · {user.email}</p>
      </div>

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
    </div>
  );
}
