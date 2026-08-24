"use client";

import { useTransition } from "react";
import { toggleStudyPlanItemAction } from "@/app/dashboard/actions";

interface VideoView {
  url: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}

interface StudyPlanItemView {
  id: string;
  title: string;
  reason: string;
  minutes: number;
  completed: boolean;
  videos: VideoView[];
}

export function StudyPlanList({ items }: { items: StudyPlanItemView[] }) {
  const [, startTransition] = useTransition();

  return (
    <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-3 px-4 py-3">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => startTransition(() => toggleStudyPlanItemAction(item.id))}
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                item.completed ? "border-success bg-success text-white" : "border-border"
              }`}
              aria-label={item.completed ? "Marcar como pendiente" : "Marcar como hecho"}
            >
              {item.completed && "✓"}
            </button>
            <div className="flex-1">
              <p className={`text-sm font-medium ${item.completed ? "text-muted line-through" : "text-foreground"}`}>
                {item.title}
              </p>
              <p className="text-xs text-muted">{item.reason}</p>
            </div>
            <span className="shrink-0 text-xs font-medium text-muted">{item.minutes} min</span>
          </div>

          {item.videos.length > 0 && (
            <div className="ml-8 flex flex-wrap gap-2">
              {item.videos.map((video) => (
                <a
                  key={video.url}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-48 shrink-0 flex-col gap-1 rounded-lg border border-border p-1.5 hover:bg-border/20"
                >
                  {video.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- thumbnail remoto de YouTube, no vale la pena configurar next/image sólo para esto.
                    <img src={video.thumbnailUrl} alt="" className="aspect-video w-full rounded object-cover" />
                  ) : null}
                  <p className="line-clamp-2 text-xs font-medium text-foreground">{video.title}</p>
                  <p className="truncate text-[11px] text-muted">{video.channelTitle}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
