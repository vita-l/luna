/*
  THE DATA CHECKER for src/data/energy.ts
  It describes what correct data looks like. If a number or name is wrong,
  the tests fail with a clear message, and the site is not published.
*/
import { z } from "zod";

/** One number (1.6) or a range [low, high] like [1.1, 1.2] */
export const factorSchema = z.union([
  z.number().positive(),
  z
    .tuple([z.number().positive(), z.number().positive()])
    .refine(([low, high]) => high >= low, "A range must have the low number first, like [1.1, 1.2]"),
]);

export const lifeStageSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  question: z.string().optional(),
  selected: z.boolean().optional(),
  sameChoicesAs: z.string().optional(),
  note: z.string().optional(),
  layout: z.enum(["list", "grid"]).optional(),
});

export const choiceSchema = z.object({
  stage: z.string().min(1),
  label: z.string().min(1),
  factor: factorSchema,
  heading: z.string().optional(),
  hint: z.string().optional(),
  idealWeight: z.boolean().optional(),
  source: z.string().optional(),
});

export const kChoiceSchema = z.object({
  label: z.string().min(1),
  k: z.number().positive(),
  power: z.number().positive(),
  hint: z.string().optional(),
  source: z.string().optional(),
});

const rerSchema = z.object({
  multiplier: z.number().positive(),
  power: z.number().positive(),
  source: z.string().optional(),
});

const perSpecies = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ dog: z.array(item), cat: z.array(item) });

export const energyDataSchema = z
  .object({
    lifeStages: perSpecies(lifeStageSchema),
    choices: perSpecies(choiceSchema),
    kMethod: z.object({
      description: z.string(),
      dog: z.array(kChoiceSchema).min(1),
      cat: z.array(kChoiceSchema).min(1),
    }),
    settings: z.object({
      rer: z.object({ dog: rerSchema, cat: rerSchema }),
      lbPerKg: z.number().positive(),
      lbPerKgSource: z.string().optional(),
      feedingSource: z.string().optional(),
    }),
  })
  .superRefine((data, ctx) => {
    for (const species of ["dog", "cat"] as const) {
      const stages = data.lifeStages[species];
      const ids = stages.map((s) => s.id);
      if (stages.length === 0) {
        ctx.addIssue({ code: "custom", message: `There are no life stages for ${species}s.` });
      }
      for (const choice of data.choices[species]) {
        if (!ids.includes(choice.stage)) {
          ctx.addIssue({
            code: "custom",
            message: `${species}, “${choice.label}”: stage "${choice.stage}" does not match any life stage id.`,
          });
        }
      }
      for (const stage of stages) {
        if (stage.sameChoicesAs && !ids.includes(stage.sameChoicesAs)) {
          ctx.addIssue({
            code: "custom",
            message: `${species}, life stage “${stage.label}”: sameChoicesAs "${stage.sameChoicesAs}" does not match any life stage id.`,
          });
        }
        const from = stage.sameChoicesAs ?? stage.id;
        if (!data.choices[species].some((c) => c.stage === from)) {
          ctx.addIssue({ code: "custom", message: `${species}, life stage “${stage.label}” has no choices.` });
        }
      }
    }
  });

export type EnergyData = z.infer<typeof energyDataSchema>;
export type LifeStage = z.infer<typeof lifeStageSchema>;
export type Choice = z.infer<typeof choiceSchema>;
export type KChoice = z.infer<typeof kChoiceSchema>;
export type Factor = z.infer<typeof factorSchema>;
export type Species = "dog" | "cat";
