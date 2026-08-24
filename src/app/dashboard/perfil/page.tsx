import type { Metadata } from "next";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { DeleteAccountForm } from "@/components/account/DeleteAccountForm";

export const metadata: Metadata = { title: "Tu cuenta — HeyStudy" };

export default async function PerfilPage() {
  const { user, studentProfile } = await requireStudentProfile();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tu cuenta</h1>
        <p className="text-muted">{studentProfile.displayName} · {user.email}</p>
      </div>

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
