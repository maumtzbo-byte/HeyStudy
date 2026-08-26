import { Skeleton } from "@/components/ui/Skeleton";

export default function ResumenLoading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full sm:col-span-2" />
      </div>
    </div>
  );
}
