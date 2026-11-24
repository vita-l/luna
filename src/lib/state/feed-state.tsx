"use client";

/*
  THE PET AND FOOD THE USER ENTERED (one pet at a time)
  Shared by all screens, so switching tabs never loses what was typed.
  Saved on the device, so it is still there next time.
*/
import { createContext, useContext, useEffect, useState } from "react";
import { z } from "zod";

import { energyData } from "@/data/energy";
import { autoChoiceIndex, defaultStageId, findStage } from "@/lib/data/energy-select";
import { loadSaved, save } from "@/lib/storage";

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

/** Change the version when the saved shape changes, so old saves are ignored */
const STORAGE_KEY = "feed:v1";

function initialState(): FeedState {
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
}

/** If the data changed since the last visit (a stage was renamed), fall back safely */
function repair(s: FeedState): FeedState {
  if (findStage(energyData, s.species, s.stageId)) return s;
  const stageId = defaultStageId(energyData, s.species);
  return { ...s, stageId, choiceIndex: autoChoiceIndex(energyData, s.species, stageId) };
}

type Update = (patch: Partial<FeedState>) => void;
const FeedContext = createContext<{ state: FeedState; update: Update } | null>(null);

export function FeedStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FeedState>(initialState);
  const [loaded, setLoaded] = useState(false);

  // Read what was saved last time (only in the browser, after the page appears)
  useEffect(() => {
    const saved = loadSaved(STORAGE_KEY, feedStateSchema);
    /* eslint-disable react-hooks/set-state-in-effect -- loading saved data once, after the first paint */
    if (saved) setState(repair(saved));
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Save every change. Not before loading has finished, or the empty start values
  // would be written over what was saved.
  useEffect(() => {
    if (loaded) save(STORAGE_KEY, state);
  }, [state, loaded]);

  const update: Update = (patch) => setState((s) => ({ ...s, ...patch }));
  return <FeedContext.Provider value={{ state, update }}>{children}</FeedContext.Provider>;
}

export function useFeedState() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeedState must be used inside <FeedStateProvider>");
  return ctx;
}
