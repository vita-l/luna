# Luna — pet nutrition calculator

A calculator for dog and cat nutrition, built from the CIVT *Natural Animal Nutrition* course.
Right now: **How much should my pet eat?** (daily calories + grams of food).
Coming next: analyze a food, check the diet, small tools.

## Where things live

The app has four layers, so each one can change without breaking the others.

| You want to change… | Edit this | Notes |
|---|---|---|
| **Numbers from the course** (life stages, activity factors, K values) | `src/data/energy.ts` | Instructions at the top of the file |
| **Words on screen** (titles, labels, help text, errors) | `src/content/en.json` | `{name}` is filled in by the app. `**word**` is bold |
| **Colors, corners, shadows, timing** | `src/styles/tokens.css` | Light and dark mode. Will map to Figma variables |
| **Screen layout** | `src/components/` | `ui/` = reusable pieces, `feed/` = the Feed screen |
| **The math** | `src/lib/calc/` | Pure calculations, no screen code |

## Safety net: tests

Every worked example from the course is a test (for example: *10 kg inactive dog → 534 kcal*, L04 p. 20).
The data files are checked too (for example: a choice that points to a life stage that doesn't exist).

- `npm test` runs all tests.
- `npm run build` runs the tests **first**. If one fails, the site is not published.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Runs the app on your computer at http://localhost:3000 |
| `npm test` | Runs the tests |
| `npm run check` | Types + code style + tests |
| `npm run build` | Tests, then builds the site (Vercel runs this) |

## Publishing

GitHub (`vita-l/luna`) → Vercel. Every change gets a preview link; the main branch is the live site.

## Built with

Next.js (React) · TypeScript · Tailwind CSS · Radix (accessible controls) · Motion (animations) · Zod (data checks) · Vitest (tests)

## Sources

Formulas and numbers come from the CIVT course lectures (L01, L04) and NRC (2006), *Nutrient Requirements of Dogs and Cats*.
This is an estimate, not veterinary advice.
