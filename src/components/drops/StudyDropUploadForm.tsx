"use client";

import { useRef, useState, useTransition } from "react";
import { Camera } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { STUDY_DROPS_BUCKET } from "@/lib/constants/storage";
import { getStudyDropUploadUrlAction, createStudyDropAction } from "@/app/dashboard/drops/actions";
import type { StudyDropFeedItem } from "@/components/drops/StudyDropCard";

const MAX_VIDEO_SECONDS = 60;

// Lee la duración de un video seleccionado sin subirlo, usando un <video>
// oculto — sólo para avisar antes de gastar tiempo/datos subiendo algo que
// el server igual va a rechazar (el límite real vive en
// studyDropService.createStudyDrop).
function readVideoDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("No se pudo leer el video."));
    };
    video.src = URL.createObjectURL(file);
  });
}

export function StudyDropUploadForm({
  subjects,
  onPosted,
}: {
  subjects: { id: string; name: string }[];
  onPosted: (item: StudyDropFeedItem) => void;
}) {
  const [caption, setCaption] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "publishing">("idle");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Elige un video o una imagen.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        let durationSeconds: number | null = null;
        if (file.type.startsWith("video/")) {
          durationSeconds = Math.round(await readVideoDurationSeconds(file));
          if (durationSeconds > MAX_VIDEO_SECONDS) {
            setError(`El video no puede durar más de ${MAX_VIDEO_SECONDS} segundos.`);
            return;
          }
        }

        setStatus("uploading");
        const uploadUrlResult = await getStudyDropUploadUrlAction({
          fileName: file.name,
          contentType: file.type,
          fileSizeBytes: file.size,
        });
        if (!uploadUrlResult.ok) {
          setError(uploadUrlResult.error);
          return;
        }
        const { storagePath, token, mediaType } = uploadUrlResult.data;

        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from(STUDY_DROPS_BUCKET)
          .uploadToSignedUrl(storagePath, token, file, { contentType: file.type });
        if (uploadError) {
          setError("No se pudo subir el archivo. Intenta de nuevo.");
          return;
        }

        setStatus("publishing");
        const createResult = await createStudyDropAction({
          subjectId: subjectId || null,
          caption: caption.trim() || null,
          mediaType,
          storagePath,
          durationSeconds,
          fileSizeKb: Math.round(file.size / 1024),
        });
        if (!createResult.ok) {
          setError(createResult.error);
          return;
        }

        onPosted(createResult.data);
        setCaption("");
        setSubjectId("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } finally {
        setStatus("idle");
      }
    });
  }

  return (
    <Card as="section" className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Camera className="h-4 w-4 text-accent" strokeWidth={2} />
        Sube un drop
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,image/png,image/jpeg,image/webp"
        className="text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent-soft file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent"
      />
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="¿Qué estás estudiando? (opcional)"
        rows={2}
        maxLength={280}
        className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
      {subjects.length > 0 && (
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="w-fit rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        >
          <option value="">Sin materia</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" variant="primary" size="sm" className="w-fit" disabled={isPending}>
        {status === "uploading" ? "Subiendo..." : status === "publishing" ? "Publicando..." : "Publicar"}
      </Button>
      <p className="text-xs text-subtle">Video de hasta 60s o una imagen, máximo 60 MB. Solo lo ven tus amigos y grupos.</p>
      </form>
    </Card>
  );
}
