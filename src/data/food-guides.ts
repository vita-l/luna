// =====================================================================
//  FOOD GUIDES FROM THE COURSE: factors, ranges and judgement tables.
//  Edit numbers here; the Food screen and tests read them.
// =====================================================================
import type { FoodGuides } from "@/lib/data/food-guides-schema";

export const foodGuides: FoodGuides = {
  // kcal per gram of protein, fat, carbohydrate
  atwater: {
    commercial: { protein: 3.5, fat: 8.5, carbohydrate: 3.5, source: "Modified Atwater, NRC 1985 — L07 p. 9–11" },
    homePrepared: { protein: 4, fat: 9, carbohydrate: 4, source: "Atwater, NRC 1974 — L07 p. 9–11" },
  },

  // Typical ash when the label doesn't show it (a tip, not used in the math)
  typicalAsh: { dry: "5–10%", wet: "1–3%", source: "L07 p. 4" },

  // TABLE A — recommended share of energy (% ME): [low, high]. Use 0 for "less than".
  energyShares: [
    { id: "dog-maintenance", species: "dog", label: "Adult dog, maintenance", protein: [20, 25], fat: [35, 40], carbohydrate: [35, 45], source: "L07 p. 8–9" },
    { id: "dog-performance", species: "dog", label: "Performance (working) dog", protein: [25, 30], fat: [40, 45], carbohydrate: [25, 30], source: "L07 p. 8–9" },
    { id: "dog-growth", species: "dog", label: "Growing dog", protein: [25, 30], fat: [40, 45], carbohydrate: [30, 35], source: "L07 p. 8–9" },
    { id: "cat-growth", species: "cat", label: "Growing cat", protein: [30, 35], fat: [45, 50], carbohydrate: [20, 25], source: "L07 p. 8–9" },
    { id: "dog-home", species: "dog", label: "Home-prepared, healthy dog", protein: [30, 60], fat: [40, 60], carbohydrate: [0, 20], source: "L07 p. 9" },
    { id: "cat-home", species: "cat", label: "Home-prepared, healthy cat", protein: [40, 60], fat: [50, 60], carbohydrate: [0, 5], source: "L07 p. 9" },
  ],

  // TABLE B — is it low or high? per 1000 kcal (calories: kcal/kg).
  // Each level: [from, to]. Use null for "no limit".
  levels: {
    dog: {
      source: "L07 video, slide 18",
      nutrients: {
        protein: { veryLow: [null, 30], low: [30, 50], medium: [50, 80], high: [80, null] },
        // The slide leaves gaps (20–25 g, 45–50 g): the app says "between low and medium"
        fat: { low: [null, 20], medium: [25, 45], high: [50, null] },
        fibre: { low: [null, 2.5], high: [15, null] },
        // Check: the slide says very low "< 0.5 mg"; low starts at 0.5 g, so it probably means 0.5 g
        sodium: { veryLow: [null, 0.5], low: [0.5, 1], medium: [1, 2], high: [2, null] },
        // Check: on the slide, low (1–1.5) and medium (1–2) overlap. Kept as printed;
        // the app says "low or medium" when both fit.
        calcium: { veryLow: [null, 1], low: [1, 1.5], medium: [1, 2], high: [2, null] },
        phosphorus: { veryLow: [null, 1], low: [1, 1.5], medium: [1, 2], high: [2, null] },
        calories: { low: [null, 3000], high: [4500, null] },
      },
    },
    cat: {
      source: "L07 video, slide 19",
      nutrients: {
        protein: { low: [null, 70], high: [100, null] },
        fat: { low: [null, 20], high: [50, null] },
        fibre: { low: [null, 2.5], high: [15, null] },
        sodium: { low: [null, 1], high: [2, null] },
        calories: { low: [null, 3000], high: [4500, null] },
      },
    },
  },

  // Calcium : phosphorus — recommended ratio ranges
  caP: [
    { id: "pet-food", label: "Pet foods", min: 1, max: 2, source: "L03 p. 4" },
    { id: "home-cooked", label: "Home-cooked diets", min: 1.1, max: 1.4, source: "L03 p. 4" },
  ],

  // AAFCO "standard" energy for comparing % with AAFCO tables (kcal/kg)
  aafcoStandardEnergy: { dry: 4000, moist: 1000, source: "L07 video, slide 17" },

  // Most energy a dry dog food can have and still be called "light" or "low calorie"
  lightMax: { kcalPerKg: 3100, source: "AAFCO, L07 video slides 7 and 15" },

  // Energy per kg of DRY MATTER: outside this range, % DM tables mislead → use per 1000 kcal
  dmEnergyRange: { min: 3500, max: 4500, source: "L07 video, slide 16" },
};
