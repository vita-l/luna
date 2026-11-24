/*
  SAVING ON THE DEVICE
  For now, the pet and food are saved in this browser only (no accounts).
  Later, accounts can replace these two functions without changing the screens.
*/
import type { z } from "zod";

const PREFIX = "luna:";

/** Read a saved value. Returns null when nothing is saved, or the saved value is old or broken. */
export function loadSaved<T>(key: string, schema: z.ZodType<T>): T | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null; // private mode, blocked storage, or broken JSON
  }
}

export function save(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked. The app still works, it just won't remember.
  }
}
