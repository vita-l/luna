"use client";

/*
  THE FOOD being analyzed (one food at a time). Saved on the device.
  The Check screen (phase 3) will read it too.
*/
import { z } from "zod";
import { foodGuides } from "@/data/food-guides";
import { defaultStandardId, standards } from "@/data/standards";
import { createSavedStore } from "./saved-store";

const foodStateSchema = z.object({
  name: z.string(),
  type: z.enum(["commercial", "homePrepared"]),
  form: z.enum(["dry", "moist"]),
  /** What was typed in each box, by nutrient key */
  texts: z.record(z.string(), z.string()),
  /** Nutrients added with "+ Add a nutrient", in the order added */
  added: z.array(z.string()),
  labelKcalText: z.string(),
  species: z.enum(["dog", "cat"]),
  standardId: z.string(),
  profileId: z.string(),
  sharesId: z.string(),
});

export type FoodState = z.infer<typeof foodStateSchema>;
type Species = FoodState["species"];

/** The life stage picked first for each animal */
export function defaultProfileId(standardId: string, species: Species): string {
  const profiles = standards.find((s) => s.id === standardId)?.profiles.filter((p) => p.species === species) ?? [];
  const preferred = species === "dog" ? "dog-adult-110" : "cat-adult-75";
  return (profiles.find((p) => p.id === preferred) ?? profiles[0])?.id ?? "";
}

export function defaultSharesId(species: Species): string {
  return foodGuides.energyShares.find((g) => g.species === species)?.id ?? "";
}

const store = createSavedStore<FoodState>({
  key: "food:v1",
  schema: foodStateSchema,
  initial: () => ({
    name: "",
    type: "commercial",
    form: "dry",
    texts: {},
    added: [],
    labelKcalText: "",
    species: "dog",
    standardId: defaultStandardId,
    profileId: defaultProfileId(defaultStandardId, "dog"),
    sharesId: defaultSharesId("dog"),
  }),
  // Saved choices that no longer exist (a renamed profile) fall back to the defaults
  repair: (s) => {
    const standard = standards.find((x) => x.id === s.standardId) ? s.standardId : defaultStandardId;
    const profileOk = standards.find((x) => x.id === standard)?.profiles.some((p) => p.id === s.profileId && p.species === s.species);
    const sharesOk = foodGuides.energyShares.some((g) => g.id === s.sharesId && g.species === s.species);
    return {
      ...s,
      standardId: standard,
      profileId: profileOk ? s.profileId : defaultProfileId(standard, s.species),
      sharesId: sharesOk ? s.sharesId : defaultSharesId(s.species),
    };
  },
});

export const FoodStateProvider = store.Provider;
export const useFoodState = store.useStore;
