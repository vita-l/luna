/*
  COURSE EXAMPLES AS TESTS
  Each test is a worked example from the course or the cheat sheet.
  If a data or code change breaks one, the test fails and the site is not published.
*/
import { describe, expect, it } from "vitest";
import { energyData } from "@/data/energy";
import type { Species } from "@/lib/data/energy-schema";
import { calcEnergy, type EnergyInput } from "./energy";
import type { Method, Unit } from "./types";

function choice(species: Species, stage: string, label: string) {
  const found = energyData.choices[species].find((c) => c.stage === stage && c.label === label);
  if (!found) throw new Error(`No choice "${label}" in ${species}/${stage}`);
  return found;
}
function kChoice(species: Species, label: string) {
  const found = energyData.kMethod[species].find((c) => c.label === label);
  if (!found) throw new Error(`No K choice "${label}" for ${species}`);
  return found;
}
function run(p: Partial<EnergyInput> & { species: Species; weightText: string; unit: Unit; method: Method }) {
  return calcEnergy({ data: energyData, lastConversion: null, choice: null, kChoice: null, ...p });
}

describe("Method 2: K value (NRC), L04 p. 20–22", () => {
  const dog = (w: string, label: string) =>
    run({ species: "dog", method: "k", unit: "kg", weightText: w, kChoice: kChoice("dog", label) }).kcal;
  const cat = (w: string, label: string) =>
    run({ species: "cat", method: "k", unit: "kg", weightText: w, kChoice: kChoice("cat", label) }).kcal;

  it("10 kg inactive dog = 534 kcal (p. 20)", () => expect(dog("10", "Inactive adult")).toEqual([534, 534]));
  it("10 kg active dog = 731 kcal (p. 20)", () => expect(dog("10", "Active adult")).toEqual([731, 731]));
  it("22.7 kg inactive dog = 988 kcal (p. 20)", () => expect(dog("22.7", "Inactive adult")).toEqual([988, 988]));
  it("22.7 kg active dog = 1352 kcal (p. 20)", () => expect(dog("22.7", "Active adult")).toEqual([1352, 1352]));
  it("4 kg lean cat = 253 kcal (p. 22)", () => expect(cat("4", "Lean adult")).toEqual([253, 253]));
  it("4 kg young adult cat = 240 kcal (p. 22)", () => expect(cat("4", "Young adult")).toEqual([240, 240]));
  it("4 kg senior cat = 180 kcal (p. 22)", () => expect(cat("4", "Senior")).toEqual([180, 180]));
  it("8 kg overweight cat = 299 kcal (p. 22)", () => expect(cat("8", "Overweight adult")).toEqual([299, 299]));
});

describe("Method 1: RER × activity factor, L04 p. 19–24", () => {
  const dog22lb = (stage: string, label: string) =>
    run({ species: "dog", method: "factor", unit: "lb", weightText: "22", choice: choice("dog", stage, label) });

  it("RER of a 20 kg dog = 662.0 kcal (cheat sheet card 11)", () => {
    const r = run({ species: "dog", method: "factor", unit: "kg", weightText: "20" });
    expect(r.steps.find((s) => s.id === "rer")?.lines[0].rer).toBe("662.0");
  });
  it("22 lb neutered active dog = 630 kcal", () => expect(dog22lb("adult", "Neutered, active").kcal).toEqual([630, 630]));
  it("22 lb inactive dog = 433–472 kcal (range)", () => {
    const r = dog22lb("adult", "Inactive / sedentary");
    expect(r.kcal).toEqual([433, 472]);
    expect(r.range).toBe(true);
  });
  it("22 lb dog, weight gain = 472–551 kcal", () => expect(dog22lb("adult", "Weight gain").kcal).toEqual([472, 551]));
  it("22 lb puppy 0–4 months = 1181 kcal", () => expect(dog22lb("puppy", "0–4 months").kcal).toEqual([1181, 1181]));
  it("22 lb pregnant dog, first 42 days = 709 kcal", () =>
    expect(dog22lb("pregnant", "First 42 days").kcal).toEqual([709, 709]));
  it("22 lb dog nursing 3–4 puppies = 1574 kcal", () =>
    expect(dog22lb("nursing", "3–4 puppies").kcal).toEqual([1574, 1574]));
  it("10 lb kitten = 483 kcal", () =>
    expect(
      run({ species: "cat", method: "factor", unit: "lb", weightText: "10", choice: choice("cat", "kitten", "Kitten") }).kcal,
    ).toEqual([483, 483]));
  it("4.5 kg neutered cat (typed 4,5) = 230 kcal", () =>
    expect(
      run({ species: "cat", method: "factor", unit: "kg", weightText: "4,5", choice: choice("cat", "adult", "Neutered") }).kcal,
    ).toEqual([230, 230]));
});

describe("Steps shown in 'Show the math'", () => {
  it("22 lb → 10 kg → mBW 5.623 → RER 393.6 → 629.8 → 630", () => {
    const r = run({
      species: "dog", method: "factor", unit: "lb", weightText: "22", choice: choice("dog", "adult", "Neutered, active"),
    });
    expect(r.steps.map((s) => s.id)).toEqual(["lbToKg", "metabolicWeight", "rer", "merFactor", "roundKcal"]);
    expect(r.steps[0].lines[0]).toEqual({ lb: "22", factor: "2.2", kg: "10" });
    expect(r.steps[1].lines[0]).toEqual({ kg: "10", power: "0.75", mbw: "5.623" });
    expect(r.steps[2].lines[0]).toEqual({ multiplier: "70", mbw: "5.623", rer: "393.6" });
    expect(r.steps[3].lines[0]).toEqual({ rer: "393.6", factor: "1.6", mer: "629.8" });
    expect(r.steps[4].lines[0]).toEqual({ from: "629.8", to: "630" });
  });
  it("Overweight cat shows power 0.40", () => {
    const r = run({ species: "cat", method: "k", unit: "kg", weightText: "8", kChoice: kChoice("cat", "Overweight adult") });
    expect(r.steps[0].lines[0]).toEqual({ kg: "8", power: "0.40", mbw: "2.297" });
  });
});

describe("Weight box", () => {
  it("empty → no result", () => expect(run({ species: "dog", method: "factor", unit: "kg", weightText: "" }).weightStatus).toBe("empty"));
  it("letters → invalid", () => expect(run({ species: "dog", method: "factor", unit: "kg", weightText: "abc" }).weightStatus).toBe("invalid"));
});
