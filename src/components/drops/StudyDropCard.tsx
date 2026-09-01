"use client";

import { useState, useTransition } from "react";
import { Heart, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { toggleStudyDropLikeAction, deleteStudyDropAction } from "@/app/dashboard/drops/actions";

export type StudyDropFeedItem = {
  id: string;
  caption: string | null;
  mediaType: "VIDEO" | "IMAGEN";
  mediaUrl: string | null;
  subjectName: string | null;
  subjectColor: string | null;
  authorName: string;
  isOwn: boolean;
  createdAtLabel: string;
  likeCount: number;
  likedByMe: boolean;
};

export function StudyDropCard({ item }: { item: StudyDropFeedItem }) {
  const [liked, setLiked] = useState(item.likedByMe);
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggleLike() {
    // Optimista: el toggle se siente instantáneo, se revierte sólo si el
    // server action falla (rate limit, drop ya no visible, etc).
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setError(null);
    startTransition(async () => {
      const result = await toggleStudyDropLikeAction(item.id);
      if (!result.ok) {
        setLiked(prevLiked);
        setLikeCount(prevCount);
        setError(result.error);
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("¿Borrar este drop? No se puede deshacer.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteStudyDropAction(item.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDeleted(true);
    });
  }

  if (deleted) return null;

  return (
    <Card className="flex flex-col gap-3 p-0 overflow-hidden">
      {item.mediaUrl && item.mediaType === "VIDEO" && (
        <video src={item.mediaUrl} controls playsInline preload="metadata" className="max-h-[480px] w-full bg-black" />
      )}
      {item.mediaUrl && item.mediaType === "IMAGEN" && (
        // eslint-disable-next-line @next/next/no-img-element -- URL firmada remota de Supabase Storage, no un asset local optimizable.
        <img src={item.mediaUrl} alt="" className="max-h-[480px] w-full object-cover" />
      )}

      <div className="flex flex-col gap-3 px-5 pb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{item.authorName}</p>
            {item.subjectName && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: `${item.subjectColor}1a`, color: item.subjectColor ?? undefined }}
              >
                {item.subjectName}
              </span>
            )}
          </div>
          <span className="text-xs text-subtle">{item.createdAtLabel}</span>
        </div>

        {item.caption && <p className="text-sm text-foreground">{item.caption}</p>}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={isPending}
            className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-danger disabled:opacity-60"
          >
            <Heart className={cn("h-4 w-4", liked && "fill-danger text-danger")} strokeWidth={2} />
            {likeCount}
          </button>
          {item.isOwn && (
            <Button type="button" variant="ghost" size="icon" onClick={handleDelete} disabled={isPending}>
              <Trash2 className="h-4 w-4 text-muted" strokeWidth={1.75} />
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Card>
  );
}
