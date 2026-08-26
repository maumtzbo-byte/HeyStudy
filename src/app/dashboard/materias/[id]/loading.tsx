import { Skeleton } from "@/components/ui/Skeleton";

export default function SubjectDetailLoading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
