import { MotionProps } from "motion/react";

export const DEFAULT_OFFSET = 4;
export const DEFAULT_MOTION_DURATION = 0.25;
export const OPACITY_INITIAL = 0;
export const OPACITY_FULL = 1;

export const DEFAULT_FADE: MotionProps = {
  initial:    { opacity: OPACITY_INITIAL },
  animate:    { opacity: OPACITY_FULL    },
  exit:       { opacity: OPACITY_INITIAL },
  transition: { duration: DEFAULT_MOTION_DURATION },
}

export const DEFAULT_FADE_UP: MotionProps = {
  initial:    { y: DEFAULT_OFFSET,  opacity: OPACITY_INITIAL },
  animate:    { y: 0,               opacity: OPACITY_FULL    },
  exit:       { y: -DEFAULT_OFFSET, opacity: OPACITY_INITIAL },
  transition: { duration: DEFAULT_MOTION_DURATION },
}

export const expandFadeMotion = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit:    { opacity: 0, x:100 },
  transition: { duration: DEFAULT_MOTION_DURATION, ease:'easeOut' as const }
}

export const slideUpFadeMotion = {
  initial: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0   },
  exit:    { opacity: 0, x: 100 },
  transition: { duration: 0.2, ease:'easeOut' as const }
}
