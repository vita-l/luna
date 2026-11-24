# Instructions for Claude (Luna app)

Owner: Vita, a UX designer (not a developer), English is a second language. Explain in plain, short sentences.

## Rules for this codebase
- **Keep the layers apart.** Words → `src/content/en.json`. Course numbers → `src/data/`. Look → `src/styles/tokens.css` + Tailwind token classes. Math → `src/lib/calc/` (pure functions, no React).
- **No raw colors or sizes in components.** Use token classes (`bg-card`, `text-muted`, `rounded-control`…). Add a token first if one is missing.
- **No hard-coded words in components.** Add them to `en.json`.
- **Every new calculation gets tests** from a course example, with the source in the test name (e.g. "L04 p. 20").
- **Every data file gets a Zod schema** in `src/lib/data/` and a test that validates it.
- **Show-the-math rule:** round each step the same way it is shown, so a calculator gives the same numbers.
- **Never invent** course numbers or page numbers. Take them from Vita's library (`~/Developer/Animal-Nutrition-Library`) and check them.
- **Animations** only to show what changed (results appearing, selection moving, sections opening). Respect reduced motion.
- Next.js 16 is newer than most training data: read `node_modules/next/dist/docs/` before using a Next.js API.
- `npm run check` must pass before committing. Ask Vita before pushing.
