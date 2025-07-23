import { Skeleton } from "@/core/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="max-h-48 min-h-40 w-full rounded-xl bg-muted" />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-72 w-full rounded-xl bg-muted" />
        <div className="flex gap-4">
          <Skeleton className="h-72 w-full rounded-xl bg-muted" />
          <Skeleton className="h-72 w-full rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
