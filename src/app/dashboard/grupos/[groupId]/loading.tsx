import { Skeleton } from "@/components/ui/Skeleton";

export default function GroupDetailLoading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
