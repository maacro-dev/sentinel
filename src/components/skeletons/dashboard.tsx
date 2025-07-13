import { FadeInDiv } from "../animation";
import { Skeleton } from "../ui/skeleton";

export const DashboardSkeleton = () => (
  <FadeInDiv direction="none" duration={1} className="space-y-6">
    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="max-h-48 min-h-40 w-full rounded bg-muted/50" />
      ))}
    </div>
    <div className="space-y-4">
      <Skeleton className="h-72 w-full rounded-lg bg-muted/50" />
      <div className="flex gap-4">
        <Skeleton className="h-72 w-full rounded-lg bg-muted/50" />
        <Skeleton className="h-72 w-full rounded-lg bg-muted/50" />
      </div>
    </div>
  </FadeInDiv>
);
