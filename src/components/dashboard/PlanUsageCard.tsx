import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";

export function PlanUsageCard({ diagnosticsUsed, diagnosticsLimit }: { diagnosticsUsed: number; diagnosticsLimit: number }) {
  const remaining = Math.max(0, diagnosticsLimit - diagnosticsUsed);
  const percentUsed = Math.min(100, Math.round((diagnosticsUsed / diagnosticsLimit) * 100));
  const isLow = remaining <= 1;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <CardTitle>Plan gratuito</CardTitle>
        <span className="text-sm font-medium tabular-nums text-foreground">
          {diagnosticsUsed} / {diagnosticsLimit} diagnósticos
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className={isLow ? "h-full bg-danger" : "h-full bg-accent"}
          style={{ width: `${percentUsed}%` }}
        />
      </div>
      <CardDescription>
        {remaining > 0
          ? `Te ${remaining === 1 ? "queda" : "quedan"} ${remaining} este mes.`
          : "Ya usaste todos tus diagnósticos de este mes."}{" "}
        <Link href="/#precios" className="font-medium text-accent hover:underline">
          Mejora tu plan
        </Link>{" "}
        para diagnósticos ilimitados y el tutor más capaz.
      </CardDescription>
    </Card>
  );
}
