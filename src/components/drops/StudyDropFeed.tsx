"use client";

import { useState, useTransition } from "react";
import { Card, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { loadMoreStudyDropsAction } from "@/app/dashboard/drops/actions";
import { StudyDropCard, type StudyDropFeedItem } from "@/components/drops/StudyDropCard";
import { StudyDropUploadForm } from "@/components/drops/StudyDropUploadForm";

// Dueño del estado de la lista, en vez de que page.tsx (server component) lo
// sea: publicar un drop nuevo necesita insertarlo optimistamente en la misma
// lista que "Cargar más" va extendiendo — un estado de servidor + un
// router.refresh() no alcanzaría porque este componente ya montado ignora
// props nuevas en su useState inicial.
export function StudyDropFeed({
  initialItems,
  initialCursor,
  subjects,
}: {
  initialItems: StudyDropFeedItem[];
  initialCursor: string | null;
  subjects: { id: string; name: string }[];
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    if (!cursor) return;
    setError(null);
    startTransition(async () => {
      const result = await loadMoreStudyDropsAction(cursor);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setItems((prev) => [...prev, ...result.data.items]);
      setCursor(result.data.nextCursor);
    });
  }

  function handlePosted(item: StudyDropFeedItem) {
    setItems((prev) => [item, ...prev]);
  }

  return (
    <div className="flex flex-col gap-6">
      <StudyDropUploadForm subjects={subjects} onPosted={handlePosted} />

      {items.length === 0 ? (
        <Card>
          <CardDescription>Todavía no hay drops de tus amigos o grupos. Sube el primero arriba.</CardDescription>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <StudyDropCard key={item.id} item={item} />
          ))}
          {error && <p className="text-sm text-danger">{error}</p>}
          {cursor && (
            <Button type="button" variant="secondary" onClick={handleLoadMore} disabled={isPending}>
              {isPending ? "Cargando..." : "Cargar más"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
