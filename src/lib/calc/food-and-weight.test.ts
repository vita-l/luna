import { describe, expect, it } from "vitest";
import { calcFood } from "./food";
import { parseNumber } from "./numbers";
import { convertWeight } from "./weight";

describe("Daily food amount (L01 p. 11)", () => {
  it("630 kcal/day, 3500 kcal/kg → 180 g/day, 90 g per meal", () => {
    const r = calcFood({ kcal: [630, 630], range: false, densityText: "3500", meals: 2 });
    expect(r.grams).toEqual([180, 180]);
    expect(r.perMeal).toEqual([90, 90]);
  });
  it("range 433–472 kcal → 124–135 g, 62–68 g per meal", () => {
    const r = calcFood({ kcal: [433, 472], range: true, densityText: "3,500", meals: 2 });
    expect(r.grams).toEqual([124, 135]);
    expect(r.perMeal).toEqual([62, 68]);
    expect(r.steps[0].lines).toHaveLength(2);
  });
  it("299 kcal/day, 4000 kcal/kg → 75 g", () =>
    expect(calcFood({ kcal: [299, 299], range: false, densityText: "4000", meals: 1 }).grams).toEqual([75, 75]));
  it("1000 kcal/day, 3500 kcal/kg → 286 g (cheat sheet card 14)", () =>
    expect(calcFood({ kcal: [1000, 1000], range: false, densityText: "3500", meals: 1 }).grams).toEqual([286, 286]));
  it("warns when kcal/kg looks too small", () =>
    expect(calcFood({ kcal: null, range: false, densityText: "95", meals: 1 }).lowWarning).toBe(true));
});

describe("Typing numbers", () => {
  it("4,5 → 4.5", () => expect(parseNumber("4,5")).toBe(4.5));
  it("3,500 → 3500", () => expect(parseNumber("3,500")).toBe(3500));
  it("empty → null", () => expect(parseNumber("")).toBeNull());
  it("letters → NaN", () => expect(parseNumber("abc")).toBeNaN());
});

describe("Switching lb ↔ kg", () => {
  it("25 lb → 11.36 kg, and back gives exactly 25", () => {
    const toKg = convertWeight({ text: "25", from: "lb", to: "kg", lbPerKg: 2.2, last: null });
    expect(toKg.text).toBe("11.36");
    expect(toKg.note?.vars).toEqual({ lb: "25", kg: "11.36", factor: "2.2" });
    const back = convertWeight({ text: toKg.text, from: "kg", to: "lb", lbPerKg: 2.2, last: toKg.last });
    expect(back.text).toBe("25");
  });
  it("12 kg → 26.4 lb", () =>
    expect(convertWeight({ text: "12", from: "kg", to: "lb", lbPerKg: 2.2, last: null }).text).toBe("26.4"));
});
