import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { memo, useCallback } from "react";
import { Button, ButtonProps } from "./ui/button";
import { cn } from "../utils/style";
import { useRouter } from "@tanstack/react-router";

interface PrimitiveNavButtonProps extends ButtonProps {
  leadingIcon?: React.ReactNode,
  trailingIcon?: React.ReactNode,
}

const PrimitiveNavButton = ({
  children,
  leadingIcon,
  trailingIcon,
  onClick,
  ...rest
}: PrimitiveNavButtonProps) => {
  return (
    <Button
      size={!!children ? "sm" : "icon"}
      variant="ghost"
      className={cn(
        "!px-0 text-muted-foreground items-center hover:bg-transparent cursor-pointer w-fit",
        !!children ? "gap-2 text-xs" : "size-7"
      )}
      onClick={onClick}
      {...rest}
    >
      {leadingIcon && leadingIcon}
      {children && children}
      {trailingIcon && trailingIcon}
    </Button>
  )
}

interface NavButtonProps {
  label?: string;
  direction: "back" | "next" | "prev",
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined
}

const NavButton = memo(({ label, direction, className, onClick }: NavButtonProps) => {
  let leadingIcon: React.ReactNode = null;
  let trailingIcon: React.ReactNode = null;

  switch (direction) {
    case 'back':
      leadingIcon = <ArrowLeft className="size-3.5" />;
      break;
    case 'prev':
      leadingIcon = <ChevronLeft className="size-4" />;
      break;
    case 'next':
      trailingIcon = <ChevronRight className="size-4" />;
      break;
  }

  return (
    <PrimitiveNavButton
      className={cn(
        "!px-0 text-muted-foreground items-center hover:bg-transparent cursor-pointer w-fit",
        label ? "gap-2 text-xs" : "size-7",
        className
      )}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
      onClick={onClick}
    >
      {label}
    </PrimitiveNavButton>
  )
})

export const NavBackButton = memo(({ onClick, ...props }: Omit<NavButtonProps, "direction">) => {
  const { history } = useRouter();

  const handleBack = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    history.back();
  }, [history]);

  return <NavButton
    direction={"back"}
    onClick={(e) => {
      handleBack(e)
      onClick?.(e)
    }}
    {...props}
  />
})

export const NavPreviousButton = memo(({ ...props }: Omit<NavButtonProps, "direction">) => {
  return <NavButton direction={"prev"} {...props} />
})

export const NavNextButton = memo(({ ...props }: Omit<NavButtonProps, "direction">) => {
  return <NavButton direction={"next"} {...props} />
})
