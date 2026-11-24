import { z } from "zod";

export const nutrientUnitSchema = z.enum(["g", "mg", "µg", "IU"]);

export const nutrientSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  unit: nutrientUnitSchema,
  basic: z.boolean(),
  species: z.enum(["dog", "cat"]).optional(),
});

export type Nutrient = z.infer<typeof nutrientSchema>;
export type NutrientUnit = z.infer<typeof nutrientUnitSchema>;

/** How a label shows each unit: g nutrients as %, the others per kg of food */
export const labelUnit: Record<NutrientUnit, string> = {
  g: "%",
  mg: "mg/kg",
  µg: "µg/kg",
  IU: "IU/kg",
};
