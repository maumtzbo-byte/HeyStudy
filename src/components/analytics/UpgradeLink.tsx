"use client";

import Link from "next/link";
import { trackClient } from "@/components/analytics/PostHogProvider";

// El enlace a precios es el único punto donde alguien expresa intención de
// pagar antes de que exista Stripe. Se registra dónde nació el clic porque
// no es lo mismo llegar desde el contador de diagnósticos agotados que desde
// la voz bloqueada del tutor: son dos motivos de compra distintos, y saber
// cuál pesa más es lo que dirá qué se empaqueta en el plan pagado.
export function UpgradeLink({
  source,
  className,
  children,
}: {
  source: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href="/#precios" className={className} onClick={() => trackClient("upgrade_clicked", { source })}>
      {children}
    </Link>
  );
}
