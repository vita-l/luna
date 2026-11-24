/*
  DAILY ENERGY (MER)
  Method 1 (activity factor): RER = 70 × BW^power, then MER = RER × activity factor
  Method 2 (K value, NRC):    MER = K × BW^power   (power 1 means K × BW)
  Course: L04 p. 19–24, L01 p. 11
*/
import type { Choice, EnergyData, KChoice, Species } from "@/lib/data/energy-schema";
import { factorPair, fmt, fmt1, fmtFactorValue, fmtPower, isRange, parseNumber, round } from "./numbers";
import type { MathStep, Method, Unit } from "./types";
import type { LastConversion } from "./weight";

export interface EnergyInput {
  data: EnergyData;
  species: Species;
  method: Method;
  unit: Unit;
  weightText: string;
  /** Set when the user typed pounds and then switched to kg */
  lastConversion: LastConversion | null;
  /** Method 1: the picked choice */
  choice: Choice | null;
  /** Method 2: the picked K value */
  kChoice: KChoice | null;
}

export interface EnergyResult {
  /** "empty" = nothing typed, "invalid" = not a number, "ok" = a weight we can use */
  weightStatus: "empty" | "invalid" | "ok";
  steps: MathStep[];
  /** kcal per day: [low, high]. The same number twice when it is not a range */
  kcal: [number, number] | null;
  range: boolean;
  /** The weight as typed, with its unit: "22 lb" */
  weightLabel: string | null;
}

export function calcEnergy(input: EnergyInput): EnergyResult {
  const { data, species, method, unit, weightText, lastConversion } = input;
  const empty: EnergyResult = { weightStatus: "empty", steps: [], kcal: null, range: false, weightLabel: null };

  const w = parseNumber(weightText);
  if (w === null) return empty;
  if (Number.isNaN(w) || w <= 0) return { ...empty, weightStatus: "invalid" };

  const steps: MathStep[] = [];
  const { lbPerKg } = data.settings;
  let kg = w;
  if (unit === "lb") {
    kg = round(w / lbPerKg, 2);
    steps.push({ id: "lbToKg", lines: [{ lb: fmt(w, 2), factor: String(lbPerKg), kg: fmt(kg, 2) }] });
  } else if (lastConversion && lastConversion.from === "lb") {
    // The user typed pounds, then switched to kg
    const typed = parseNumber(lastConversion.typed) ?? kg;
    steps.push({ id: "lbToKg", lines: [{ lb: fmt(typed, 2), factor: String(lbPerKg), kg: fmt(kg, 2) }] });
  }
  if (kg <= 0) return empty;

  const base: EnergyResult = { weightStatus: "ok", steps, kcal: null, range: false, weightLabel: `${fmt(w, 2)} ${unit}` };
  return method === "k" ? withK(base, kg, input.kChoice) : withFactor(base, kg, input.choice, data, species);
}

/** Method 2: MER = K × BW^power in one step (no RER) */
function withK(result: EnergyResult, kg: number, c: KChoice | null): EnergyResult {
  if (!c) return result;
  const steps = [...result.steps];
  let mer: number;
  if (c.power === 1) {
    mer = round(c.k * kg, 1);
    steps.push({ id: "merKLinear", lines: [{ k: String(c.k), kg: fmt(kg, 2), mer: fmt1(mer) }] });
  } else {
    const mbw = round(Math.pow(kg, c.power), 3);
    steps.push({ id: "metabolicWeight", lines: [{ kg: fmt(kg, 2), power: fmtPower(c.power), mbw: fmt(mbw, 3) }] });
    mer = round(c.k * mbw, 1);
    steps.push({ id: "merK", lines: [{ k: String(c.k), mbw: fmt(mbw, 3), mer: fmt1(mer) }] });
  }
  const kcal = Math.round(mer);
  if (mer !== kcal) steps.push({ id: "roundKcal", lines: [{ from: fmt1(mer), to: fmt(kcal) }] });
  return { ...result, steps, kcal: [kcal, kcal], range: false };
}

/** Method 1: RER = multiplier × BW^power, then MER = RER × activity factor */
function withFactor(
  result: EnergyResult,
  kg: number,
  choice: Choice | null,
  data: EnergyData,
  species: Species,
): EnergyResult {
  const r = data.settings.rer[species];
  const mbw = round(Math.pow(kg, r.power), 3);
  const rer = round(r.multiplier * mbw, 1);
  const steps = [
    ...result.steps,
    { id: "metabolicWeight" as const, lines: [{ kg: fmt(kg, 2), power: String(r.power), mbw: fmt(mbw, 3) }] },
    { id: "rer" as const, lines: [{ multiplier: String(r.multiplier), mbw: fmt(mbw, 3), rer: fmt1(rer) }] },
  ];
  if (!choice) return { ...result, steps };

  const range = isRange(choice.factor);
  const f = factorPair(choice.factor);
  const mer: [number, number] = [round(rer * f[0], 1), round(rer * f[1], 1)];
  const kcal: [number, number] = [Math.round(mer[0]), Math.round(mer[1])];
  const pick = <T,>(both: [T, T]) => (range ? both : [both[0]]);

  steps.push({
    id: "merFactor",
    range, lines: pick([
      { rer: fmt1(rer), factor: fmtFactorValue(f[0]), mer: fmt1(mer[0]) },
      { rer: fmt1(rer), factor: fmtFactorValue(f[1]), mer: fmt1(mer[1]) },
    ]),
  });
  if (mer[0] !== kcal[0] || mer[1] !== kcal[1]) {
    steps.push({
      id: "roundKcal",
      range, lines: pick([
        { from: fmt1(mer[0]), to: fmt(kcal[0]) },
        { from: fmt1(mer[1]), to: fmt(kcal[1]) },
      ]),
    });
  }
  return { ...result, steps, kcal, range };
}

// ---------- The formula shown at the top of "Show the math" ----------

export type FormulaId = "factor" | "k" | "kLinear" | "kNone";
export type FormulaKeyId = "factorKey" | "kKey" | "kNoneKey";

export interface Formula {
  main: { id: FormulaId; vars: Record<string, string> };
  key: { id: FormulaKeyId; vars: Record<string, string> } | null;
}

export function formulaFor(data: EnergyData, species: Species, method: Method, kChoice: KChoice | null): Formula {
  if (method === "factor") {
    const r = data.settings.rer[species];
    const vars = { multiplier: String(r.multiplier), power: String(r.power) };
    return { main: { id: "factor", vars }, key: { id: "factorKey", vars } };
  }
  // The power: from the picked option, or 0.75 for dogs before anything is picked
  const p = kChoice ? kChoice.power : species === "dog" ? 0.75 : null;
  if (p === 1) return { main: { id: "kLinear", vars: {} }, key: null };
  if (p) {
    const vars = { power: fmtPower(p) };
    return { main: { id: "k", vars }, key: { id: "kKey", vars } };
  }
  return { main: { id: "kNone", vars: {} }, key: { id: "kNoneKey", vars: {} } };
}
