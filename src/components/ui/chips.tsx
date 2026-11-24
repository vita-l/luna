"use client";

import { RadioGroup } from "radix-ui";
import { cn } from "@/lib/cn";

/** Round "chip" buttons that wrap onto more lines (Puppy · Adult · Senior …) */
export function Chips({
  value,
  onValueChange,
  options,
  labelledBy,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  labelledBy?: string;
}) {
  return (
    <RadioGroup.Root
      value={value}
      onValueChange={onValueChange}
      aria-labelledby={labelledBy}
      className="flex flex-wrap gap-2"
    >
      {options.map((o) => (
        <RadioGroup.Item
          key={o.value}
          value={o.value}
          className={cn(
            "flex min-h-11 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-line px-[18px] font-semibold text-ink",
            "transition-colors duration-150 ease-standard",
            "data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-ink",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          )}
        >
          {o.label}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
