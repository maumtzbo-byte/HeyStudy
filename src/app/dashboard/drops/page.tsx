import type { Metadata } from "next";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { getFeed } from "@/services/studydrops/studyDropService";
import { listSubjects } from "@/services/subjects/subjectService";
import { StudyDropFeed } from "@/components/drops/StudyDropFeed";

export const metadata: Metadata = { title: "Drops — HeyStudy" };

export default async function StudyDropsPage() {
  const { studentProfile } = await requireStudentProfile();

  const [feed, subjects] = await Promise.all([
    getFeed(studentProfile.id),
    listSubjects(studentProfile.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Drops</h1>
        <p className="text-muted">
          Video o foto corta de lo que estás estudiando — sólo lo ven tus amigos y tus grupos.
        </p>
      </div>

      <StudyDropFeed
        initialItems={feed.items}
        initialCursor={feed.nextCursor}
        subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
