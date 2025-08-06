import { Slot } from "@radix-ui/react-slot";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "../utils/style";


const clickableVariants = cva(
  cn(
    "p-2 text-muted-foreground inline-flex items-center justify-center rounded-sm whitespace-nowrap transition-all",
    "disabled:pointer-events-none disabled:opacity-50"
  ),
  {
    variants: {
      variant: {
        default: "hover:bg-accent hover:text-accent-foreground",
        outline: "border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-4 py-2",
        square: "aspect-square justify-center items-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ClickableProps
  extends React.ComponentProps<"button">,
  VariantProps<typeof clickableVariants> {
  asChild?: boolean;
}

export type ClickEvent = React.MouseEvent<HTMLButtonElement>;

export const Clickable = ({ asChild = false, className, variant, size, ...props }: ClickableProps) => {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      data-slot="button"
      className={cn(clickableVariants({ variant, size }), className)}
      {...props}
    />
  );
};
