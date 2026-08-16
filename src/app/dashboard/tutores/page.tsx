import type { Metadata } from "next";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma/client";
import { listCustomTutors } from "@/services/tutor/customTutorService";
import { CustomTutorForm } from "@/components/tutor/CustomTutorForm";
import { CustomTutorList, type TutorListItem } from "@/components/tutor/CustomTutorList";

export const metadata: Metadata = { title: "Mis tutores — HeyStudy" };

export default async function TutoresPage() {
  const { studentProfile } = await requireStudentProfile();

  const [tutors, subjects] = await Promise.all([
    listCustomTutors(studentProfile.id),
    prisma.subject.findMany({
      where: { studentProfileId: studentProfile.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const listItems: TutorListItem[] = tutors.map((t) => ({
    id: t.id,
    name: t.name,
    emoji: t.emoji,
    instructions: t.instructions,
    baseMode: t.baseMode,
    subjectId: t.subject?.id ?? null,
    subjectName: t.subject?.name ?? null,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Mis tutores</h1>
        <p className="mt-1 text-sm text-muted">
          Crea tutores con la personalidad que a ti te funcione. Después los eliges al abrir el chat de una materia.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-5 text-base font-semibold text-foreground">Nuevo tutor</h2>
        <CustomTutorForm subjects={subjects} />
      </section>

      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Tus tutores {listItems.length > 0 && <span className="text-subtle">({listItems.length})</span>}
        </h2>
        <CustomTutorList tutors={listItems} subjects={subjects} />
      </section>
    </div>
  );
}
