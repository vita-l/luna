"use client";

/*
  FEED MY PET: "How much should my pet eat?"
  Step 1: daily calorie needs (method 1: activity factor, method 2: K value)
  Step 2: daily food amount (grams, optional meals)

  This file only connects the pieces:
  words → src/content/en.json · numbers → src/data/energy.ts
  math → src/lib/calc · look → src/components/ui + src/styles/tokens.css
*/
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { energyData } from "@/data/energy";
import { calcEnergy, formulaFor } from "@/lib/calc/energy";
import { calcFood } from "@/lib/calc/food";
import { fmt, fmtFactor, fmtPair } from "@/lib/calc/numbers";
import type { Method, Unit } from "@/lib/calc/types";
import { convertWeight, type ConversionNote, type LastConversion } from "@/lib/calc/weight";
import { copy, fill } from "@/lib/copy";
import type { Species } from "@/lib/data/energy-schema";
import {
  autoChoiceIndex,
  choicesFor,
  defaultStageId,
  findStage,
  usableStages,
} from "@/lib/data/energy-select";

import { Chips } from "@/components/ui/chips";
import { Field, FieldLabel, Message } from "@/components/ui/field";
import { MathDetails } from "@/components/ui/math-details";
import { NumberField } from "@/components/ui/number-field";
import { OptionGroup, type OptionItem } from "@/components/ui/option-group";
import { BigNumber, ResultPanel } from "@/components/ui/result-panel";
import { RichText } from "@/components/ui/rich-text";
import { Segmented } from "@/components/ui/segmented";
import { StepCard } from "@/components/ui/step-card";

type Meals = 1 | 2 | 3;
const t = copy.feed;
const data = energyData;

export function FeedScreen() {
  // ---------- What the user picked and typed ----------
  const [method, setMethod] = useState<Method>("factor");
  const [species, setSpecies] = useState<Species>("dog");
  const [unit, setUnit] = useState<Unit>("lb");
  const [weightText, setWeightText] = useState("");
  const [lastConversion, setLastConversion] = useState<LastConversion | null>(null);
  const [conversionNote, setConversionNote] = useState<ConversionNote | null>(null);
  const [stageId, setStageId] = useState(() => defaultStageId(data, "dog"));
  const [choiceIndex, setChoiceIndex] = useState(() => autoChoiceIndex(data, "dog", defaultStageId(data, "dog")));
  const [kIndex, setKIndex] = useState<number | null>(null);
  const [densityText, setDensityText] = useState("");
  const [meals, setMeals] = useState<Meals>(1);

  // ---------- What follows from it ----------
  const stage = findStage(data, species, stageId);
  const choices = choicesFor(data, species, stage);
  const choice = choiceIndex === null ? null : (choices[choiceIndex] ?? null);
  const kChoices = data.kMethod[species];
  const kChoice = kIndex === null ? null : (kChoices[kIndex] ?? null);
  const isK = method === "k";
  const picked = isK ? kChoice : choice;
  const ideal = !isK && !!choice?.idealWeight;

  const energy = calcEnergy({ data, species, method, unit, weightText, lastConversion, choice, kChoice });
  const food = calcFood({ kcal: energy.kcal, range: energy.range, densityText, meals });
  const formula = formulaFor(data, species, method, kChoice);

  // ---------- Actions ----------
  function changeSpecies(next: Species) {
    const nextStage = defaultStageId(data, next);
    setSpecies(next);
    setStageId(nextStage);
    setChoiceIndex(autoChoiceIndex(data, next, nextStage));
    setKIndex(null);
  }
  function changeMethod(next: Method) {
    setMethod(next);
    setKIndex(null);
  }
  function changeStage(next: string) {
    setStageId(next);
    setChoiceIndex(autoChoiceIndex(data, species, next));
  }
  function changeUnit(next: Unit) {
    const r = convertWeight({ text: weightText, from: unit, to: next, lbPerKg: data.settings.lbPerKg, last: lastConversion });
    setWeightText(r.text);
    setLastConversion(r.last);
    setConversionNote(r.note);
    setUnit(next);
  }
  function typeWeight(next: string) {
    setWeightText(next);
    setLastConversion(null); // typing a new weight forgets the last switch
    setConversionNote(null);
  }

  // ---------- Options for question 2 ----------
  const optionItems: OptionItem[] = isK
    ? kChoices.map((c, i) => ({ value: String(i), label: c.label, hint: c.hint, badge: `K ${c.k}` }))
    : choices.map((c, i) => ({
        value: String(i), label: c.label, hint: c.hint, badge: `× ${fmtFactor(c.factor)}`, heading: c.heading,
      }));
  const question = isK ? undefined : stage?.question;

  // ---------- Result texts ----------
  const kcalReady = energy.kcal !== null;
  const step1Empty =
    energy.weightStatus === "ok" ? t.step1.emptyChoice : picked ? t.step1.emptyWeight : t.step1.emptyBoth;
  const resultParts = [species === "dog" ? t.step1.dogName : t.step1.catName];
  if (isK && kChoice) resultParts.push(t.step1.kValueLabel, kChoice.label);
  if (!isK && stage && choice) {
    resultParts.push(stage.label);
    if (choice.label !== stage.label) resultParts.push(choice.label);
  }
  if (energy.weightLabel) resultParts.push(`${energy.weightLabel}${ideal ? ` ${t.step1.idealSuffix}` : ""}`);

  const foodReady = food.grams !== null;
  const step2Empty = !kcalReady
    ? food.density !== null ? t.step2.emptyStep1Only : t.step2.emptyStep1
    : t.step2.emptyEnergy;

  return (
    <>
      {/* ================= STEP 1: calories ================= */}
      <StepCard step={1} id="s1-title" title={t.step1.title} subtitle={t.step1.subtitle}>
        <Field>
          <FieldLabel id="method-label">{t.step1.method}</FieldLabel>
          <Segmented<Method>
            labelledBy="method-label"
            value={method}
            onValueChange={changeMethod}
            options={[
              { value: "factor", label: t.step1.methodFactor, sub: t.step1.methodFactorSub },
              { value: "k", label: t.step1.methodK, sub: t.step1.methodKSub },
            ]}
          />
          {isK && <Message>{data.kMethod.description}</Message>}
        </Field>

        <Field>
          <FieldLabel id="animal-label">{t.step1.animal}</FieldLabel>
          <Segmented<Species>
            labelledBy="animal-label"
            value={species}
            onValueChange={changeSpecies}
            options={[
              { value: "dog", label: t.step1.dog },
              { value: "cat", label: t.step1.cat },
            ]}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="weight">{ideal ? t.step1.idealWeight : t.step1.weight}</FieldLabel>
          <div className="flex items-stretch gap-2">
            <NumberField
              id="weight"
              value={weightText}
              onChange={typeWeight}
              placeholder={t.step1.weightPlaceholder}
              invalid={energy.weightStatus === "invalid"}
              describedBy="weight-note weight-msg"
              size="short"
            />
            <Segmented<Unit>
              ariaLabel={t.step1.weightUnit}
              value={unit}
              onValueChange={changeUnit}
              options={[
                { value: "lb", label: "lb" },
                { value: "kg", label: "kg" },
              ]}
              className="flex-[0_0_116px]"
            />
          </div>
          {conversionNote && (
            <Message id="weight-note">
              {fill(conversionNote.kind === "toKg" ? t.step1.toKgNote : t.step1.toLbNote, conversionNote.vars)}
            </Message>
          )}
          {energy.weightStatus === "invalid" && (
            <Message id="weight-msg" tone="error">
              {t.step1.weightError}
            </Message>
          )}
          {ideal && (
            <Message tone="ideal">
              <RichText text={t.step1.idealNote} />
            </Message>
          )}
        </Field>

        {!isK && (
          <Field>
            <FieldLabel id="stage-label">{t.step1.lifeStage}</FieldLabel>
            <Chips
              labelledBy="stage-label"
              value={stageId ?? ""}
              onValueChange={changeStage}
              options={usableStages(data, species).map((s) => ({ value: s.id, label: s.label }))}
            />
          </Field>
        )}

        <Field>
          <FieldLabel id="q2-label" hidden={!question}>
            {question ?? t.step1.chooseOne}
          </FieldLabel>
          {!isK && stage?.note && <Message tone="note">{stage.note}</Message>}
          <OptionGroup
            key={`${method}-${species}-${stageId}`}
            labelledBy="q2-label"
            items={optionItems}
            tiles={!isK && stage?.layout === "grid"}
            value={isK ? (kIndex === null ? null : String(kIndex)) : choiceIndex === null ? null : String(choiceIndex)}
            onValueChange={(v) => (isK ? setKIndex(Number(v)) : setChoiceIndex(Number(v)))}
          />
        </Field>

        <ResultPanel ready={kcalReady} emptyText={step1Empty}>
          {energy.kcal && (
            <>
              <BigNumber value={fmtPair(energy.kcal)} unit={t.step1.unitKcalDay} small={energy.range} />
              <p className="mt-1.5 text-[15px] text-muted">{resultParts.join(" · ")}</p>
            </>
          )}
        </ResultPanel>

        <Reveal show={kcalReady}>
          <MathDetails
            steps={energy.steps}
            formula={fill(copy.math.formula[formula.main.id], formula.main.vars)}
            formulaKey={formula.key ? fill(copy.math.formula[formula.key.id], formula.key.vars) : null}
          />
        </Reveal>
      </StepCard>

      {/* ================= STEP 2: food ================= */}
      <StepCard step={2} id="s2-title" title={t.step2.title} subtitle={t.step2.subtitle}>
        <Field>
          <FieldLabel htmlFor="density">{t.step2.energy}</FieldLabel>
          <NumberField
            id="density"
            value={densityText}
            onChange={setDensityText}
            placeholder={t.step2.energyPlaceholder}
            suffix={t.step2.energySuffix}
            invalid={food.densityStatus === "invalid"}
            describedBy="density-help density-msg"
          />
          <Message id="density-help">
            <RichText text={t.step2.energyHelp} />
          </Message>
          {food.densityStatus === "invalid" && (
            <Message id="density-msg" tone="error">
              {t.step2.energyError}
            </Message>
          )}
          {food.lowWarning && (
            <Message id="density-msg" tone="warn">
              {t.step2.energyLowWarn}
            </Message>
          )}
        </Field>

        <Field>
          <FieldLabel id="meals-label">{t.step2.meals}</FieldLabel>
          <Segmented<"1" | "2" | "3">
            labelledBy="meals-label"
            value={String(meals) as "1" | "2" | "3"}
            onValueChange={(v) => setMeals(Number(v) as Meals)}
            options={[
              { value: "1", label: t.step2.mealsNo },
              { value: "2", label: t.step2.meals2 },
              { value: "3", label: t.step2.meals3 },
            ]}
          />
        </Field>

        <ResultPanel ready={foodReady} emptyText={step2Empty}>
          {food.grams && energy.kcal && food.density !== null && (
            <>
              <BigNumber value={fmtPair(food.grams)} unit={t.step2.unitGramsDay} small={energy.range} />
              {food.perMeal && (
                <p className="mt-2.5 text-[18px] font-semibold">
                  <RichText text={fill(t.step2.perMeal, { grams: fmtPair(food.perMeal), meals })} />
                </p>
              )}
              <p className="mt-1.5 text-[15px] text-muted">
                {fill(t.step2.resultSub, { kcal: fmtPair(energy.kcal), density: fmt(food.density, 1) })}
              </p>
            </>
          )}
        </ResultPanel>

        <Reveal show={foodReady}>
          <MathDetails steps={food.steps} />
        </Reveal>
      </StepCard>
    </>
  );
}

/** Fades "Show the math" in when a result is ready, and out when it isn't */
function Reveal({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
