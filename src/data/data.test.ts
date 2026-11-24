/*
  DATA CHECK: every data file must match its checker (schema).
  If you make a typing mistake in src/data, this test says what to fix.
*/
import { describe, expect, it } from "vitest";
import { energyDataSchema } from "@/lib/data/energy-schema";
import { energyData } from "./energy";

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
