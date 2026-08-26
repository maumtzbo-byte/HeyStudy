import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { listSubjects } from "@/services/subjects/subjectService";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { CreateSubjectForm } from "@/components/subjects/CreateSubjectForm";

export const metadata: Metadata = { title: "Materias — HeyStudy" };

export default async function MateriasPage() {
  const { studentProfile } = await requireStudentProfile();
  const subjects = await listSubjects(studentProfile.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Materias</h1>
        <p className="text-muted">Todo lo que cursas, en un solo lugar.</p>
      </div>

      <Card>
        <CreateSubjectForm />
      </Card>

      {subjects.length === 0 ? (
        <Card className="text-center">
          <CardDescription>Todavía no agregas ninguna materia. Empieza arriba.</CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Link key={subject.id} href={`/dashboard/materias/${subject.id}`}>
              <Card
                className="h-full border-t-4 transition-colors hover:border-accent/40"
                style={{ borderTopColor: subject.color }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.name.charAt(0).toUpperCase()}
                  </span>
                  <CardTitle>{subject.name}</CardTitle>
                  {subject._count.customTutors > 0 && (
                    <span
                      className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
                      title="Tiene un tutor personalizado"
                    >
                      <MessageCircle className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <CardDescription>
                  {subject._count.assignments} tareas · {subject._count.exams} exámenes ·{" "}
                  {subject._count.materials} materiales
                </CardDescription>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
