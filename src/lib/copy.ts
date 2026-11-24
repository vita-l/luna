/*
  COPY: all words on screen come from src/content/en.json.
  - copy.feed.title          → read a text directly
  - fill(text, { lb: "22" }) → replace {lb} in a text with a value
*/
import en from "@/content/en.json";

export const copy = en;
export type Copy = typeof en;

/** Replace {name} placeholders with values. Unknown placeholders stay as they are. */
export function fill(text: string, vars: Record<string, string | number> = {}): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
