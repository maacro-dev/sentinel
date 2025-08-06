import { HTMLMotionProps } from "motion/react";
import { ComponentProps, ReactNode } from "react";
import { DEFAULT_FADE } from "../utils/motions";
import * as m from "motion/react-m";
import { Global } from "../config";
import { cn } from "../utils/style";

type MotionDivProps = Omit<HTMLMotionProps<"div">, "children">;

export interface ExtendedMotionProps
  extends Omit<ComponentProps<'div'>, keyof MotionDivProps> {
  motion?: MotionDivProps;
  children?: ReactNode;
  duration?: number;
  className?: string;
}

export const Motion = ({
  motion = DEFAULT_FADE,
  duration,
  className,
  ...rest
}: ExtendedMotionProps) => {

  const baseClasses = "min-w-0 min-h-0 size-full flex flex-col gap-4";

  if (!Global.ENABLE_MOTIONS) {
    return <div className={cn(baseClasses, className)} {...rest}  />
  }
  return <m.div {...motion} transition={{ duration }} className={cn(baseClasses, className)} {...rest}/>;
};
