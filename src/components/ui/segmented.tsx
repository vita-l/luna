"use client";

import { RadioGroup } from "radix-ui";
import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/cn";

export interface SegmentOption<V extends string> {
  value: V;
  label: string;
  /** Optional second line, like "2 steps" */
  sub?: string;
}

/**
 * Segmented control: 2–3 choices side by side (Dog | Cat, lb | kg).
 * The white "pill" slides to the new choice, so you see what changed.
 * Keyboard: arrow keys move between choices.
 */
export function Segmented<V extends string>({
  value,
  onValueChange,
  options,
  labelledBy,
  ariaLabel,
  className,
}: {
  value: V;
  onValueChange: (value: V) => void;
  options: SegmentOption<V>[];
  labelledBy?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const pillId = useId();
  const twoLine = options.some((o) => o.sub);
  return (
    <RadioGroup.Root
      value={value}
      onValueChange={(v) => onValueChange(v as V)}
      orientation="horizontal"
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      className={cn("flex min-w-0 gap-1 rounded-control bg-track p-1", className)}
    >
      {options.map((o) => {
        const checked = o.value === value;
        return (
          <RadioGroup.Item
            key={o.value}
            value={o.value}
            className={cn(
              "relative flex flex-1 cursor-pointer items-center justify-center rounded-segment px-2 font-semibold whitespace-nowrap",
              "text-muted transition-colors duration-150 data-[state=checked]:text-ink",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
              twoLine ? "min-h-[54px] flex-col py-1.5 leading-tight" : "min-h-[46px]",
            )}
          >
            {checked && (
              <motion.span
                layoutId={pillId}
                aria-hidden="true"
                className="absolute inset-0 rounded-segment bg-card shadow-segment"
                transition={{ type: "spring", stiffness: 520, damping: 40 }}
              />
            )}
            <span className="relative">{o.label}</span>
            {o.sub && <span className="relative text-[13px] font-medium text-muted">{o.sub}</span>}
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}
