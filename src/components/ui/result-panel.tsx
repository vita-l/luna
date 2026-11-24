"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * The result box. Grey with a hint while something is missing,
 * green with the big number when ready. The number fades in quickly,
 * so the eye notices that a result appeared (it is never hidden while fading).
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
      {/* The new content is there at once; the fade only adds polish and never delays it */}
      {ready ? (
        <motion.div
          key="ready"
          initial={{ opacity: 0.4, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
        >
          {children}
        </motion.div>
      ) : (
        <p key="empty" className="m-0">
          {emptyText}
        </p>
      )}
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
