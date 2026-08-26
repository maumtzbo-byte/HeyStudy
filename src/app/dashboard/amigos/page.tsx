import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { listFriends, listPendingRequests } from "@/services/friends/friendService";
import { Card, CardDescription } from "@/components/ui/Card";
import { AddFriendForm } from "@/components/friends/AddFriendForm";
import { IncomingRequestActions, RemoveFriendButton } from "@/components/friends/FriendRequestActions";

export const metadata: Metadata = { title: "Amigos — HeyStudy" };

export default async function AmigosPage() {
  const { studentProfile } = await requireStudentProfile();
  const [friends, pending] = await Promise.all([
    listFriends(studentProfile.id),
    listPendingRequests(studentProfile.id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Amigos</h1>
        <p className="mt-1 text-sm text-muted">
          Conecta con quien ya conoces por su @usuario. No hay búsqueda pública: solo se agrega por usuario exacto.
        </p>
      </div>

      <Card as="section">
        <h2 className="mb-4 text-base font-semibold text-foreground">Agregar amigo</h2>
        {studentProfile.username ? (
          <AddFriendForm />
        ) : (
          <p className="text-sm text-muted">
            Primero elige tu propio usuario en{" "}
            <Link href="/dashboard/perfil" className="font-medium text-accent hover:underline">
              tu cuenta
            </Link>{" "}
            para poder agregar y que te agreguen.
          </p>
        )}
      </Card>

      {pending.received.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-foreground">Solicitudes recibidas</h2>
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {pending.received.map((req) => (
              <div key={req.friendshipId} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{req.displayName}</p>
                  <p className="text-xs text-muted">@{req.username}</p>
                </div>
                <IncomingRequestActions friendshipId={req.friendshipId} />
              </div>
            ))}
          </div>
        </section>
      )}

      {pending.sent.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-foreground">Solicitudes enviadas</h2>
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {pending.sent.map((req) => (
              <div key={req.friendshipId} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{req.displayName}</p>
                  <p className="text-xs text-muted">@{req.username} · pendiente</p>
                </div>
                <RemoveFriendButton friendshipId={req.friendshipId} label="Cancelar solicitud" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">Tus amigos</h2>
        {friends.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <Image
              src="/mascot/mascota-feliz.png"
              alt=""
              aria-hidden
              width={139}
              height={104}
              className="h-16 w-auto shrink-0"
            />
            <CardDescription>
              Todavía no tienes amigos agregados. Pídele su @usuario a alguien y agrégalo arriba.
            </CardDescription>
          </Card>
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {friends.map((friend) => (
              <div key={friend.friendshipId} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{friend.displayName}</p>
                  <p className="text-xs text-muted">@{friend.username}</p>
                </div>
                <RemoveFriendButton friendshipId={friend.friendshipId} label="Dejar de ser amigos" />
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="flex items-start gap-2 text-xs text-subtle">
        <UserPlus className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        <span>
          Tus amigos solo ven tu nombre y tu @usuario. Tus diagnósticos, tu mapa de conocimiento, tus patrones de
          error y tus calificaciones nunca se comparten. Para competir por tiempo de estudio, usa{" "}
          <Link href="/dashboard/grupos" className="font-medium text-accent hover:underline">
            Grupos
          </Link>
          .
        </span>
      </p>
    </div>
  );
}
