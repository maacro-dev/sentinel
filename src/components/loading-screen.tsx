import { Spinner } from "./ui/spinner";

export function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-4">
      <Spinner className="size-8" />
      <p className="text-muted-foreground/75 text-[0.8rem]">{message}</p>
    </div>
  );
}