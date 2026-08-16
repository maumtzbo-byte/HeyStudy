import type { Metadata } from "next";
import Link from "next/link";
import { Users, Share2 } from "lucide-react";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { listMyGroups } from "@/services/groups/studyGroupService";
import { CreateGroupForm, JoinGroupForm } from "@/components/groups/GroupForms";

export const metadata: Metadata = { title: "Grupos de estudio — HeyStudy" };

export default async function GruposPage() {
  const { studentProfile } = await requireStudentProfile();
  const groups = await listMyGroups(studentProfile.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Grupos de estudio</h1>
        <p className="mt-1 text-sm text-muted">
          Estudia acompañado: compite sanamente por tiempo de estudio y comparte los planes que tú decidas.
        </p>
      </div>

      {groups.length > 0 && (
        <section className="flex flex-col gap-3">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/dashboard/grupos/${group.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{group.name}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {group.memberCount} {group.memberCount === 1 ? "miembro" : "miembros"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {group.sharedPlanCount} {group.sharedPlanCount === 1 ? "plan compartido" : "planes compartidos"}
                  </span>
                </p>
              </div>
              <code className="shrink-0 rounded-lg bg-accent-soft px-3 py-1.5 font-mono text-sm font-semibold tracking-widest text-accent-hover">
                {group.joinCode}
              </code>
            </Link>
          ))}
        </section>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Crear un grupo</h2>
          <CreateGroupForm />
        </section>
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Unirme con un código</h2>
          <JoinGroupForm />
        </section>
      </div>

      {groups.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
          Todavía no estás en ningún grupo. Crea uno y pásale el código a tus compañeros.
        </p>
      )}

      <p className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-muted">
        <strong className="text-foreground">Qué ve tu grupo:</strong> tu nombre, cuánto tiempo llevas estudiado y tu
        avance en el ranking, más los planes que compartas a propósito. Tus diagnósticos, tu mapa de conocimiento, tus
        patrones de error y tus calificaciones nunca se comparten.
      </p>
    </div>
  );
}
