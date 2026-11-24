"use client";

/*
  CHECK THE DIET: the pet (from Feed) and the food (from Food) together.
  Daily amount, nutrients per day (eaten vs needed), water per day.

  words → src/content/en.json (check) · numbers → src/data · math → src/lib/calc/diet-check.ts
*/
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useId } from "react";

import { energyData } from "@/data/energy";
import { foodGuides } from "@/data/food-guides";
import { analyzeFood } from "@/lib/calc/analyze-food";
import {
  cupsPerDay,
  eatenPerDay,
  eatenStep,
  isEnough,
  metabolicWeight,
  neededPerDay,
  neededStep,
  waterFromFood,
  waterNeed,
  waterToDrink,
  type Enough,
} from "@/lib/calc/diet-check";
import { calcEnergy } from "@/lib/calc/energy";
import { densityDigits } from "@/lib/calc/food-analysis";
import { calcFood } from "@/lib/calc/food";
import { fmt, fmtPair, fmtPower, parseNumber } from "@/lib/calc/numbers";
import type { MathStep } from "@/lib/calc/types";
import { copy, fill } from "@/lib/copy";
import { selectionFor } from "@/lib/data/energy-select";
import { useFeedState } from "@/lib/state/feed-state";
import { useFoodState } from "@/lib/state/food-state";

import { Badge } from "@/components/ui/badge";
import { Message } from "@/components/ui/field";
import { InfoTip } from "@/components/ui/info-tip";
import { NumberField } from "@/components/ui/number-field";
import { ResultCard, ResultRow } from "@/components/ui/result-card";
import { BigNumber } from "@/components/ui/result-panel";

const t = copy.check;
const data = energyData;

export function CheckScreen() {
  const uid = useId();
  const feed = useFeedState().state;
  const { state: food, update: updateFood } = useFoodState();

  // ---------- The pet (same math as Feed) ----------
  const { stage, choice, kChoice } = selectionFor(data, feed);
  const energy = calcEnergy({
    data, species: feed.species, method: feed.method, unit: feed.unit, weightText: feed.weightText,
    lastConversion: feed.lastConversion, choice, kChoice,
  });
  const kcal = energy.kcal;
  const petReady = kcal !== null && energy.kg !== null;
  const animalName = (s: "dog" | "cat") => (s === "dog" ? copy.feed.step1.dogName : copy.feed.step1.catName);
  const petLabel = [animalName(feed.species), feed.method === "k" ? kChoice?.label : stage?.label, feed.method === "k" ? null : choice?.label !== stage?.label ? choice?.label : null, energy.weightLabel]
    .filter(Boolean)
    .join(" · ");
  // The needs per kg metabolic weight are for adult maintenance (method 2 is only for adults)
  const isAdult = feed.method === "k" || stage?.id === "adult" || stage?.id === "senior";

  // ---------- The food (same math as Food) ----------
  const a = analyzeFood(food, copy.food.results.carb);
  const kcalPerKg = a.kcalUsed;
  const foodReady = kcalPerKg !== null;
  const foodName = food.name || t.summary.unnamed;
  const mismatch = food.species !== feed.species;

  // ---------- Daily amount ----------
  const amount = petReady && foodReady ? calcFood({ kcal, range: energy.range, densityText: String(kcalPerKg), meals: 1 }) : null;
  const grams = amount?.grams ?? null;
  const perCupRaw = parseNumber(food.kcalPerCupText);
  const perCup = perCupRaw !== null && !Number.isNaN(perCupRaw) && perCupRaw > 0 ? perCupRaw : null;
  const cups = petReady && perCup ? cupsPerDay(kcal!, perCup) : null;

  // ---------- Nutrients per day ----------
  const power = data.settings.rer[feed.species].power;
  const mbw = energy.kg !== null ? metabolicWeight(energy.kg, power) : null;
  const perMbw = a.standard.perMetabolicWeight?.[feed.species];
  const rows =
    petReady && foodReady
      ? a.densityRows.map((r) => {
          const eaten = eatenPerDay(r.per, kcal!);
          const need = isAdult && mbw && perMbw?.[r.n.key] !== undefined ? neededPerDay(perMbw[r.n.key], mbw.mbw, food.form === "moist") : null;
          return { r, eaten, need, enough: need !== null ? isEnough(eaten, need) : null };
        })
      : [];
  const nutrientSteps: MathStep[] = [];
  if (rows.length && kcal) {
    nutrientSteps.push(eatenStep(rows.map((x) => ({ name: x.r.n.label, unit: x.r.n.unit, per1000: x.r.per, eaten: x.eaten })), kcal));
    const withNeed = rows.filter((x) => x.need !== null);
    if (withNeed.length && mbw && perMbw) {
      nutrientSteps.push(mbw.step);
      nutrientSteps.push(
        neededStep(
          withNeed.map((x) => {
            const v = perMbw[x.r.n.key];
            return { name: x.r.n.label, unit: x.r.n.unit, perMbw: typeof v === "number" ? v : food.form === "moist" ? v.wet : v.dry, needed: x.need! };
          }),
          mbw.mbw,
          power,
        ),
      );
    }
  }

  // ---------- Water per day ----------
  const water = petReady ? waterNeed(feed.species, energy.kg!, kcal!, foodGuides) : [];
  const moisture = a.values.moisture;
  const fromFood = grams && moisture != null ? waterFromFood(moisture, grams) : null;

  const pairText = (p: [number, number], digits = 0) => fmtPair(p, digits);
  const notReady = !petReady ? t.summary.petMissing : !foodReady ? t.summary.foodMissing : null;

  return (
    <>
      {/* ================= Summary ================= */}
      <section className="mb-4 rounded-card border border-line bg-card px-4 py-4 shadow-card">
        <h2 className="mb-1 text-[17px] font-bold">{t.summary.title}</h2>
        <SummaryRow
          label={t.summary.pet}
          href="/feed"
          text={petReady ? `${petLabel} → ${fill(t.summary.kcalDay, { kcal: fmtPair(kcal!) })}` : t.summary.petMissing}
          muted={!petReady}
        />
        <SummaryRow
          label={t.summary.food}
          href="/food"
          text={
            foodReady
              ? `${foodName} · ${fill(t.summary.foodEnergy, { kcal: fmt(kcalPerKg!, 1), source: a.labelKcal ? t.summary.fromLabel : t.summary.estimate })}`
              : t.summary.foodMissing
          }
          muted={!foodReady}
        />
        {mismatch && (
          <Message tone="warn">
            {fill(t.summary.speciesMismatch, { food: animalName(food.species).toLowerCase(), pet: animalName(feed.species).toLowerCase() })}
          </Message>
        )}
      </section>

      {/* ================= Daily amount ================= */}
      <ResultCard title={t.amount.title} needs={notReady} steps={[...(amount?.steps ?? []), ...(cups ? [cups.step] : [])]}>
        {grams && <BigNumber value={fmtPair(grams)} unit={t.amount.grams} small={energy.range} />}
        <div className="mt-4">
          <label htmlFor={`${uid}-cup`} className="mb-2 block font-semibold">
            {t.amount.cupLabel}
          </label>
          <NumberField
            id={`${uid}-cup`}
            value={food.kcalPerCupText}
            onChange={(v) => updateFood({ kcalPerCupText: v })}
            suffix="kcal/cup"
            placeholder="e.g. 425"
          />
          <Message>{t.amount.cupHelp}</Message>
        </div>
        {cups && (
          <>
            <ResultRow label={t.amount.cups} value={fmtPair(cups.cups, 2)} />
            <Message>{t.amount.cupsNote}</Message>
          </>
        )}
      </ResultCard>

      {/* ================= Nutrients per day ================= */}
      <ResultCard title={t.nutrients.title} tip="enough" needs={notReady} steps={nutrientSteps}>
        {rows.map(({ r, eaten, need, enough }) => (
          <ResultRow
            key={r.n.key}
            label={r.n.label}
            value={`${fill(t.nutrients.eats, { value: `${pairText(eaten, densityDigits(eaten[0]))} ${r.n.unit}` })}${need !== null ? ` · ${fill(t.nutrients.needs, { value: `${fmt(need, densityDigits(need))} ${r.n.unit}` })}` : ""}`}
          >
            {enough && <EnoughBadge enough={enough} />}
          </ResultRow>
        ))}
        {rows.length === 0 && <p className="text-[15px] text-muted">{t.nutrients.empty}</p>}
        {rows.length > 0 && !isAdult && <Message tone="note">{t.nutrients.adultsOnly}</Message>}
        {rows.length > 0 && isAdult && mbw && (
          <div className="mt-2 flex flex-wrap items-center gap-1 text-sm text-muted">
            <span>{fill(t.nutrients.mbw, { mbw: fmt(mbw.mbw, 3), power: fmtPower(power) })}</span>
            <InfoTip tip="metabolicWeight" />
            <span>· {a.standard.perMetabolicWeight?.source}</span>
          </div>
        )}
      </ResultCard>

      {/* ================= Water per day ================= */}
      <ResultCard
        title={t.water.title}
        tip="water"
        needs={petReady ? null : t.summary.petMissing}
        steps={[...water.map((w) => w.step), ...(fromFood ? [fromFood.step] : [])]}
      >
        {water.map((w) => {
          const name =
            w.id === "perKcal" ? t.water.perKcal
            : w.id === "perKg" ? t.water.perKg
            : fill(t.water.classic, { lo: foodGuides.water.classic[feed.species][0], hi: foodGuides.water.classic[feed.species][1] });
          const drink = fromFood ? waterToDrink(w.need, fromFood.water) : null;
          return (
            <div key={w.id} className="border-b border-line py-2.5 last:border-b-0">
              <p className="font-semibold">{name}</p>
              <p className="mb-1 text-sm text-muted">{w.source}</p>
              <div className="grid grid-cols-3 gap-2 text-[15px]">
                <WaterCell label={t.water.need} value={fill(t.water.ml, { value: pairText(w.need) })} />
                <WaterCell label={t.water.fromFood} value={fromFood ? fill(t.water.ml, { value: pairText(fromFood.water, 1) }) : "–"} />
                <WaterCell label={t.water.drink} value={drink ? fill(t.water.ml, { value: pairText(drink, 1) }) : "–"} strong />
              </div>
            </div>
          );
        })}
        {!fromFood && foodReady && <Message>{t.water.needsMoisture}</Message>}
        {feed.species === "dog" && <Message tone="warn">{t.water.check}</Message>}
      </ResultCard>
    </>
  );
}

function SummaryRow({ label, text, href, muted }: { label: string; text: string; href: string; muted?: boolean }) {
  return (
    <Link
      href={href}
      className="group -mx-2 flex items-center gap-3 rounded-control px-2 py-2.5 transition-colors hover:bg-track focus-visible:outline-2 focus-visible:outline-accent"
    >
      <span className="w-12 flex-none text-sm font-semibold text-muted">{label}</span>
      <span className={muted ? "flex-1 text-[15px] text-muted" : "flex-1 text-[15px]"}>{text}</span>
      <span className="flex items-center text-sm font-semibold text-accent">
        {t.summary.edit}
        <ChevronRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function WaterCell({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-sm text-muted">{label}</p>
      <p className={strong ? "font-bold tabular-nums" : "tabular-nums"}>{value}</p>
    </div>
  );
}

function EnoughBadge({ enough }: { enough: Enough }) {
  if (enough === "yes") return <Badge tone="good">{t.nutrients.enough}</Badge>;
  if (enough === "onlyHigh") return <Badge tone="warn">{t.nutrients.onlyHigh}</Badge>;
  return <Badge tone="warn">{t.nutrients.notEnough}</Badge>;
}
