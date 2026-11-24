"use client";

/*
  ANALYZE A FOOD
  Inputs: the label (guaranteed analysis), extra nutrients, and what to compare with.
  Results: carbohydrate, energy, energy shares, dry matter, per 1000 kcal, AAFCO standard energy, Ca:P.

  words → src/content/en.json (food) + tips.json · numbers → src/data (food-guides, nutrients, standards)
  math → src/lib/calc/food-analysis.ts · look → src/components/ui
*/
import { X } from "lucide-react";
import { useId } from "react";

import { foodGuides } from "@/data/food-guides";
import { nutrients } from "@/data/nutrients";
import {
  densityDigits,
  inRange,
  type FoodForm,
  type FoodType,
  type StandardVerdict,
} from "@/lib/calc/food-analysis";
import { fmt, fmt1 } from "@/lib/calc/numbers";
import { copy, fill } from "@/lib/copy";
import type { LevelName } from "@/lib/data/food-guides-schema";
import { labelUnit } from "@/lib/data/nutrients-schema";
import { defaultProfileId, defaultSharesId, useFoodState } from "@/lib/state/food-state";
import { analyzeFood, basicKeys, nutrientByKey } from "@/lib/calc/analyze-food";

import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Field, FieldLabel, Message } from "@/components/ui/field";
import { InfoTip } from "@/components/ui/info-tip";
import { NumberField } from "@/components/ui/number-field";
import { ResultCard, ResultRow } from "@/components/ui/result-card";
import { Segmented } from "@/components/ui/segmented";
import { SelectField, TextField } from "@/components/ui/select-field";
import { StepCard } from "@/components/ui/step-card";

const t = copy.food;
const byKey = nutrientByKey;

export function FoodScreen() {
  const { state, update } = useFoodState();
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const { type, form, texts, added, species } = state;

  // ---------- All the math (shared with the Check screen) ----------
  const {
    values, invalid, labelKcal, labelKcalInvalid,
    standard, profile, sharesGuide, levelTable,
    carb, est, kcalUsed, shares, gItems, dm,
    densityRows, densitySteps, aafcoStandard, aafcoRows,
    ratio, caPGuide, calorieLevels, showLight,
  } = analyzeFood(state, t.results.carb);

  // ---------- Missing inputs ----------
  const missing = (keys: string[]) => {
    const names = keys.filter((k) => values[k] == null).map((k) => t.input[k as keyof typeof t.input] ?? k);
    return names.length ? fill(t.results.needs, { list: names.join(", ") }) : null;
  };
  const needsCarb = missing([...basicKeys]);
  const needsEnergy = needsCarb ?? (carb?.overHundred ? t.results.carbOver : null);
  const needsDensity = needsEnergy && !labelKcal ? needsEnergy : densityRows.length ? null : missing(["protein", "fat", "fibre"]);

  // ---------- Actions ----------
  // Always start from the latest values, so quick changes (or autofill) never undo each other
  const setText = (key: string, value: string) => update((s) => ({ texts: { ...s.texts, [key]: value } }));
  const addNutrient = (key: string) =>
    key && update((s) => (s.added.includes(key) ? {} : { added: [...s.added, key] }));
  const removeNutrient = (key: string) =>
    update((s) => {
      const rest = { ...s.texts };
      delete rest[key];
      return { added: s.added.filter((k) => k !== key), texts: rest };
    });
  const changeSpecies = (next: "dog" | "cat") =>
    update((s) => ({
      species: next,
      profileId: defaultProfileId(s.standardId, next),
      sharesId: defaultSharesId(next),
      // Taurine is only for cats
      added: next === "dog" ? s.added.filter((k) => byKey.get(k)?.species !== "cat") : s.added,
    }));

  const addable = nutrients.filter((n) => !n.basic && !added.includes(n.key) && (!n.species || n.species === species));

  return (
    <>
      {/* ================= INPUT: the food ================= */}
      <StepCard step={1} id={id("food-title")} title={t.input.title} subtitle={t.input.subtitle}>
        <Field>
          <FieldLabel htmlFor={id("name")}>{t.input.name}</FieldLabel>
          <TextField id={id("name")} value={state.name} onChange={(v) => update({ name: v })} placeholder={t.input.namePlaceholder} />
        </Field>

        <Field>
          <FieldLabel id={id("type")}>{t.input.type}</FieldLabel>
          <Segmented<FoodType>
            labelledBy={id("type")}
            value={type}
            onValueChange={(v) => update({ type: v })}
            options={[
              { value: "commercial", label: t.input.commercial, sub: t.input.commercialSub },
              { value: "homePrepared", label: t.input.homePrepared, sub: t.input.homePreparedSub },
            ]}
          />
        </Field>

        <Field>
          <FieldLabel id={id("form")}>{t.input.form}</FieldLabel>
          <Segmented<FoodForm>
            labelledBy={id("form")}
            value={form}
            onValueChange={(v) => update({ form: v })}
            options={[
              { value: "dry", label: t.input.dry },
              { value: "moist", label: t.input.moist },
            ]}
          />
        </Field>

        <div className="mb-2 flex items-center gap-1">
          <span className="font-semibold">{t.input.ga}</span>
          <InfoTip tip="guaranteedAnalysis" />
        </div>
        <div className="grid grid-cols-2 gap-x-3">
          {basicKeys.map((key) => (
            <Field key={key} className="mb-4">
              <div className="mb-2 flex items-center gap-1">
                <label htmlFor={id(key)} className="font-semibold">
                  {t.input[key]}
                </label>
                {key === "ash" && <InfoTip tip="ash" />}
              </div>
              <NumberField
                id={id(key)}
                value={texts[key] ?? ""}
                onChange={(v) => setText(key, v)}
                suffix="%"
                invalid={invalid.has(key)}
                placeholder="0"
              />
              {invalid.has(key) && <Message tone="error">{t.input.numberError}</Message>}
            </Field>
          ))}
        </div>
        {values.ash == null && (
          <Message>{fill(t.input.ashHelp, { dry: foodGuides.typicalAsh.dry, wet: foodGuides.typicalAsh.wet })}</Message>
        )}

        <Field className="mt-4">
          <FieldLabel htmlFor={id("kcal")}>{t.input.labelEnergy}</FieldLabel>
          <NumberField
            id={id("kcal")}
            value={state.labelKcalText}
            onChange={(v) => update({ labelKcalText: v })}
            suffix="kcal/kg"
            placeholder="e.g. 3500"
            invalid={labelKcalInvalid}
          />
          <Message>{t.input.labelEnergyHelp}</Message>
        </Field>

        {/* Extra nutrients */}
        {added.map((key) => {
          const n = byKey.get(key);
          if (!n) return null;
          return (
            <Field key={key} className="mb-3">
              <FieldLabel htmlFor={id(key)}>{n.label}</FieldLabel>
              <div className="flex gap-2">
                <div className="flex-1">
                  <NumberField
                    id={id(key)}
                    value={texts[key] ?? ""}
                    onChange={(v) => setText(key, v)}
                    suffix={labelUnit[n.unit]}
                    invalid={invalid.has(key)}
                    placeholder="0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeNutrient(key)}
                  aria-label={fill(t.input.remove, { name: n.label })}
                  className="grid size-[54px] flex-none cursor-pointer place-items-center rounded-control border-[1.5px] border-line text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              </div>
              {invalid.has(key) && <Message tone="error">{t.input.numberError}</Message>}
            </Field>
          );
        })}
        {addable.length > 0 && (
          <Field className="mb-0">
            <label htmlFor={id("add")} className="sr-only">
              {t.input.add}
            </label>
            <SelectField
              id={id("add")}
              value=""
              onChange={addNutrient}
              placeholder={t.input.addPlaceholder}
              options={addable.map((n) => ({ value: n.key, label: `${n.label} (${labelUnit[n.unit]})` }))}
            />
            <Message>{t.input.addHelp}</Message>
          </Field>
        )}
      </StepCard>

      {/* ================= INPUT: compare with ================= */}
      <StepCard step={2} id={id("compare-title")} title={t.compare.title} subtitle={t.compare.subtitle}>
        <Field>
          <FieldLabel id={id("animal")}>{t.compare.animal}</FieldLabel>
          <Segmented<"dog" | "cat">
            labelledBy={id("animal")}
            value={species}
            onValueChange={changeSpecies}
            options={[
              { value: "dog", label: copy.feed.step1.dog },
              { value: "cat", label: copy.feed.step1.cat },
            ]}
          />
        </Field>
        <Field>
          <div className="mb-2 flex items-center gap-1">
            <label htmlFor={id("profile")} className="font-semibold">
              {t.compare.profile}
            </label>
            <InfoTip tip="fediaf" />
          </div>
          <SelectField
            id={id("profile")}
            value={state.profileId}
            onChange={(v) => update({ profileId: v })}
            options={standard.profiles.filter((p) => p.species === species).map((p) => ({ value: p.id, label: p.label }))}
          />
          <Message>{t.compare.standardNote}</Message>
        </Field>
        <Field className="mb-0">
          <div className="mb-2 flex items-center gap-1">
            <label htmlFor={id("shares")} className="font-semibold">
              {t.compare.shares}
            </label>
            <InfoTip tip="energyShares" />
          </div>
          <SelectField
            id={id("shares")}
            value={state.sharesId}
            onChange={(v) => update({ sharesId: v })}
            options={foodGuides.energyShares.filter((g) => g.species === species).map((g) => ({ value: g.id, label: g.label }))}
          />
        </Field>
      </StepCard>

      {/* ================= RESULTS ================= */}
      <h2 className="mt-6 mb-3 text-[20px] font-bold">
        {t.results.title}
        {state.name && <span className="font-normal text-muted"> · {state.name}</span>}
      </h2>

      <ResultCard title={t.results.carb} tip="nfe" needs={needsCarb} steps={carb?.steps}>
        {carb && (
          <>
            <BigValue value={`${fmt(carb.nfe, 2)} %`} />
            {carb.overHundred && <Message tone="warn">{t.results.carbOver}</Message>}
          </>
        )}
      </ResultCard>

      <ResultCard title={t.results.energy} tip="atwater" needs={needsEnergy && !labelKcal ? needsEnergy : null} steps={est?.steps}>
        {est && (
          <>
            <p className="mb-1 text-[15px] text-muted">
              {fill(t.results.energyEstimate, { factors: type === "commercial" ? t.results.factorsCommercial : t.results.factorsHome })}
            </p>
            <ResultRow label={t.results.per100g} value={fmt(est.per100g, 2)} />
            <ResultRow label={t.results.perKg} value={fmt(est.perKg, 1)} />
            <ResultRow label={t.results.perLb} value={fmt(est.perLb, 1)} />
          </>
        )}
        {labelKcal && <ResultRow label={`${t.results.fromLabel} (${t.results.perKg})`} value={fmt(labelKcal, 1)} />}
        <p className="mt-2 text-[15px] text-muted">{labelKcal ? t.results.usedLabel : t.results.usedEstimate}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {calorieLevels.length > 0 && <LevelBadge levels={calorieLevels} />}
          {showLight && (
            <>
              <Badge tone={kcalUsed! <= foodGuides.lightMax.kcalPerKg ? "good" : "neutral"}>
                {kcalUsed! <= foodGuides.lightMax.kcalPerKg ? t.results.lightYes : t.results.lightNo}
              </Badge>
              <InfoTip tip="light" />
            </>
          )}
        </div>
      </ResultCard>

      <ResultCard title={t.results.shares} tip="caloricDistribution" needs={needsEnergy} steps={shares?.steps}>
        {shares && (
          <>
            {(["protein", "fat", "carbohydrate"] as const).map((k) => {
              const label = k === "protein" ? t.results.sharesProtein : k === "fat" ? t.results.sharesFat : t.results.sharesCarb;
              const range = sharesGuide?.[k];
              const v = shares.verdict?.[k];
              return (
                <ResultRow key={k} label={label} value={`${fmt1(shares[k])} %`}>
                  {range && v && (
                    <Badge tone={v === "inside" ? "good" : "warn"}>
                      {t.judge[v]} {range[0] === 0 ? fill(t.results.rangeUnder, { hi: range[1] }) : fill(t.results.range, { lo: range[0], hi: range[1] })}
                    </Badge>
                  )}
                </ResultRow>
              );
            })}
            {shares.verdict && sharesGuide && (
              <div className="mt-2">
                <Badge tone={shares.verdict.fits ? "good" : "warn"}>
                  {fill(shares.verdict.fits ? t.results.sharesFits : t.results.sharesNotFit, { label: sharesGuide.label })}
                </Badge>
              </div>
            )}
          </>
        )}
      </ResultCard>

      <ResultCard title={t.results.dm} tip="dryMatter" needs={missing(["moisture"])} steps={dm?.steps}>
        {dm && (
          <>
            <ResultRow label={t.results.dmValue} value={`${fmt(dm.dm, 2)} %`} />
            {gItems
              .filter((g) => dm.percentDM[g.key] !== undefined)
              .map((g) => (
                <ResultRow key={g.key} label={g.label} value={`${fmt1(dm.percentDM[g.key])} % DM`} />
              ))}
            {dm.kcalPerKgDM !== null && <ResultRow label="kcal/kg DM" value={fmt(dm.kcalPerKgDM)} />}
            {dm.energyOutsideRange && (
              <Message tone="warn">
                {fill(t.results.dmEnergyWarn, {
                  kcal: fmt(dm.kcalPerKgDM!),
                  min: fmt(foodGuides.dmEnergyRange.min),
                  max: fmt(foodGuides.dmEnergyRange.max),
                })}
              </Message>
            )}
          </>
        )}
      </ResultCard>

      <ResultCard title={t.results.density} tip="nutrientDensity" needs={needsDensity} steps={densitySteps}>
        {densityRows.map((r) => (
          <ResultRow key={r.n.key} label={r.n.label} value={`${fmt(r.per, densityDigits(r.per))} ${r.n.unit}`}>
            {r.hasLevels && <LevelBadge levels={r.levels} />}
            <StandardBadge verdict={r.verdict} />
          </ResultRow>
        ))}
        {densityRows.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1 text-sm text-muted">
            <span>{levelTable.source}</span>
            <InfoTip tip="levels" />
            <span>· {profile?.source}</span>
          </div>
        )}
        {added.length === 0 && <p className="mt-2 text-[15px] text-muted">{t.results.densityEmpty}</p>}
      </ResultCard>

      <ResultCard
        title={t.results.aafco}
        tip="aafco"
        needs={aafcoRows.length ? null : needsDensity ?? missing(["protein"])}
        steps={
          aafcoRows.length
            ? [
                {
                  id: "aafco",
                  titleVars: { standard: fmt(aafcoStandard) },
                  lines: aafcoRows.map((r) => ({
                    name: r.label,
                    value: fmt(r.value, 2),
                    kcal: fmt(kcalUsed!, 1),
                    standard: fmt(aafcoStandard),
                    result: fmt(r.result, 1),
                  })),
                },
              ]
            : []
        }
      >
        <p className="mb-1 text-[15px] text-muted">
          {fill(t.results.aafcoSub, { standard: fmt(aafcoStandard), form: form === "dry" ? t.input.dry.toLowerCase() : t.input.moist.toLowerCase() })}
        </p>
        {aafcoRows.map((r) => (
          <ResultRow key={r.key} label={r.label} value={`${fmt(r.result, 1)} %`} />
        ))}
      </ResultCard>

      <ResultCard
        title={t.results.caP}
        tip="caP"
        needs={ratio === null ? t.results.caPNeeds : null}
        steps={
          ratio !== null
            ? [{ id: "caP", lines: [{ ca: fmt(values.calcium!, 3), p: fmt(values.phosphorus!, 3), ratio: fmt(ratio, 2) }] }]
            : []
        }
      >
        {ratio !== null && (
          <>
            <BigValue value={`${fmt(ratio, 2)} : 1`} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <RangeBadge value={ratio} min={caPGuide.min} max={caPGuide.max} label={caPGuide.label} />
              {profile?.caP && <RangeBadge value={ratio} min={profile.caP.min} max={profile.caP.max} label={standard.name} />}
            </div>
          </>
        )}
      </ResultCard>
    </>
  );
}

// ---------- Small pieces ----------

function BigValue({ value }: { value: string }) {
  return <p className="text-[32px] leading-tight font-[750] tracking-[-0.02em] tabular-nums">{value}</p>;
}

function LevelBadge({ levels }: { levels: LevelName[] }) {
  const j = copy.food.judge;
  if (levels.length === 0) return <Badge>{j.gap}</Badge>;
  const text = levels.length === 2 && levels[0] === "low" && levels[1] === "medium" ? j.lowOrMedium : levels.map((l) => j[l]).join(" / ");
  const tone: BadgeTone = levels.includes("medium") ? "good" : "neutral";
  return <Badge tone={tone}>{text}</Badge>;
}

function StandardBadge({ verdict }: { verdict: StandardVerdict }) {
  const j = copy.food.judge;
  switch (verdict.kind) {
    case "belowMin":
      return <Badge tone="warn">{fill(j.belowMin, { min: fmt(verdict.min, 2) })}</Badge>;
    case "aboveMax":
      return <Badge tone="warn">{fill(j.aboveMax, { max: fmt(verdict.max, 2) })}</Badge>;
    case "aboveLegal":
      return <Badge tone="warn">{j.aboveLegal}</Badge>;
    case "ok":
      return <Badge tone="good">{j.ok}</Badge>;
    case "check":
      return <Badge tone="warn">{j.check}: {verdict.note}</Badge>;
    default:
      return null;
  }
}

function RangeBadge({ value, min, max, label }: { value: number; min: number; max: number; label: string }) {
  const j = copy.food.judge;
  const inside = inRange(value, [min, max]) === "inside";
  return <Badge tone={inside ? "good" : "warn"}>{fill(inside ? j.caPInRange : j.caPOut, { label, min, max })}</Badge>;
}

