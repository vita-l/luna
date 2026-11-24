"use client";

/*
  THE PET AND FEEDING CHOICES (one pet at a time)
  Shared by all screens, so switching tabs never loses what was typed.
  Saved on the device, so it is still there next time.
*/
import { z } from "zod";
import { energyData } from "@/data/energy";
import { autoChoiceIndex, defaultStageId, findStage } from "@/lib/data/energy-select";
import { createSavedStore } from "./saved-store";

const feedStateSchema = z.object({
  method: z.enum(["factor", "k"]),
  species: z.enum(["dog", "cat"]),
  unit: z.enum(["lb", "kg"]),
  weightText: z.string(),
  lastConversion: z.object({ typed: z.string(), from: z.enum(["lb", "kg"]), shown: z.string() }).nullable(),
  stageId: z.string().nullable(),
  choiceIndex: z.number().int().nullable(),
  kIndex: z.number().int().nullable(),
  densityText: z.string(),
  meals: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

export type FeedState = z.infer<typeof feedStateSchema>;

const store = createSavedStore<FeedState>({
  key: "feed:v1",
  schema: feedStateSchema,
  initial: () => {
    const stageId = defaultStageId(energyData, "dog");
    return {
      method: "factor",
      species: "dog",
      unit: "lb",
      weightText: "",
      lastConversion: null,
      stageId,
      choiceIndex: autoChoiceIndex(energyData, "dog", stageId),
      kIndex: null,
      densityText: "",
      meals: 1,
    };
  },
  // If the data changed since the last visit (a stage was renamed), fall back safely
  repair: (s) => {
    if (findStage(energyData, s.species, s.stageId)) return s;
    const stageId = defaultStageId(energyData, s.species);
    return { ...s, stageId, choiceIndex: autoChoiceIndex(energyData, s.species, stageId) };
  },
});

export const FeedStateProvider = store.Provider;
export const useFeedState = store.useStore;
