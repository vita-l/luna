/*
  COURSE EXAMPLES for "Check the diet" (cheat sheet cards 8, 14, 14b, 15, 15b; L07 video)
*/
import { describe, expect, it } from "vitest";
import { foodGuides } from "@/data/food-guides";
import { fediaf2025 } from "@/data/standards/fediaf-2025";
import {
  cupsPerDay,
  eatenPerDay,
  isEnough,
  metabolicWeight,
  neededPerDay,
  waterFromFood,
  waterNeed,
  waterToDrink,
} from "./diet-check";

describe("Card 14: cups per day (video slide 9)", () => {
  it("709 kcal ÷ 425 kcal per cup = 1.67 cups", () => expect(cupsPerDay([709, 709], 425).cups).toEqual([1.67, 1.67]));
  it("445 kcal ÷ 425 kcal per cup = 1.05 cups", () => expect(cupsPerDay([445, 445], 425).cups).toEqual([1.05, 1.05]));
});

describe("Card 8: eaten per day", () => {
  it("125.9 g protein per 1000 kcal, 250 kcal/day → 31.5 g", () => expect(eatenPerDay(125.9, [250, 250])).toEqual([31.48, 31.48]));
});

describe("Card 14b: is methionine enough? (video slides 11–14)", () => {
  // Methionine 0.11 g per kg BW^0.75: NRC on the slide; FEDIAF Table VII-11 gives the same number for adult dogs
  const perMbw = fediaf2025.perMetabolicWeight!.dog.methionine;
  it("FEDIAF adult dog methionine = 0.11 g per kg BW^0.75", () => expect(perMbw).toBe(0.11));

  it("Dog 1, 10 kg, 709 kcal/day: eats 0.73 g, needs 0.62 g → enough", () => {
    const { mbw } = metabolicWeight(10, 0.75);
    const eaten = eatenPerDay(1.03, [709, 709]);
    const needed = neededPerDay(perMbw, mbw, false);
    expect(eaten[0]).toBe(0.73);
    expect(needed).toBe(0.619);
    expect(isEnough(eaten, needed)).toBe("yes");
  });
  it("Dog 2, 11.8 kg, 445 kcal/day: eats 0.46 g, needs 0.70 g → not enough", () => {
    const { mbw } = metabolicWeight(11.8, 0.75);
    const eaten = eatenPerDay(1.03, [445, 445]);
    const needed = neededPerDay(perMbw, mbw, false);
    expect(eaten[0]).toBe(0.458);
    expect(needed).toBe(0.7);
    expect(isEnough(eaten, needed)).toBe("no");
  });
  it("a range that is enough only at the high end", () => expect(isEnough([0.6, 0.7], 0.65)).toBe("onlyHigh"));
});

describe("Cards 15 and 15b: water (video slides 23–24)", () => {
  const cat = waterNeed("cat", 4.5, [250, 250], foodGuides);
  it("4.5 kg cat, 250 kcal: rule 1 → 250 mL", () => expect(cat[0].need).toEqual([250, 250]));
  it("rule 2 (L01) → 40–60 mL/kg → 180–270 mL", () => expect(cat[1].need).toEqual([180, 270]));
  it("classic → 45–60 mL/kg → 203–270 mL", () => expect(cat[2].need).toEqual([203, 270]));
  it("dry food, 12 % moisture, 65 g → 7.8 mL from food", () => expect(waterFromFood(12, [65, 65]).water).toEqual([7.8, 7.8]));
  it("raw food, 68 % moisture, 150 g → 102 mL from food", () => expect(waterFromFood(68, [150, 150]).water).toEqual([102, 102]));
  it("need 225–250 mL, 7.8 mL from food → drink 217.2–242.2 mL", () =>
    expect(waterToDrink([225, 250], [7.8, 7.8])).toEqual([217.2, 242.2]));
  it("10 kg dog: L01 → 400–600 mL, classic → 900–1000 mL (they don't agree)", () => {
    const dog = waterNeed("dog", 10, [630, 630], foodGuides);
    expect(dog[1].need).toEqual([400, 600]);
    expect(dog[2].need).toEqual([900, 1000]);
  });
});
