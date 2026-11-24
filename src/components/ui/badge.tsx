import { cn } from "@/lib/cn";

export type BadgeTone = "good" | "warn" | "neutral";

const toneClass: Record<BadgeTone, string> = {
  good: "bg-accent-soft text-accent",
  warn: "bg-warn-bg text-warn-ink",
  neutral: "bg-track text-muted",
};

/** A small label for a judgement: "High", "Below FEDIAF min 45", "Meets FEDIAF" */
export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap", toneClass[tone])}>
      {children}
    </span>
  );
}
