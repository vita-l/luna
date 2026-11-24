/*
  ANALYZE THE SAVED FOOD — shared by the Food screen and the Check screen,
  so both always show the same numbers.
*/
import { energyData } from "@/data/energy";
import { foodGuides } from "@/data/food-guides";
import { nutrients } from "@/data/nutrients";
import { standards } from "@/data/standards";
import {
  aafcoCorrected,
  caPRatio,
  carbohydrate,
  densityDigits,
  dryMatter,
  energyEstimate,
  energyShares,
  judgeStandard,
  levelsFor,
  per1000kcal,
  type LabelValues,
  type StandardVerdict,
} from "./food-analysis";
import { fmt, parseNumber } from "./numbers";
import type { MathStep } from "./types";
import type { FoodState } from "@/lib/state/food-state";

export const nutrientByKey = new Map(nutrients.map((n) => [n.key, n]));
const byKey = nutrientByKey;
export const basicKeys = ["protein", "fat", "fibre", "moisture", "ash"] as const;

/** Everything the Food and Check screens need, from what the user typed */
export function analyzeFood(state: FoodState, nfeLabel: string) {
  const { type, form, texts, added, species } = state;

  // ---------- Read the typed numbers ----------
  const shownKeys = [...basicKeys, ...added];
  const values: LabelValues = {};
  const invalid = new Set<string>();
  for (const key of shownKeys) {
    const n = parseNumber(texts[key] ?? "");
    if (n !== null && (Number.isNaN(n) || n < 0)) invalid.add(key);
    values[key] = n === null || Number.isNaN(n) || n < 0 ? null : n;
  }
  const labelKcalRaw = parseNumber(state.labelKcalText);
  const labelKcal = labelKcalRaw !== null && !Number.isNaN(labelKcalRaw) && labelKcalRaw > 0 ? labelKcalRaw : null;
  const labelKcalInvalid = labelKcalRaw !== null && labelKcal === null;

  // ---------- What to compare with ----------
  const standard = standards.find((s) => s.id === state.standardId) ?? standards[0];
  const profile = standard.profiles.find((p) => p.id === state.profileId) ?? null;
  const sharesGuide = foodGuides.energyShares.find((g) => g.id === state.sharesId) ?? null;
  const levelTable = foodGuides.levels[species];

  // ---------- Results ----------
  const carb = carbohydrate(values);
  const est = energyEstimate(values, carb?.nfe ?? null, type, foodGuides, energyData.settings.lbPerKg);
  const kcalUsed = labelKcal ?? est?.perKg ?? null;
  const shares = est ? energyShares(est, sharesGuide) : null;

  const withNfe: LabelValues = { ...values, nfe: carb && !carb.overHundred ? carb.nfe : null };
  const gItems = [
    ...["protein", "fat", "fibre", "ash"].map((k) => ({ key: k, label: byKey.get(k)!.label })),
    { key: "nfe", label: nfeLabel },
    ...added.filter((k) => byKey.get(k)?.unit === "g").map((k) => ({ key: k, label: byKey.get(k)!.label })),
  ];
  const dm = dryMatter(withNfe, gItems, kcalUsed, foodGuides);

  // Per 1000 kcal rows: protein, fat, fibre + every added nutrient with a value
  const densityKeys = ["protein", "fat", "fibre", ...added].filter((k) => values[k] != null);
  const densityRows = kcalUsed
    ? densityKeys.map((key) => {
        const n = byKey.get(key)!;
        const value = values[key]!;
        const { value: per } = per1000kcal(value, n.unit, kcalUsed);
        const perDM = dm ? (n.unit === "g" ? (value / dm.dm) * 100 : value / 10 / (dm.dm / 100)) : null;
        return {
          n,
          per,
          levels: levelsFor(per, levelTable.nutrients[key]),
          hasLevels: !!levelTable.nutrients[key],
          verdict: profile ? judgeStandard(per, perDM, profile.nutrients[key], form) : ({ kind: "none" } as StandardVerdict),
          line: {
            name: n.label,
            value: fmt(value, 3),
            kcal: fmt(kcalUsed, 1),
            result: fmt(per, densityDigits(per)),
            unit: n.unit,
          },
        };
      })
    : [];
  const densitySteps: MathStep[] = [];
  const pctLines = densityRows.filter((r) => r.n.unit === "g").map((r) => r.line);
  const kgLines = densityRows.filter((r) => r.n.unit !== "g").map((r) => r.line);
  if (pctLines.length) densitySteps.push({ id: "densityPercent", lines: pctLines });
  if (kgLines.length) densitySteps.push({ id: "densityPerKg", lines: kgLines });

  const aafcoStandard = form === "dry" ? foodGuides.aafcoStandardEnergy.dry : foodGuides.aafcoStandardEnergy.moist;
  const aafcoRows = kcalUsed
    ? ["protein", "fat", "fibre", ...added.filter((k) => byKey.get(k)?.unit === "g")]
        .filter((k) => values[k] != null)
        .map((k) => ({ key: k, label: byKey.get(k)!.label, value: values[k]!, result: aafcoCorrected(values[k]!, kcalUsed, aafcoStandard) }))
    : [];

  const ratio = caPRatio(values.calcium ?? null, values.phosphorus ?? null);
  const caPGuide = foodGuides.caP.find((g) => g.id === (type === "commercial" ? "pet-food" : "home-cooked"))!;

  // Calories level (Table B) is judged on the dry-matter energy, so wet and dry foods are judged alike
  const calorieLevels = dm?.kcalPerKgDM != null ? levelsFor(dm.kcalPerKgDM, levelTable.nutrients.calories) : [];
  const showLight = species === "dog" && form === "dry" && kcalUsed !== null;


  return {
    values, invalid, labelKcal, labelKcalInvalid,
    standard, profile, sharesGuide, levelTable,
    carb, est, kcalUsed, shares, gItems, dm,
    densityRows, densitySteps, aafcoStandard, aafcoRows,
    ratio, caPGuide, calorieLevels, showLight,
  };
}

export type FoodAnalysis = ReturnType<typeof analyzeFood>;
