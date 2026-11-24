"use client";

/*
  One result on the Food screen: a title with an (i) tip, the numbers,
  and "Show the math". While inputs are missing, it says what it needs.
*/
import { motion } from "motion/react";
import { InfoTip, type TipKey } from "./info-tip";
import { MathDetails } from "./math-details";
import type { MathStep } from "@/lib/calc/types";

export function ResultCard({
  title,
  tip,
  needs,
  steps,
  children,
}: {
  title: string;
  tip?: TipKey;
  /** Text shown while inputs are missing; null when ready */
  needs: string | null;
  steps?: MathStep[];
  children?: React.ReactNode;
}) {
  const ready = needs === null;
  return (
    <section className="mb-3 rounded-card border border-line bg-card px-4 py-4 shadow-card">
      <div className="flex items-center gap-1">
        <h3 className="m-0 text-[17px] font-bold">{title}</h3>
        {tip && <InfoTip tip={tip} />}
      </div>
      {/* The new content is there at once; the fade only adds polish and never delays it */}
      <motion.div
        key={ready ? "ready" : "needs"}
        initial={{ opacity: 0.4, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
      >
        {ready ? (
          <>
            <div className="mt-2">{children}</div>
            {steps && steps.length > 0 && <MathDetails steps={steps} />}
          </>
        ) : (
          <p className="mt-1 text-[15px] text-muted">{needs}</p>
        )}
      </motion.div>
    </section>
  );
}

/** One "label — value" line inside a result card */
export function ResultRow({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line py-2 last:border-b-0">
      <span className="flex-1 text-muted">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
      {children && <span className="flex basis-full flex-wrap justify-end gap-1.5 sm:basis-auto">{children}</span>}
    </div>
  );
}
