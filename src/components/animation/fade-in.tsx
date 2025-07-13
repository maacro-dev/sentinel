import * as m from "motion/react-m";
import { ReactNode } from "react";

const OPACITY_INITIAL = 0;

type FadeInDivProps = {
  children: ReactNode;
  direction?: "up" | "down" | "none";
  offset?: number;
  className?: string;
  duration?: number;
};

export const FadeInDiv = ({
  direction = "up",
  offset = 10,
  duration = 0.3,
  ...props
}: FadeInDivProps) => {
  const yOffset =
    direction === "up"
      ? offset
      : direction === "down"
      ? -offset
      : 0;
  return (
    <m.div
      initial={{ y: yOffset, opacity: OPACITY_INITIAL }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: yOffset, opacity: OPACITY_INITIAL }}
      transition={{ duration }}
      {...props}

    />
  );
};

export const FadeInRow = ({ children, direction = "up", offset = 10, className, duration = 0.275 }: FadeInDivProps) => (
  <m.tr
    initial={{ y: direction === "up" ? offset : -offset, opacity: OPACITY_INITIAL }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: direction === "up" ? offset : -offset, opacity: OPACITY_INITIAL }}
    transition={{ duration }}
    className={className}
  >
    {children}
  </m.tr>
);
