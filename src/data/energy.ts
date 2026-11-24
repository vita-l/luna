// =====================================================================
//  ENERGY DATA — life stages, activity factors, K values, formulas.
//  This is the file to edit when the course numbers change.
// =====================================================================
//
//  HOW TO EDIT
//  - Each line is one button.
//  - To ADD: copy a whole line, paste it under, change the words and the number.
//  - To REMOVE: delete the whole line.  To CHANGE THE ORDER: move lines.
//  - Keep the "quotes" around words, and the comma at the end of each line.
//  - Run the tests (npm test). If something is wrong, the test says what to fix.
//
//  LIFE STAGES (method 1, question 1)
//    id:            short code word, no spaces. Choices use it to say where they belong.
//    label:         text on the button
//    question:      (optional) title above the choices
//    selected:      true = picked when the page opens
//    sameChoicesAs: (optional) show the same choices as another stage
//    note:          (optional) small note above the choices
//    layout:        (optional) "grid" = small buttons side by side
//
//  CHOICES (method 1, question 2)
//    stage:       the id of the life stage it belongs to
//    label:       text on the button
//    factor:      activity factor (MER = RER × factor): 1.6, or a range [1.1, 1.2]
//    heading:     (optional) small title above a group. Keep lines with the same heading together.
//    hint:        (optional) small grey line under the label
//    idealWeight: true = the weight box changes to "Ideal body weight"
//    source:      where it comes from. A note for you; users don't see it.
//
//  K METHOD (method 2): MER = k × (weight in kg) ^ power.  Use power 1 for "k × BW".
// =====================================================================

import type { EnergyData } from "@/lib/data/energy-schema";

export const energyData: EnergyData = {
  lifeStages: {
    dog: [
      { id: "puppy", label: "Puppy", question: "Age" },
      { id: "adult", label: "Adult", selected: true },
      {
        id: "senior", label: "Senior", sameChoicesAs: "adult",
        note: "Seniors are calculated like adults, but usually need less energy. Inactive or obese-prone may fit better.",
      },
      { id: "pregnant", label: "Pregnant", question: "Stage of pregnancy" },
      { id: "nursing", label: "Nursing", question: "How many puppies?", layout: "grid" },
    ],
    cat: [
      { id: "kitten", label: "Kitten", question: "Age" },
      { id: "adult", label: "Adult", selected: true },
      {
        id: "senior", label: "Senior", sameChoicesAs: "adult",
        note: "Seniors are calculated like adults, but usually need less energy. Sedentary / obese-prone may fit better.",
      },
      { id: "pregnant", label: "Pregnant", question: "Stage of pregnancy" },
      // Nursing is left out for now: for cats it is RER + a % per kitten that changes by week.
    ],
  },

  choices: {
    // ---------- DOGS ----------  (L04 p. 23–24)
    dog: [
      { stage: "puppy", label: "0–4 months", factor: 3.0, source: "L04 p. 23–24" },
      { stage: "puppy", label: "4 months to adult size", factor: 2.0, source: "L04 p. 23–24" },

      { stage: "adult", heading: "Pet dog", label: "Neutered, active", factor: 1.6, source: "L04 p. 23–24" },
      { stage: "adult", heading: "Pet dog", label: "Intact, active", factor: 1.8, source: "L04 p. 23–24" },
      { stage: "adult", heading: "Pet dog", label: "Inactive / sedentary", factor: [1.1, 1.2], source: "L04 p. 23–24" },
      { stage: "adult", heading: "Pet dog", label: "Obese-prone", factor: 1.4, source: "L04 p. 23–24" },

      { stage: "adult", heading: "Working dog", label: "Light work", factor: 2.0, source: "L04 p. 23–24" },
      { stage: "adult", heading: "Working dog", label: "Moderate work", factor: 3.0, source: "L04 p. 23–24" },
      { stage: "adult", heading: "Working dog", label: "Heavy work", factor: 4.0, source: "L04 p. 23–24" },

      { stage: "adult", heading: "Special", label: "Weight loss", factor: 1.0, idealWeight: true, hint: "Use the ideal weight", source: "L04 p. 23–24" },
      { stage: "adult", heading: "Special", label: "Weight gain", factor: [1.2, 1.4], idealWeight: true, hint: "Use the ideal weight", source: "L04 p. 23–24" },
      { stage: "adult", heading: "Special", label: "Critical care", factor: 1.0, source: "L04 p. 23–24" },

      // First 42 days: the summary table says MER of an intact adult (1.8). p. 7 says 1.7. We use the table.
      { stage: "pregnant", label: "First 42 days", factor: 1.8, source: "L04 p. 24 (p. 7 says 1.7)" },
      { stage: "pregnant", label: "Last 21 days", factor: 3.0, source: "L04 p. 23–24" },

      { stage: "nursing", label: "1 puppy", factor: 3.0, source: "L04 p. 23–24" },
      { stage: "nursing", label: "2 puppies", factor: 3.5, source: "L04 p. 23–24" },
      { stage: "nursing", label: "3–4 puppies", factor: 4.0, source: "L04 p. 23–24" },
      { stage: "nursing", label: "5–6 puppies", factor: 5.0, source: "L04 p. 23–24" },
      { stage: "nursing", label: "7–8 puppies", factor: 5.5, source: "L04 p. 23–24" },
      { stage: "nursing", label: "9+ puppies", factor: 6.0, source: "L04 p. 23–24 (course says 6 or more)" },
    ],

    // ---------- CATS ----------  (L04 p. 24)
    cat: [
      { stage: "kitten", label: "Kitten", factor: 2.5, source: "L04 p. 24" },

      { stage: "adult", heading: "Everyday", label: "Neutered", factor: 1.2, source: "L04 p. 24" },
      { stage: "adult", heading: "Everyday", label: "Intact", factor: 1.4, source: "L04 p. 24" },
      { stage: "adult", heading: "Everyday", label: "Active", factor: 1.6, source: "L04 p. 24 (has a warning — check later)" },
      { stage: "adult", heading: "Everyday", label: "Sedentary / obese-prone", factor: 1.0, source: "L04 p. 24" },

      { stage: "adult", heading: "Special", label: "Weight loss", factor: 0.8, idealWeight: true, hint: "Use the ideal weight", source: "L04 p. 24" },
      { stage: "adult", heading: "Special", label: "Weight gain", factor: [1.2, 1.4], idealWeight: true, hint: "Use the ideal weight", source: "L04 p. 24" },
      { stage: "adult", heading: "Special", label: "Critical care", factor: 1.0, source: "L04 p. 24" },

      { stage: "pregnant", label: "Early", factor: 1.6, source: "L04 p. 3–4, 24" },
      { stage: "pregnant", label: "Middle", factor: 1.8, source: "L04 p. 3–4, 24" },
      { stage: "pregnant", label: "Late", factor: 2.0, source: "L04 p. 3–4, 24" },
    ],
  },

  kMethod: {
    // The short text users see when they pick method 2
    description: "Source: NRC (National Research Council), Nutrient Requirements of Dogs and Cats, 2006.",
    dog: [
      { label: "Inactive adult", k: 95, power: 0.75, source: "L04 p. 20, Box 9-2" },
      { label: "Active adult", k: 130, power: 0.75, source: "L04 p. 20, Box 9-2" },
    ],
    cat: [
      { label: "Lean adult", k: 100, power: 0.67, source: "L04 p. 21" },
      { label: "Overweight adult", k: 130, power: 0.4, source: "L04 p. 21" },
      { label: "Young adult", k: 60, power: 1, source: "L04 p. 22 (60 kcal/kg BW)" },
      { label: "Senior", k: 45, power: 1, hint: "Middle-aged or older", source: "L04 p. 22 (45 kcal/kg BW)" },
    ],
  },

  settings: {
    // RER = multiplier × (weight in kg) ^ power
    rer: {
      dog: { multiplier: 70, power: 0.75, source: "L04 p. 19" },
      cat: { multiplier: 70, power: 0.67, source: "L04 p. 21" },
    },
    // Pounds → kilograms. The course uses 1 kg = 2.2 lb.
    lbPerKg: 2.2,
    lbPerKgSource: "L01 p. 11",
    // How much to feed = daily energy need ÷ energy in the food
    feedingSource: "L01 p. 11",
  },
};
