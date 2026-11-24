"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * The result box. Grey with a hint while something is missing,
 * green with the big number when ready. The number fades in,
 * so the eye notices that a result appeared.
 */
export function ResultPanel({
  ready,
  emptyText,
  children,
}: {
  ready: boolean;
  emptyText: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "rounded-result p-4 transition-colors duration-200 ease-standard",
        ready ? "bg-accent-soft text-ink" : "bg-track text-muted",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {ready ? (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            className="m-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            {emptyText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/** "630 kcal per day": the big number and its unit */
export function BigNumber({ value, unit, small }: { value: string; unit: string; small?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span
        className={cn(
          "leading-[1.05] font-[750] tracking-[-0.02em] tabular-nums",
          small ? "text-[36px]" : "text-[44px]",
        )}
      >
        {value}
      </span>
      <span className="text-[18px] font-semibold">{unit}</span>
    </div>
  );
}
