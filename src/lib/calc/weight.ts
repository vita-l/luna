/*
  WEIGHT UNITS: switching lb ↔ kg changes the number in the box too.
  Switching straight back gives the exact number the user typed (25, not 24.99).
*/
import { fmt, parseNumber, round } from "./numbers";
import type { Unit } from "./types";

export interface LastConversion {
  /** What the user typed before the switch */
  typed: string;
  /** The unit it was typed in */
  from: Unit;
  /** What we put in the box after the switch */
  shown: string;
}

export interface ConversionNote {
  kind: "toKg" | "toLb";
  vars: { lb: string; kg: string; factor: string };
}

export interface ConversionResult {
  text: string;
  last: LastConversion | null;
  note: ConversionNote | null;
}

export function convertWeight(args: {
  text: string;
  from: Unit;
  to: Unit;
  lbPerKg: number;
  last: LastConversion | null;
}): ConversionResult {
  const { text, from, to, lbPerKg, last } = args;
  const w = parseNumber(text);
  if (from === to || w === null || Number.isNaN(w) || w <= 0) {
    return { text, last, note: null };
  }

  // Switching straight back: give back the exact number the user typed
  if (last && last.from === to && last.shown === text) {
    return { text: last.typed, last: null, note: null };
  }

  const value = round(to === "kg" ? w / lbPerKg : w * lbPerKg, 2);
  const shown = String(value);
  const factor = String(lbPerKg);
  const note: ConversionNote =
    to === "kg"
      ? { kind: "toKg", vars: { lb: fmt(w, 2), kg: fmt(value, 2), factor } }
      : { kind: "toLb", vars: { kg: fmt(w, 2), lb: fmt(value, 2), factor } };
  return { text: shown, last: { typed: text, from, shown }, note };
}
