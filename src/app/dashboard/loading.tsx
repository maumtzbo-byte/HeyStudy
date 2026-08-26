import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardHomeLoading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-52 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
