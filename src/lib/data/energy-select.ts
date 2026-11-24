/*
  Reading the energy data: which life stages and choices to show.
*/
import type { Choice, EnergyData, LifeStage, Species } from "./energy-schema";

/** The choices for one life stage (a stage can borrow another's with sameChoicesAs) */
export function choicesFor(data: EnergyData, species: Species, stage: LifeStage | null): Choice[] {
  if (!stage) return [];
  const from = stage.sameChoicesAs ?? stage.id;
  return data.choices[species].filter((c) => c.stage === from);
}

/** Only life stages that have at least one choice */
export function usableStages(data: EnergyData, species: Species): LifeStage[] {
  return data.lifeStages[species].filter((s) => choicesFor(data, species, s).length > 0);
}

export function findStage(data: EnergyData, species: Species, id: string | null): LifeStage | null {
  return data.lifeStages[species].find((s) => s.id === id) ?? null;
}

/** The stage picked when the page opens (selected: true), or the first one */
export function defaultStageId(data: EnergyData, species: Species): string | null {
  const list = usableStages(data, species);
  return (list.find((s) => s.selected) ?? list[0])?.id ?? null;
}

/** If a stage has only one choice (like Kitten), pick it right away */
export function autoChoiceIndex(data: EnergyData, species: Species, stageId: string | null): number | null {
  return choicesFor(data, species, findStage(data, species, stageId)).length === 1 ? 0 : null;
}

/** The life stage, choice (method 1) and K value (method 2) the user picked */
export function selectionFor(
  data: EnergyData,
  s: { species: Species; stageId: string | null; choiceIndex: number | null; kIndex: number | null },
) {
  const stage = findStage(data, s.species, s.stageId);
  const choice = s.choiceIndex === null ? null : (choicesFor(data, s.species, stage)[s.choiceIndex] ?? null);
  const kChoice = s.kIndex === null ? null : (data.kMethod[s.species][s.kIndex] ?? null);
  return { stage, choice, kChoice };
}
