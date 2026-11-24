/*
  THE DATA CHECKER for nutrient standards (FEDIAF now, NRC later).
  All amounts are PER 1000 kcal ME, except legal maximums, which FEDIAF gives
  only PER 100 g DRY MATTER.
*/
import { z } from "zod";

/** One number, or different numbers for wet and dry food (selenium, taurine) */
const amount = z.union([z.number().nonnegative(), z.object({ wet: z.number(), dry: z.number() })]);

export const nutrientLimitSchema = z.object({
  /** Minimum per 1000 kcal ME */
  min: amount.optional(),
  /** Nutritional maximum (N) per 1000 kcal ME */
  max: z.number().positive().optional(),
  /** EU legal maximum (L) per 100 g dry matter */
  legalMaxDM: z.number().positive().optional(),
  /** Set when the source itself looks wrong: the app shows "Check" instead of a judgement */
  check: z.string().optional(),
});

export const standardProfileSchema = z.object({
  id: z.string().min(1),
  species: z.enum(["dog", "cat"]),
  label: z.string().min(1),
  source: z.string().min(1),
  /** Calcium : phosphorus ratio, as "1 : min" to "1 : max" → e.g. { min: 1, max: 2 } */
  caP: z.object({ min: z.number().positive(), max: z.number().positive() }).optional(),
  nutrients: z.record(z.string(), nutrientLimitSchema),
});

/** Minimum needs per kg METABOLIC body weight per day (dogs kg^0.75, cats kg^0.67), adult maintenance */
export const perMetabolicWeightSchema = z.object({
  source: z.string().min(1),
  /** Only for these life stages (adults) */
  appliesTo: z.string().min(1),
  dog: z.record(z.string(), amount),
  cat: z.record(z.string(), amount),
});

export const standardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  fullName: z.string().min(1),
  year: z.number().int(),
  profiles: z.array(standardProfileSchema).min(1),
  perMetabolicWeight: perMetabolicWeightSchema.optional(),
});

export type Amount = z.infer<typeof amount>;

export type NutrientLimit = z.infer<typeof nutrientLimitSchema>;
export type StandardProfile = z.infer<typeof standardProfileSchema>;
export type Standard = z.infer<typeof standardSchema>;
