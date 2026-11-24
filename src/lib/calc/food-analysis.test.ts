/*
  COURSE EXAMPLES for "Analyze a food" (cheat sheet cards 1–7 and 10, L07)
*/
import { describe, expect, it } from "vitest";
import { foodGuides } from "@/data/food-guides";
import { fediaf2025 } from "@/data/standards/fediaf-2025";
import {
  aafcoCorrected,
  caPRatio,
  carbohydrate,
  dryMatter,
  energyEstimate,
  energyShares,
  judgeStandard,
  levelsFor,
  per1000kcal,
} from "./food-analysis";

// Dog Food A (L07 activity): protein 41.2, fat 15.4, fibre 9.5, moisture 10.5, ash 9.5
const dogFoodA = { protein: 41.2, fat: 15.4, fibre: 9.5, moisture: 10.5, ash: 9.5 };

describe("Card 1: carbohydrate (NFE)", () => {
  it("Dog Food A: 100 − 86.1 = 13.9 %", () => {
    const r = carbohydrate(dogFoodA)!;
    expect(r.sum).toBe(86.1);
    expect(r.nfe).toBe(13.9);
  });
  it("needs all five numbers", () => expect(carbohydrate({ ...dogFoodA, ash: null })).toBeNull());
  it("video slide 25: 36 + 30 + 4 + 14.3 + 6 → NFE 9.7 %", () =>
    expect(carbohydrate({ protein: 36, fat: 30, fibre: 4, ash: 14.3, moisture: 6 })!.nfe).toBe(9.7));
});

describe("Card 2: energy (Modified Atwater)", () => {
  const e = energyEstimate(dogFoodA, 13.9, "commercial", foodGuides, 2.2)!;
  it("Dog Food A: 144.2 + 130.9 + 48.65 = 323.75 kcal per 100 g", () => {
    expect([e.kcalProtein, e.kcalFat, e.kcalCarb]).toEqual([144.2, 130.9, 48.65]);
    expect(e.per100g).toBe(323.75);
  });
  it("per kg = × 10 → 3237.5 kcal/kg", () => expect(e.perKg).toBe(3237.5));
  it("home-prepared uses 4-9-4: video slide 29 → 430 kcal per 100 g", () => {
    const h = energyEstimate({ protein: 32, fat: 18 }, 35, "homePrepared", foodGuides, 2.2)!;
    expect(h.per100g).toBe(430);
  });
});

describe("Card 3: share of energy", () => {
  const e = energyEstimate(dogFoodA, 13.9, "commercial", foodGuides, 2.2)!;
  it("Dog Food A: 44.5 % protein, 40.4 % fat, 15.0 % carbohydrate", () => {
    const s = energyShares(e, null);
    expect([s.protein, s.fat, s.carbohydrate]).toEqual([44.5, 40.4, 15]);
    expect(s.total).toBe(99.9);
  });
  it("judged against Table A: adult dog maintenance → protein above, carbohydrate below", () => {
    const guide = foodGuides.energyShares.find((g) => g.id === "dog-maintenance")!;
    const s = energyShares(e, guide);
    expect(s.verdict).toEqual({ protein: "above", fat: "above", carbohydrate: "below", fits: false });
  });
});

describe("Card 4: dry matter", () => {
  it("canned, 80 % moisture, 6 % fat → 30 % fat DM", () => {
    const r = dryMatter({ moisture: 80, fat: 6 }, [{ key: "fat", label: "Fat" }], null, foodGuides)!;
    expect(r.dm).toBe(20);
    expect(r.percentDM.fat).toBe(30);
  });
  it("4100 kcal/kg, 9 % moisture → 4505 kcal/kg DM (card 5b)", () => {
    const r = dryMatter({ moisture: 9 }, [], 4100, foodGuides)!;
    expect(r.kcalPerKgDM).toBe(4505);
    expect(r.energyOutsideRange).toBe(true);
  });
});

describe("Card 5: per 1000 kcal", () => {
  it("Dog Food B: 46 % protein, 3653 kcal/kg → 125.9 g", () => expect(per1000kcal(46, "g", 3653).value).toBe(125.9));
  it("18.71 mg/kg, 1201 kcal/kg → 15.58 mg (cheat sheet 7a)", () => expect(per1000kcal(18.71, "mg", 1201).value).toBe(15.58));
  it("video slide 29, Diet 1: protein 47 % at 4470 kcal/kg → 105.1 g", () => expect(per1000kcal(47, "g", 4470).value).toBe(105.1));
});

describe("Judgements", () => {
  const dog = foodGuides.levels.dog.nutrients;
  const cat = foodGuides.levels.cat.nutrients;
  it("Table B: 125.9 g protein → high for a dog", () => expect(levelsFor(125.9, dog.protein)).toEqual(["high"]));
  it("Table B: 60 g protein → low for a cat", () => expect(levelsFor(60, cat.protein)).toEqual(["low"]));
  it("Table B: 1.2 g calcium → low or medium (the table overlaps)", () =>
    expect(levelsFor(1.2, dog.calcium)).toEqual(["low", "medium"]));
  it("Table B: 22 g fat → no level (gap between low and medium)", () => expect(levelsFor(22, dog.fat)).toEqual([]));

  const adult110 = fediaf2025.profiles.find((p) => p.id === "dog-adult-110")!;
  it("FEDIAF adult dog: protein 40 g < 45 g minimum", () =>
    expect(judgeStandard(40, null, adult110.nutrients.protein, "dry")).toEqual({ kind: "belowMin", min: 45 }));
  it("FEDIAF adult dog: calcium 7 g > 6.25 g maximum", () =>
    expect(judgeStandard(7, null, adult110.nutrients.calcium, "dry")).toEqual({ kind: "aboveMax", max: 6.25 }));
  it("FEDIAF selenium: wet and dry minimums differ", () => {
    expect(judgeStandard(50, null, adult110.nutrients.selenium, "dry").kind).toBe("ok");
    expect(judgeStandard(50, null, adult110.nutrients.selenium, "moist").kind).toBe("belowMin");
  });
  it("FEDIAF zinc above the EU legal limit (per 100 g DM)", () =>
    expect(judgeStandard(30, 25, adult110.nutrients.zinc, "dry").kind).toBe("aboveLegal"));
  it("FEDIAF kitten arginine is marked Check", () => {
    const kitten = fediaf2025.profiles.find((p) => p.id === "cat-growth")!;
    expect(judgeStandard(3, null, kitten.nutrients.arginine, "dry").kind).toBe("check");
  });
});

describe("Card 6 and 7", () => {
  it("AAFCO: dry cat food 3400 kcal/kg, 35 % protein → 41.2 % at 4000", () =>
    expect(aafcoCorrected(35, 3400, 4000)).toBe(41.2));
  it("Ca:P: 0.8 % ÷ 0.6 % = 1.33", () => expect(caPRatio(0.8, 0.6)).toBe(1.33));
});
