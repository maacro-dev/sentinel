import { ArrowLeft } from "lucide-react";
import { memo, useCallback } from "react";
import { useRouter } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { cn } from "../utils/style";

export interface NavigateBackProps {
  label?: string;
}

export const NavigateBack = memo(({ label }: NavigateBackProps) => {
  const { history } = useRouter();

  const handleBack = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    history.back();
  }, [history]);

  return (
    <Button
      size={label ? "sm" : "icon"}
      variant="ghost"
      className={cn(
        "!px-0 text-muted-foreground items-center hover:bg-transparent cursor-pointer w-fit",
        label ? "gap-2 text-xs" : "size-7"
      )}
      onClick={handleBack}
    >
      <ArrowLeft className="size-3.5"/>
      {label && <span>{label}</span>}
    </Button>
  );
})
