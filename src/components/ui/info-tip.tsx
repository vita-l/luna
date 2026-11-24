"use client";

/*
  The small (i) button next to a term. Tap it to read a plain-language explanation
  and where it comes from. Text lives in src/content/tips.json.
*/
import { Popover } from "radix-ui";
import { Info } from "lucide-react";
import tips from "@/content/tips.json";

export type TipKey = Exclude<keyof typeof tips, "_about">;

export function InfoTip({ tip }: { tip: TipKey }) {
  const t = tips[tip];
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={`About ${t.title}`}
        className="inline-grid size-7 flex-none cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-track hover:text-accent focus-visible:outline-2 focus-visible:outline-accent data-[state=open]:bg-accent-soft data-[state=open]:text-accent"
      >
        <Info aria-hidden="true" className="size-[18px]" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={16}
          className="z-30 w-[min(320px,calc(100vw-32px))] rounded-control border border-line bg-card p-4 text-[15px] text-ink shadow-card data-[state=closed]:animate-tip-out data-[state=open]:animate-tip-in"
        >
          <p className="mb-1 font-bold">{t.title}</p>
          <p className="mb-2">{t.text}</p>
          <p className="text-sm text-muted">{t.source}</p>
          <Popover.Arrow className="fill-card" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
