# Health Dashboard

A personal, offline-first health dashboard with interactive charts, a science-based
calorie/macro calculator, and strength-ratio analysis. Built with **React + Vite +
Recharts + Tailwind CSS**. All data is stored locally in your browser — no account,
no server, fully private.

## Features

| Area | What it does |
| --- | --- |
| **Weight over time** | Interactive line chart of logged weight with zoom/brush, plus an optional **dynamic weight-loss projection** overlay. |
| **Water intake** | Daily bar chart with a goal line, today's progress ring, and quick-add buttons. |
| **Stats summary** | Cards for weight, height, BMI, body-fat %, lean/fat mass, BMR & TDEE, plus a radar overview. |
| **Calorie & macro calculator** | Computes maintenance calories and a goal-adjusted target, then splits it into Protein / Carbs / Fat with a macro donut. |
| **Micronutrient reference** | Daily reference targets (fiber, sodium, potassium, etc.), sex-aware. |
| **Strength ratios** | Bench / squat / deadlift ÷ bodyweight, classified Untrained → Elite (sex-aware). |
| **Units & data** | Toggle imperial ⇄ metric; export/import your data as JSON; reset to samples. |

## Running it

Requires **Node.js** (v18+).

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build into dist/
npm test         # run the model unit tests (Vitest)
```

## The models (why these equations)

**Basal Metabolic Rate (BMR)**
- **Mifflin–St Jeor** by default — the most accurate predictive BMR equation for the
  general population:
  - Men: `10·kg + 6.25·cm − 5·age + 5`
  - Women: `10·kg + 6.25·cm − 5·age − 161`
- **Katch–McArdle** when you enter a body-fat % — based on lean body mass, more accurate
  for lean/athletic users: `370 + 21.6·LBM(kg)`.

**TDEE (maintenance calories)** = BMR × activity factor (1.2 sedentary → 1.9 athlete).

**Calorie target** applies a deficit/surplus from your goal rate using ~3500 kcal per lb of
fat, with safety guards: the rate is capped at ~1%/week of bodyweight and intake never drops
below a safe floor (1500 kcal men / 1200 kcal women).

**Weight-loss projection** is *not* a naive straight line. It simulates body weight
day-by-day, recomputing BMR/TDEE as your weight changes — so the deficit shrinks and the
curve flattens toward a maintenance plateau. This mirrors the adaptive behaviour of the
NIH Body Weight Planner / Hall energy-balance model in a simple, transparent form.

**Macros** — protein scales with bodyweight (preset-dependent, ~0.8–1.0 g/lb), fat is a
percentage of calories (with a healthy floor), and carbohydrates fill the remainder.
Energy: protein/carbs 4 kcal/g, fat 9 kcal/g.

**Strength levels** use bodyweight-ratio thresholds per lift, adjusted by sex, based on
common strength-standard tables.

All formulas live in [`src/lib/health.js`](src/lib/health.js) as pure functions and are
covered by tests in [`src/lib/health.test.js`](src/lib/health.test.js).

## Project structure

```
src/
  lib/        health.js (models) · units.js (conversions) · storage.js (persistence)
  context/    ProfileContext.jsx  (shared state, auto-persisted to localStorage)
  components/ ProfilePanel, StatsSummary, WeightChart, WaterChart,
              CalorieCalculator, MicronutrientPanel, StrengthRatios, ui/
  App.jsx     layout, tabs, units toggle, export/import
```

## Notes

Estimates are for general guidance only and are **not medical advice**. Consult a
qualified professional before making significant changes to diet or exercise.
