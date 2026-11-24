/*
  NUMBER HELPERS: reading what people type, rounding, and showing numbers.
  Rule: every step is rounded the same way it is shown,
  so anyone can check the math with a calculator.
*/
import type { Factor } from "@/lib/data/energy-schema";

/**
 * Read a typed number. Accepts "4.5", "4,5" and "3,500".
 * Returns null when the box is empty, NaN when it is not a number.
 */
export function parseNumber(text: string | null | undefined): number | null {
  let s = String(text ?? "").trim().replace(/\s+/g, "");
  if (s === "") return null;
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, ""); // 3,500 → 3500
  else s = s.replace(",", "."); // 4,5 → 4.5
  if (!/^(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  return parseFloat(s);
}

export function round(n: number, digits: number): number {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}

/** 1234.5 → "1,234.5" (up to `digits` decimals, no extra zeros) */
export function fmt(n: number, digits = 0): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: digits });
}

/** Always one decimal: 433 → "433.0" */
export function fmt1(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** One number, or a range like "433–472" */
export function fmtPair(pair: readonly [number, number], digits = 0): string {
  return pair[0] === pair[1] ? fmt(pair[0], digits) : `${fmt(pair[0], digits)}–${fmt(pair[1], digits)}`;
}

// ---------- Activity factors: one number (1.6) or a range ([1.1, 1.2]) ----------

export function isRange(f: Factor): f is [number, number] {
  return Array.isArray(f);
}

export function factorPair(f: Factor): [number, number] {
  return isRange(f) ? [f[0], f[1]] : [f, f];
}

/** Factors always show at least one decimal, like the course: 1.0, 1.6, 2.5 */
export function fmtFactorValue(n: number): string {
  return Number.isInteger(n) ? n.toFixed(1) : String(n);
}

export function fmtFactor(f: Factor): string {
  return isRange(f) ? `${fmtFactorValue(f[0])}–${fmtFactorValue(f[1])}` : fmtFactorValue(f);
}

/** Powers show with two decimals, like the course: 0.75, 0.67, 0.40 */
export function fmtPower(p: number): string {
  return p.toFixed(2);
}
