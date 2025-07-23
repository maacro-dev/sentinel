import { Skeleton } from "@/core/components/ui/skeleton";

export function TableSkeleton() {
  return (
    <div className="column h-full">
      <Skeleton className="h-10"/>
      <Skeleton className="min-h-[32rem] flex-1"/>
    </div>
  )
}
