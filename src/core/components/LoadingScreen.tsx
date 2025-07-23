import { Spinner } from "../../core/components/ui/spinner";

export function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-4">
      <Spinner className="size-10" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
