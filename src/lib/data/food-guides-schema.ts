/* THE DATA CHECKER for src/data/food-guides.ts */
import { z } from "zod";

const factors = z.object({
  protein: z.number().positive(),
  fat: z.number().positive(),
  carbohydrate: z.number().positive(),
  source: z.string(),
});

const range = z.tuple([z.number().nonnegative(), z.number().positive()]);
const bound = z.tuple([z.number().nullable(), z.number().nullable()]);

export const levelNames = ["veryLow", "low", "medium", "high"] as const;
export type LevelName = (typeof levelNames)[number];

const levelSet = z.object({
  veryLow: bound.optional(),
  low: bound.optional(),
  medium: bound.optional(),
  high: bound.optional(),
});

export const foodGuidesSchema = z.object({
  atwater: z.object({ commercial: factors, homePrepared: factors }),
  typicalAsh: z.object({ dry: z.string(), wet: z.string(), source: z.string() }),
  energyShares: z.array(
    z.object({
      id: z.string(),
      species: z.enum(["dog", "cat"]),
      label: z.string(),
      protein: range,
      fat: range,
      carbohydrate: range,
      source: z.string(),
    }),
  ),
  levels: z.object({
    dog: z.object({ source: z.string(), nutrients: z.record(z.string(), levelSet) }),
    cat: z.object({ source: z.string(), nutrients: z.record(z.string(), levelSet) }),
  }),
  caP: z.array(z.object({ id: z.string(), label: z.string(), min: z.number(), max: z.number(), source: z.string() })),
  aafcoStandardEnergy: z.object({ dry: z.number(), moist: z.number(), source: z.string() }),
  lightMax: z.object({ kcalPerKg: z.number(), source: z.string() }),
  dmEnergyRange: z.object({ min: z.number(), max: z.number(), source: z.string() }),
  water: z.object({
    perKcal: z.object({ mlPerKcal: z.number().positive(), source: z.string() }),
    perKg: z.object({ min: z.number().positive(), max: z.number().positive(), source: z.string() }),
    classic: z.object({ dog: range, cat: range, source: z.string() }),
  }),
});

export type FoodGuides = z.infer<typeof foodGuidesSchema>;
export type LevelSet = z.infer<typeof levelSet>;
export type EnergyShareGuide = FoodGuides["energyShares"][number];
