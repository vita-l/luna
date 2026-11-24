/*
  CHECK THE DIET: the pet and the food together (cheat sheet cards 8, 14, 14b, 15, 15b)
  All "per day" values can be a range (Low–High) when the pet's energy need is a range.
*/
import type { FoodGuides } from "@/lib/data/food-guides-schema";
import type { Amount } from "@/lib/data/standards-schema";
import { densityDigits } from "./food-analysis";
import { fmt, fmtPower, round } from "./numbers";
import type { MathLine, MathStep } from "./types";

type Pair = [number, number];
const isRange = (p: Pair) => p[0] !== p[1];
/** The same calculation for the low and the high end; one line when it isn't a range */
const both = (p: Pair, line: (v: number) => MathLine): MathLine[] =>
  isRange(p) ? [line(p[0]), line(p[1])] : [line(p[0])];

// ---------- Cups per day (cheat sheet card 14) ----------
export function cupsPerDay(kcal: Pair, kcalPerCup: number): { cups: Pair; step: MathStep } {
  const cups: Pair = [round(kcal[0] / kcalPerCup, 2), round(kcal[1] / kcalPerCup, 2)];
  return {
    cups,
    step: {
      id: "cups",
      range: isRange(kcal),
      lines: both(kcal, (k) => ({ kcal: fmt(k), perCup: fmt(kcalPerCup, 1), cups: fmt(round(k / kcalPerCup, 2), 2) })),
    },
  };
}

// ---------- Metabolic body weight ----------
export function metabolicWeight(kg: number, power: number): { mbw: number; step: MathStep } {
  const mbw = round(Math.pow(kg, power), 3);
  return { mbw, step: { id: "metabolicWeight", lines: [{ kg: fmt(kg, 2), power: fmtPower(power), mbw: fmt(mbw, 3) }] } };
}

// ---------- Eaten per day (card 8) and needed per day (card 14b) ----------
export type Enough = "yes" | "no" | "onlyHigh";

export interface NutrientDay {
  eaten: Pair;
  needed: number | null;
  enough: Enough | null;
}

/** Eaten per day = amount per 1000 kcal × kcal per day ÷ 1000 */
export function eatenPerDay(per1000: number, kcal: Pair): Pair {
  const one = (k: number) => {
    const raw = (per1000 * k) / 1000;
    return round(raw, densityDigits(raw));
  };
  return [one(kcal[0]), one(kcal[1])];
}

/** Needed per day = minimum per kg metabolic body weight × metabolic body weight */
export function neededPerDay(perMbw: Amount, mbw: number, wet: boolean): number {
  const per = typeof perMbw === "number" ? perMbw : wet ? perMbw.wet : perMbw.dry;
  const raw = per * mbw;
  return round(raw, densityDigits(raw));
}

/** Enough when the eaten amount is the same or more than needed (at the low end of a range: always) */
export function isEnough(eaten: Pair, needed: number): Enough {
  if (eaten[0] >= needed) return "yes";
  if (eaten[1] >= needed) return "onlyHigh";
  return "no";
}

export function eatenStep(rows: { name: string; unit: string; per1000: number; eaten: Pair }[], kcal: Pair): MathStep {
  const lines = rows.flatMap((r) =>
    both(kcal, (k) => {
      const raw = (r.per1000 * k) / 1000;
      return {
        name: r.name,
        per1000: fmt(r.per1000, densityDigits(r.per1000)),
        unit: r.unit,
        kcal: fmt(k),
        eaten: fmt(round(raw, densityDigits(raw)), densityDigits(raw)),
      };
    }),
  );
  return { id: "eaten", lines };
}

export function neededStep(rows: { name: string; unit: string; perMbw: number; needed: number }[], mbw: number, power: number): MathStep {
  return {
    id: "needed",
    lines: rows.map((r) => ({
      name: r.name,
      perMbw: String(r.perMbw),
      unit: r.unit,
      mbw: fmt(mbw, 3),
      power: fmtPower(power),
      needed: fmt(r.needed, densityDigits(r.needed)),
    })),
  };
}

// ---------- Water (cards 15, 15b) ----------
export interface WaterRule {
  id: "perKcal" | "perKg" | "classic";
  /** mL per day */
  need: Pair;
  source: string;
  step: MathStep;
}

export function waterNeed(species: "dog" | "cat", kg: number, kcal: Pair, guides: FoodGuides): WaterRule[] {
  const w = guides.water;
  const classic = w.classic[species];
  const perKcal: Pair = [Math.round(kcal[0] * w.perKcal.mlPerKcal), Math.round(kcal[1] * w.perKcal.mlPerKcal)];
  const perKg: Pair = [Math.round(w.perKg.min * kg), Math.round(w.perKg.max * kg)];
  const classicNeed: Pair = [Math.round(classic[0] * kg), Math.round(classic[1] * kg)];
  const kgText = fmt(kg, 2);
  return [
    {
      id: "perKcal",
      need: perKcal,
      source: w.perKcal.source,
      step: { id: "waterPerKcal", range: isRange(kcal), lines: both(kcal, (k) => ({ kcal: fmt(k), ml: fmt(Math.round(k * w.perKcal.mlPerKcal)) })) },
    },
    {
      id: "perKg",
      need: perKg,
      source: w.perKg.source,
      step: {
        id: "waterPerKg",
        range: true,
        lines: [
          { perKg: String(w.perKg.min), kg: kgText, ml: fmt(perKg[0]) },
          { perKg: String(w.perKg.max), kg: kgText, ml: fmt(perKg[1]) },
        ],
      },
    },
    {
      id: "classic",
      need: classicNeed,
      source: w.classic.source,
      step: {
        id: "waterPerKg",
        range: true,
        lines: [
          { perKg: String(classic[0]), kg: kgText, ml: fmt(classicNeed[0]) },
          { perKg: String(classic[1]), kg: kgText, ml: fmt(classicNeed[1]) },
        ],
      },
    },
  ];
}

/** Water from food (mL) = moisture % ÷ 100 × grams of food. For water, 1 g = 1 mL. */
export function waterFromFood(moisturePercent: number, grams: Pair): { water: Pair; step: MathStep } {
  const one = (g: number) => round((moisturePercent / 100) * g, 1);
  return {
    water: [one(grams[0]), one(grams[1])],
    step: {
      id: "waterFromFood",
      range: isRange(grams),
      lines: both(grams, (g) => ({ moisture: fmt(moisturePercent, 2), grams: fmt(g), ml: fmt(one(g), 1) })),
    },
  };
}

/** To drink = water need − water from food (never below 0) */
export function waterToDrink(need: Pair, fromFood: Pair): Pair {
  return [Math.max(0, round(need[0] - fromFood[0], 1)), Math.max(0, round(need[1] - fromFood[1], 1))];
}
