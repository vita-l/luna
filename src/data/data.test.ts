/*
  DATA CHECK: every data file must match its checker (schema).
  If you make a typing mistake in src/data, this test says what to fix.
*/
import { describe, expect, it } from "vitest";
import type { z } from "zod";
import { energyDataSchema } from "@/lib/data/energy-schema";
import { foodGuidesSchema } from "@/lib/data/food-guides-schema";
import { nutrientSchema } from "@/lib/data/nutrients-schema";
import { standardSchema } from "@/lib/data/standards-schema";
import { energyData } from "./energy";
import { foodGuides } from "./food-guides";
import { nutrients } from "./nutrients";
import { standards } from "./standards";

function expectValid(name: string, schema: z.ZodType, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`${name} has a problem:\n` + result.error.issues.map((i) => `- ${i.path.join(" → ")}: ${i.message}`).join("\n"));
  }
}

describe("food data files", () => {
  it("food-guides.ts is valid", () => expectValid("food-guides.ts", foodGuidesSchema, foodGuides));
  it("nutrients.ts is valid, with no repeated keys", () => {
    nutrients.forEach((n) => expectValid(`nutrients.ts "${n.label}"`, nutrientSchema, n));
    const keys = nutrients.map((n) => n.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
  for (const s of standards) {
    it(`${s.name} is valid`, () => expectValid(s.name, standardSchema, s));
    it(`${s.name}: every nutrient is in nutrients.ts`, () => {
      const known = new Set(nutrients.map((n) => n.key));
      const unknown = s.profiles.flatMap((p) => Object.keys(p.nutrients).filter((k) => !known.has(k)).map((k) => `${p.id}: ${k}`));
      expect(unknown).toEqual([]);
    });
  }
  it("FEDIAF spot checks against the tables (p. 73–79)", () => {
    const p = (id: string) => standards[0].profiles.find((x) => x.id === id)!;
    expect(p("dog-adult-110").nutrients.protein.min).toBe(45);
    expect(p("dog-adult-95").nutrients.protein.min).toBe(52.1);
    expect(p("dog-early-growth").nutrients.calcium).toEqual({ min: 2.5, max: 4 });
    expect(p("cat-adult-75").nutrients.protein.min).toBe(83.3);
    expect(p("cat-adult-100").nutrients.taurine.min).toEqual({ wet: 0.5, dry: 0.25 });
  });
});

describe("src/data/energy.ts", () => {
  it("is valid", () => {
    const result = energyDataSchema.safeParse(energyData);
    if (!result.success) {
      throw new Error(
        "energy.ts has a problem:\n" + result.error.issues.map((i) => `- ${i.path.join(" → ")}: ${i.message}`).join("\n"),
      );
    }
    expect(result.success).toBe(true);
  });

  it("catches a choice that points to a missing life stage", () => {
    const broken = structuredClone(energyData);
    broken.choices.dog[0].stage = "pupy";
    const result = energyDataSchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('stage "pupy" does not match');
  });

  it("catches a range with the high number first", () => {
    const broken = structuredClone(energyData);
    broken.choices.dog[4].factor = [1.2, 1.1];
    expect(energyDataSchema.safeParse(broken).success).toBe(false);
  });
});
