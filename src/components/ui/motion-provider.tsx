"use client";

import { MotionConfig } from "motion/react";

/** Turns animations off for people who set "reduce motion" on their device */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
