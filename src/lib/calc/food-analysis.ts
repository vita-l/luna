/*
  ANALYZE A FOOD (cheat sheet cards 1–7, 10)
  Every function takes the label numbers and returns numbers + steps for "Show the math".
  Rule: each step is rounded the way it is shown.
*/
import type { EnergyShareGuide, FoodGuides, LevelName, LevelSet } from "@/lib/data/food-guides-schema";
import type { NutrientUnit } from "@/lib/data/nutrients-schema";
import type { NutrientLimit, StandardProfile } from "@/lib/data/standards-schema";
import { fmt, fmt1, round } from "./numbers";
import type { MathStep } from "./types";

export type FoodType = "commercial" | "homePrepared";
export type FoodForm = "dry" | "moist";

/** Label numbers as numbers (null = not typed). g nutrients in %, others per kg of food. */
export type LabelValues = Record<string, number | null>;

const pct = (n: number) => `${fmt(n, 2)}`;

// ---------- Card 1: carbohydrate by difference (NFE) ----------
export interface CarbResult {
  sum: number;
  nfe: number;
  /** True when the five numbers add up to more than 100 % */
  overHundred: boolean;
  steps: MathStep[];
}

export function carbohydrate(v: LabelValues): CarbResult | null {
  const parts = ["protein", "fat", "fibre", "moisture", "ash"].map((k) => v[k]);
  if (parts.some((p) => p === null || p === undefined)) return null;
  const nums = parts as number[];
  const sum = round(nums.reduce((a, b) => a + b, 0), 2);
  const nfe = round(100 - sum, 2);
  return {
    sum,
    nfe,
    overHundred: nfe < 0,
    steps: [
      { id: "nfeSum", lines: [{ parts: nums.map(pct).join(" + "), sum: pct(sum) }] },
      { id: "nfe", lines: [{ sum: pct(sum), nfe: pct(nfe) }] },
    ],
  };
}

// ---------- Card 2: energy with (Modified) Atwater factors ----------
export interface EnergyEstimate {
  kcalProtein: number;
  kcalFat: number;
  kcalCarb: number;
  per100g: number;
  perKg: number;
  perLb: number;
  steps: MathStep[];
}

export function energyEstimate(
  v: LabelValues,
  nfe: number | null,
  type: FoodType,
  guides: FoodGuides,
  lbPerKg: number,
): EnergyEstimate | null {
  const p = v.protein;
  const f = v.fat;
  if (p == null || f == null || nfe == null || nfe < 0) return null;
  const a = type === "commercial" ? guides.atwater.commercial : guides.atwater.homePrepared;
  const kcalProtein = round(p * a.protein, 2);
  const kcalFat = round(f * a.fat, 2);
  const kcalCarb = round(nfe * a.carbohydrate, 2);
  const per100g = round(kcalProtein + kcalFat + kcalCarb, 2);
  const perKg = round(per100g * 10, 1);
  const perLb = round(perKg / lbPerKg, 1);
  return {
    kcalProtein, kcalFat, kcalCarb, per100g, perKg, perLb,
    steps: [
      {
        id: "atwaterEach",
        lines: [
          { name: "Protein", g: pct(p), factor: String(a.protein), kcal: pct(kcalProtein) },
          { name: "Fat", g: pct(f), factor: String(a.fat), kcal: pct(kcalFat) },
          { name: "Carbohydrate", g: pct(nfe), factor: String(a.carbohydrate), kcal: pct(kcalCarb) },
        ],
      },
      { id: "atwaterTotal", lines: [{ parts: [kcalProtein, kcalFat, kcalCarb].map(pct).join(" + "), total: pct(per100g) }] },
      { id: "per100gToKg", lines: [{ per100g: pct(per100g), perKg: fmt(perKg, 1) }] },
      { id: "perKgToLb", lines: [{ perKg: fmt(perKg, 1), factor: String(lbPerKg), perLb: fmt(perLb, 1) }] },
    ],
  };
}

// ---------- Card 3: share of energy (caloric distribution, % ME) ----------
export type RangeVerdict = "inside" | "below" | "above";

export interface SharesResult {
  protein: number;
  fat: number;
  carbohydrate: number;
  total: number;
  /** Only when a Table A row is chosen */
  verdict: { protein: RangeVerdict; fat: RangeVerdict; carbohydrate: RangeVerdict; fits: boolean } | null;
  steps: MathStep[];
}

export function inRange(value: number, [lo, hi]: readonly [number, number]): RangeVerdict {
  if (value < lo) return "below";
  if (value > hi) return "above";
  return "inside";
}

export function energyShares(e: EnergyEstimate, guide: EnergyShareGuide | null): SharesResult {
  const share = (k: number) => round((k / e.per100g) * 100, 1);
  const protein = share(e.kcalProtein);
  const fat = share(e.kcalFat);
  const carbohydrate = share(e.kcalCarb);
  const total = round(protein + fat + carbohydrate, 1);
  const verdict = guide
    ? (() => {
        const v = {
          protein: inRange(protein, guide.protein),
          fat: inRange(fat, guide.fat),
          carbohydrate: inRange(carbohydrate, guide.carbohydrate),
        };
        return { ...v, fits: Object.values(v).every((x) => x === "inside") };
      })()
    : null;
  const line = (name: string, kcal: number, s: number) => ({ name, kcal: pct(kcal), total: pct(e.per100g), share: fmt1(s) });
  return {
    protein, fat, carbohydrate, total, verdict,
    steps: [
      {
        id: "shareEach",
        lines: [
          line("Protein", e.kcalProtein, protein),
          line("Fat", e.kcalFat, fat),
          line("Carbohydrate", e.kcalCarb, carbohydrate),
        ],
      },
      { id: "shareCheck", lines: [{ parts: [protein, fat, carbohydrate].map(fmt1).join(" + "), total: fmt1(total) }] },
    ],
  };
}

// ---------- Card 4: dry matter ----------
export interface DryMatterResult {
  dm: number;
  /** % DM for each g nutrient (key → value) */
  percentDM: Record<string, number>;
  kcalPerKgDM: number | null;
  /** True when the DM energy is outside 3500–4500 kcal/kg (use per 1000 kcal instead) */
  energyOutsideRange: boolean;
  steps: MathStep[];
}

export function dryMatter(
  v: LabelValues,
  /** g nutrients to show on a DM basis: code word + name */
  items: { key: string; label: string }[],
  kcalPerKg: number | null,
  guides: FoodGuides,
): DryMatterResult | null {
  const moisture = v.moisture;
  if (moisture == null || moisture >= 100) return null;
  const dm = round(100 - moisture, 2);
  const percentDM: Record<string, number> = {};
  const lines: Record<string, string>[] = [];
  for (const { key, label } of items) {
    const val = v[key];
    if (val == null || key === "moisture") continue;
    percentDM[key] = round((val / dm) * 100, 1);
    lines.push({ name: label, value: pct(val), dm: pct(dm), result: fmt1(percentDM[key]) });
  }
  const steps: MathStep[] = [{ id: "dmPercent", lines: [{ moisture: pct(moisture), dm: pct(dm) }] }];
  if (lines.length) steps.push({ id: "dmNutrient", lines });

  let kcalPerKgDM: number | null = null;
  if (kcalPerKg != null) {
    const dec = round(dm / 100, 4);
    kcalPerKgDM = round(kcalPerKg / dec, 0);
    steps.push({ id: "dmEnergy", lines: [{ kcal: fmt(kcalPerKg, 1), dec: String(dec), result: fmt(kcalPerKgDM) }] });
  }
  const r = guides.dmEnergyRange;
  return {
    dm,
    percentDM,
    kcalPerKgDM,
    energyOutsideRange: kcalPerKgDM != null && (kcalPerKgDM < r.min || kcalPerKgDM > r.max),
    steps,
  };
}

// ---------- Card 5: per 1000 kcal (nutrient density) ----------
/** Decimals that keep small numbers readable: 125.9 · 15.58 · 0.805 */
export function densityDigits(n: number): number {
  return n >= 100 ? 1 : n >= 1 ? 2 : 3;
}

export interface DensityRow {
  key: string;
  /** Per 1000 kcal, in the nutrient's unit (g, mg, µg, IU) */
  value: number;
  step: Record<string, string>;
}

export function per1000kcal(value: number, unit: NutrientUnit, kcalPerKg: number): { value: number; multiplier: number } {
  // % → g per 1000 kcal: × 10 000 ÷ kcal/kg.   per kg → per 1000 kcal: × 1000 ÷ kcal/kg
  const multiplier = unit === "g" ? 10000 : 1000;
  const raw = (value * multiplier) / kcalPerKg;
  return { value: round(raw, densityDigits(raw)), multiplier };
}

// ---------- Judgements ----------

/** Table B: which levels fit (can be two when the table overlaps, or none in a gap) */
export function levelsFor(value: number, set: LevelSet | undefined): LevelName[] {
  if (!set) return [];
  const names: LevelName[] = ["veryLow", "low", "medium", "high"];
  return names.filter((n) => {
    const b = set[n];
    if (!b) return false;
    const [from, to] = b;
    return (from === null || value >= from) && (to === null || value < to || (n === "medium" && value === to && !set.high));
  });
}

export type StandardVerdict =
  | { kind: "belowMin"; min: number }
  | { kind: "aboveMax"; max: number }
  | { kind: "aboveLegal"; legalMaxDM: number; valueDM: number }
  | { kind: "ok"; min?: number; max?: number }
  | { kind: "check"; note: string }
  | { kind: "none" };

/** Compare one nutrient (per 1000 kcal, and per 100 g DM for legal limits) with a standard */
export function judgeStandard(
  per1000: number,
  per100gDM: number | null,
  limit: NutrientLimit | undefined,
  form: FoodForm,
): StandardVerdict {
  if (!limit) return { kind: "none" };
  if (limit.check) return { kind: "check", note: limit.check };
  const min = limit.min === undefined ? undefined : typeof limit.min === "number" ? limit.min : form === "moist" ? limit.min.wet : limit.min.dry;
  if (min !== undefined && per1000 < min) return { kind: "belowMin", min };
  if (limit.max !== undefined && per1000 > limit.max) return { kind: "aboveMax", max: limit.max };
  if (limit.legalMaxDM !== undefined && per100gDM !== null && per100gDM > limit.legalMaxDM) {
    return { kind: "aboveLegal", legalMaxDM: limit.legalMaxDM, valueDM: per100gDM };
  }
  return { kind: "ok", min, max: limit.max };
}

// ---------- Card 6: AAFCO standard energy ----------
export function aafcoCorrected(percent: number, kcalPerKg: number, standard: number): number {
  return round((percent / kcalPerKg) * standard, 1);
}

// ---------- Card 7: calcium : phosphorus ----------
export function caPRatio(calcium: number | null, phosphorus: number | null): number | null {
  if (calcium == null || phosphorus == null || phosphorus <= 0) return null;
  return round(calcium / phosphorus, 2);
}

export type { StandardProfile };
