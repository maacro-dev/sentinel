import * as m from "motion/react-m";
import { LazyMotion, domAnimation } from "motion/react";
import { ReactNode } from "react";

const Y_OFFSET = 10;
const OPACITY_INITIAL = 0.2;

type FadeInProps = {
  children: ReactNode;
  direction?: "up" | "down";
  className?: string;
};

export const FadeIn = ({ children, direction = "up", className }: FadeInProps) => (
  <LazyMotion features={domAnimation}>
    <m.div
      initial={{ y: direction === "up" ? Y_OFFSET : -Y_OFFSET, opacity: OPACITY_INITIAL }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: direction === "up" ? -Y_OFFSET : Y_OFFSET, opacity: OPACITY_INITIAL }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </m.div>
  </LazyMotion>
);
