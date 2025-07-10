import * as m from "motion/react-m";
import { ReactNode } from "react";

const OPACITY_INITIAL = 0.2;

type FadeInDivProps = {
  children: ReactNode;
  direction?: "up" | "down";
  offset?: number;
  className?: string;
  duration?: number;
};

export const FadeInDiv = ({ children, direction = "up", offset = 10, className, duration = 0.275 }: FadeInDivProps) => (
  <m.div
    initial={{ y: direction === "up" ? offset : -offset, opacity: OPACITY_INITIAL }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: direction === "up" ? offset : -offset, opacity: OPACITY_INITIAL }}
    transition={{ duration }}
    className={className}
  >
    {children}
  </m.div>
);

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
