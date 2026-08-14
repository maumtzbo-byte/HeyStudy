import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getSubject } from "@/services/subjects/subjectService";
import { toggleAssignmentAction, deleteAssignmentAction, deleteExamAction } from "@/app/dashboard/materias/actions";
import { Card, CardTitle } from "@/components/ui/Card";
import { CreateAssignmentForm } from "@/components/subjects/CreateAssignmentForm";
import { CreateExamForm } from "@/components/subjects/CreateExamForm";
import { MaterialUploadForm } from "@/components/subjects/MaterialUploadForm";
import { MaterialList } from "@/components/subjects/MaterialList";
import { DeleteSubjectButton } from "@/components/subjects/DeleteSubjectButton";

export async function generateMetadata({ params }: PageProps<"/dashboard/materias/[id]">): Promise<Metadata> {
  const { id } = await params;
  const { studentProfile } = await requireStudentProfile();
  const subject = await getSubject(studentProfile.id, id);
  return { title: subject ? `${subject.name} — HeyStudy` : "Materia — HeyStudy" };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default async function SubjectDetailPage({ params }: PageProps<"/dashboard/materias/[id]">) {
  const { id } = await params;
  const { studentProfile } = await requireStudentProfile();
  const subject = await getSubject(studentProfile.id, id);
  if (!subject) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{subject.name}</h1>
          </div>
          <p className="text-muted">Tareas, exámenes y materiales de esta materia.</p>
        </div>
        <DeleteSubjectButton subjectId={subject.id} subjectName={subject.name} />
      </div>

      <Card className="flex flex-col gap-4">
        <CardTitle>Tareas</CardTitle>
        <CreateAssignmentForm subjectId={subject.id} />
        {subject.assignments.length === 0 ? (
          <p className="text-sm text-muted">Sin tareas todavía.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
            {subject.assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <form action={toggleAssignmentAction.bind(null, assignment.id, subject.id)}>
                  <button type="submit" className="flex items-center gap-3 text-left">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        assignment.status === "COMPLETADA"
                          ? "border-success bg-success text-white"
                          : "border-border"
                      }`}
                    >
                      {assignment.status === "COMPLETADA" && "✓"}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        assignment.status === "COMPLETADA" ? "text-muted line-through" : "text-foreground"
                      }`}
                    >
                      {assignment.title}
                    </span>
                  </button>
                </form>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{formatDate(assignment.dueDate)}</span>
                  <form action={deleteAssignmentAction.bind(null, assignment.id, subject.id)}>
                    <button type="submit" className="text-muted hover:text-danger" aria-label="Eliminar tarea">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <CardTitle>Exámenes</CardTitle>
        <CreateExamForm subjectId={subject.id} />
        {subject.exams.length === 0 ? (
          <p className="text-sm text-muted">Sin exámenes todavía.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
            {subject.exams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="text-sm font-medium text-foreground">{exam.title}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{formatDate(exam.examDate)}</span>
                  <form action={deleteExamAction.bind(null, exam.id, subject.id)}>
                    <button type="submit" className="text-muted hover:text-danger" aria-label="Eliminar examen">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <CardTitle>Materiales</CardTitle>
        <MaterialUploadForm subjectId={subject.id} />
        <MaterialList subjectId={subject.id} materials={subject.materials} />
      </Card>
    </div>
  );
}
