"use client";

import { Collapsible } from "radix-ui";
import { copy, fill } from "@/lib/copy";
import type { MathStep } from "@/lib/calc/types";

/**
 * "Show the math ⌄": opens with a short height animation.
 * Shows an optional formula box, then the numbered steps.
 */
export function MathDetails({
  steps,
  formula,
  formulaKey,
}: {
  steps: MathStep[];
  formula?: string;
  formulaKey?: string | null;
}) {
  return (
    <Collapsible.Root className="mt-3">
      <Collapsible.Trigger
        className={cn_trigger}
      >
        {copy.math.show}
        <span
          aria-hidden="true"
          className={cn_chevron}
        />
      </Collapsible.Trigger>
      <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-close data-[state=open]:animate-open">
        {formula && (
          <div className="mt-1 mb-3 rounded-note border-[1.5px] border-line px-3 py-2.5">
            <span className="block font-semibold tabular-nums">{formula}</span>
            {formulaKey && <span className="block text-sm text-muted">{formulaKey}</span>}
          </div>
        )}
        <ol className="mt-1 list-decimal pl-[22px]">
          {steps.map((step, i) => {
            const words = copy.math.steps[step.id];
            return (
              <li key={`${step.id}-${i}`} className="mb-3">
                <span className="block font-semibold">{fill(words.title, step.titleVars)}</span>
                {step.lines.map((vars, li) => {
                  const line = fill(words.line, vars);
                  const text =
                    step.range ? fill(li === 0 ? copy.math.low : copy.math.high, { line }) : line;
                  return (
                    <span key={li} className="block tabular-nums">
                      {text}
                    </span>
                  );
                })}
              </li>
            );
          })}
        </ol>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

const cn_trigger =
  "group flex min-h-11 cursor-pointer items-center gap-2.5 font-semibold text-accent " +
  "focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/* The arrow: points down when closed, turns to point up when open */
const cn_chevron =
  "-mt-1 size-2 rotate-45 border-r-2 border-b-2 border-current " +
  "transition-[transform,margin] duration-150 ease-standard " +
  "group-data-[state=open]:mt-1 group-data-[state=open]:-rotate-[135deg]";
