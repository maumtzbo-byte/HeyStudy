"use client";

import { useState, useTransition } from "react";
import { Video, VideoOff } from "lucide-react";
import { toggleStudyPlanItemAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/Button";

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
  // Preferencia por-item, no persistida: la global (preferredStudyMethod)
  // decide si se traen videos; esto sólo deja ocultar el bloque en un tema
  // puntual sin cambiar la preferencia de toda la cuenta. Por defecto
  // visibles, que es el comportamiento de antes de este cambio.
  const [hiddenVideoItemIds, setHiddenVideoItemIds] = useState<Set<string>>(new Set());

  function toggleVideosForItem(itemId: string) {
    setHiddenVideoItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  return (
    <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
      {items.map((item) => {
        const videosHidden = hiddenVideoItemIds.has(item.id);
        return (
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
            {item.videos.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => toggleVideosForItem(item.id)}
                aria-label={videosHidden ? "Mostrar videos" : "Ocultar videos"}
                title={videosHidden ? "Mostrar videos" : "Ocultar videos"}
              >
                {videosHidden ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </Button>
            )}
            <span className="shrink-0 text-xs font-medium text-muted">{item.minutes} min</span>
          </div>

          {item.videos.length > 0 && !videosHidden && (
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
        );
      })}
    </div>
  );
}
