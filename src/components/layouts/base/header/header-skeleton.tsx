import { Skeleton } from "@/components/ui/skeleton";

export const HeaderSkeleton = () => {
  return (
    <div className="flex h-16 shrink-0 items-center gap-2">
      <Skeleton className="h-full w-full" />
    </div>
  );
};