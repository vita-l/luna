/*
  DAILY FOOD AMOUNT
  grams per day = kcal per day ÷ kcal per kg of food × 1000   (L01 p. 11)
*/
import { fmt, parseNumber, round } from "./numbers";
import type { MathStep } from "./types";

export interface FoodInput {
  /** kcal per day from step 1: [low, high], or null when step 1 isn't finished */
  kcal: [number, number] | null;
  range: boolean;
  densityText: string;
  meals: 1 | 2 | 3;
}

export interface FoodResult {
  /** "empty" = nothing typed, "invalid" = not a number, "ok" = a number we can use */
  densityStatus: "empty" | "invalid" | "ok";
  density: number | null;
  /** True when the number looks too small to be kcal per kg */
  lowWarning: boolean;
  grams: [number, number] | null;
  perMeal: [number, number] | null;
  steps: MathStep[];
}

/** Below this, the number is probably kcal per cup or per can, not per kg */
const LOW_DENSITY_WARNING = 300;

export function calcFood({ kcal, range, densityText, meals }: FoodInput): FoodResult {
  const empty: FoodResult = {
    densityStatus: "empty", density: null, lowWarning: false, grams: null, perMeal: null, steps: [],
  };
  const d = parseNumber(densityText);
  if (d === null) return empty;
  if (Number.isNaN(d) || d <= 0) return { ...empty, densityStatus: "invalid" };

  const result: FoodResult = { ...empty, densityStatus: "ok", density: d, lowWarning: d < LOW_DENSITY_WARNING };
  if (!kcal) return result;

  const pick = <T,>(both: [T, T]) => (range ? both : [both[0]]);
  const kgDay: [number, number] = [round(kcal[0] / d, 3), round(kcal[1] / d, 3)];
  const grams: [number, number] = [Math.round(kgDay[0] * 1000), Math.round(kgDay[1] * 1000)];
  const steps: MathStep[] = [
    {
      id: "kgPerDay",
      lines: pick([
        { kcal: fmt(kcal[0]), density: fmt(d, 1), kgDay: fmt(kgDay[0], 3) },
        { kcal: fmt(kcal[1]), density: fmt(d, 1), kgDay: fmt(kgDay[1], 3) },
      ]),
    },
    {
      id: "grams",
      lines: pick([
        { kgDay: fmt(kgDay[0], 3), grams: fmt(grams[0]) },
        { kgDay: fmt(kgDay[1], 3), grams: fmt(grams[1]) },
      ]),
    },
  ];

  let perMeal: [number, number] | null = null;
  if (meals > 1) {
    perMeal = [Math.round(grams[0] / meals), Math.round(grams[1] / meals)];
    const m = String(meals);
    steps.push({
      id: "meals",
      titleVars: { meals: m },
      lines: pick([
        { grams: fmt(grams[0]), meals: m, perMeal: fmt(perMeal[0]) },
        { grams: fmt(grams[1]), meals: m, perMeal: fmt(perMeal[1]) },
      ]),
    });
  }
  return { ...result, grams, perMeal, steps };
}
