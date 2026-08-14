"use client";

import { setExamTopicsAction } from "@/app/dashboard/materias/[id]/examenes/[examId]/actions";
import { Button } from "@/components/ui/Button";

interface TopicOption {
  id: string;
  name: string;
}

export function ExamTopicSetupForm({
  subjectId,
  examId,
  topics,
  linkedTopicIds,
}: {
  subjectId: string;
  examId: string;
  topics: TopicOption[];
  linkedTopicIds: Set<string>;
}) {
  const boundAction = setExamTopicsAction.bind(null, subjectId, examId);

  return (
    <form action={boundAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {topics.map((topic) => (
          <label key={topic.id} className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="topicIds"
              value={topic.id}
              defaultChecked={linkedTopicIds.size === 0 || linkedTopicIds.has(topic.id)}
              className="h-4 w-4 rounded border-border accent-accent"
            />
            {topic.name}
          </label>
        ))}
      </div>
      <Button type="submit" size="sm" className="self-start">
        Guardar temas del examen
      </Button>
    </form>
  );
}
