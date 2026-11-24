"use client";

import { RadioGroup } from "radix-ui";
import { Fragment } from "react";
import { cn } from "@/lib/cn";

export interface OptionItem {
  value: string;
  label: string;
  hint?: string;
  /** Small text on the right, like "× 1.6" or "K 95" */
  badge: string;
  /** Small title above a group of options */
  heading?: string;
}

/**
 * A list of option cards with radio circles. Options with the same heading
 * are grouped under a small title. `tiles` = small cards side by side.
 * Keyboard: arrow keys move through all options.
 */
export function OptionGroup({
  value,
  onValueChange,
  items,
  labelledBy,
  tiles = false,
}: {
  value: string | null;
  onValueChange: (value: string) => void;
  items: OptionItem[];
  labelledBy?: string;
  tiles?: boolean;
}) {
  // Split into groups: a new group starts when the heading changes
  const groups: { heading?: string; items: OptionItem[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.heading === item.heading) last.items.push(item);
    else groups.push({ heading: item.heading, items: [item] });
  }

  return (
    <RadioGroup.Root value={value ?? ""} onValueChange={onValueChange} aria-labelledby={labelledBy}>
      {groups.map((g, gi) => (
        <Fragment key={`${g.heading ?? ""}-${gi}`}>
          {g.heading && (
            <p className={cn("mb-2 text-[17px] font-bold text-ink", gi > 0 && "mt-5")}>{g.heading}</p>
          )}
          <div className={cn("grid gap-2", tiles && "grid-cols-2", !g.heading && gi > 0 && "mt-2")}>
            {g.items.map((item) => (
              <OptionCard key={item.value} item={item} tile={tiles} />
            ))}
          </div>
        </Fragment>
      ))}
    </RadioGroup.Root>
  );
}

function OptionCard({ item, tile }: { item: OptionItem; tile: boolean }) {
  return (
    <RadioGroup.Item
      value={item.value}
      className={cn(
        "group flex w-full cursor-pointer rounded-control border-[1.5px] border-line text-left",
        "transition-colors duration-150 ease-standard",
        "data-[state=checked]:border-accent data-[state=checked]:bg-accent-soft",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        tile
          ? "min-h-[54px] flex-col items-center justify-center gap-0.5 px-1.5 py-2.5 text-center"
          : "min-h-[54px] items-center gap-3 px-[14px] py-3",
      )}
    >
      {!tile && (
        <span
          aria-hidden="true"
          className={cn(
            "grid size-5 flex-none place-items-center rounded-full border-2 border-muted/70",
            "transition-colors duration-150 group-data-[state=checked]:border-accent",
          )}
        >
          <RadioGroup.Indicator className="size-2.5 rounded-full bg-accent" />
        </span>
      )}
      <span className={cn("flex flex-col", !tile && "flex-1")}>
        <span className={cn("font-semibold", tile && "text-[15px]")}>{item.label}</span>
        {item.hint && <span className="text-sm text-muted">{item.hint}</span>}
      </span>
      <span className={cn("whitespace-nowrap tabular-nums text-muted", tile ? "text-sm" : "text-[15px]")}>
        {item.badge}
      </span>
    </RadioGroup.Item>
  );
}
