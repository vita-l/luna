// =====================================================================
//  NUTRIENTS the app knows. The order here is the order on screen.
//
//    key:   short code word (used by the standards files)
//    label: the name on screen
//    unit:  the unit per 1000 kcal: "g", "mg", "µg" or "IU"
//    basic: true = always on the Food screen (from the guaranteed analysis)
//           false = added with "+ Add nutrient"
//    species: (optional) only for "cat" or "dog"
//
//  How labels show amounts:  g nutrients → %   ·   mg → mg/kg   ·   µg → µg/kg   ·   IU → IU/kg
// =====================================================================
import type { Nutrient } from "@/lib/data/nutrients-schema";

export const nutrients: Nutrient[] = [
  // From the guaranteed analysis
  { key: "protein", label: "Protein", unit: "g", basic: true },
  { key: "fat", label: "Fat", unit: "g", basic: true },
  { key: "fibre", label: "Fibre", unit: "g", basic: true },
  { key: "moisture", label: "Moisture", unit: "g", basic: true },
  { key: "ash", label: "Ash", unit: "g", basic: true },

  // Added with "+ Add nutrient"
  { key: "linoleic", label: "Linoleic acid (ω-6)", unit: "g", basic: false },
  { key: "arginine", label: "Arginine", unit: "g", basic: false },
  { key: "methionine", label: "Methionine", unit: "g", basic: false },
  { key: "metCys", label: "Methionine + cystine", unit: "g", basic: false },
  { key: "taurine", label: "Taurine", unit: "g", basic: false, species: "cat" },
  { key: "calcium", label: "Calcium", unit: "g", basic: false },
  { key: "phosphorus", label: "Phosphorus", unit: "g", basic: false },
  { key: "potassium", label: "Potassium", unit: "g", basic: false },
  { key: "sodium", label: "Sodium", unit: "g", basic: false },
  { key: "chloride", label: "Chloride", unit: "g", basic: false },
  { key: "magnesium", label: "Magnesium", unit: "g", basic: false },
  { key: "copper", label: "Copper", unit: "mg", basic: false },
  { key: "iodine", label: "Iodine", unit: "mg", basic: false },
  { key: "iron", label: "Iron", unit: "mg", basic: false },
  { key: "manganese", label: "Manganese", unit: "mg", basic: false },
  { key: "selenium", label: "Selenium", unit: "µg", basic: false },
  { key: "zinc", label: "Zinc", unit: "mg", basic: false },
  { key: "vitaminA", label: "Vitamin A", unit: "IU", basic: false },
  { key: "vitaminD", label: "Vitamin D", unit: "IU", basic: false },
  { key: "vitaminE", label: "Vitamin E", unit: "IU", basic: false },
];
