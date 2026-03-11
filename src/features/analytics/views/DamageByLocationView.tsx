
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Spinner } from '@/core/components/ui/spinner';

export function DamageByLocationView({ data, isLoading }: { data?: any; isLoading: boolean }) {
  if (isLoading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-4">
      <Spinner className="size-10" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  );
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Damage by Location</CardTitle>
        <CardDescription>Geographic damage assessment</CardDescription>
      </CardHeader>
      <CardContent className="h-64 bg-muted/20 flex items-center justify-center">
        <span className="text-muted-foreground">[Damage by Location Placeholder]</span>
      </CardContent>
    </Card>
  );
}
