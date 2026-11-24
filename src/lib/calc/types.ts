/*
  Shared shapes for calculation results.
  A calculation returns numbers and "steps". Each step has an id (its words live in
  src/content/en.json → math.steps) and the values to fill in.
*/
import type copy from "@/content/en.json";

export type StepId = keyof (typeof copy)["math"]["steps"];

/** Values for one line, already formatted the way they are shown */
export type MathLine = Record<string, string>;

export interface MathStep {
  id: StepId;
  /** The lines of this step */
  lines: MathLine[];
  /** True when the two lines are the Low and High ends of a range */
  range?: boolean;
  /** Values for the step title, e.g. {meals} in "Split into {meals} meals" */
  titleVars?: MathLine;
}

export type Unit = "lb" | "kg";
export type Method = "factor" | "k";
