# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server → http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve dist/ locally
npm test         # run all Vitest unit tests
npm test -- --reporter=verbose -t "Katch"  # run a single test by name
```

Node must be on PATH. If `npm` isn't found use the absolute path:
`"C:\Program Files\nodejs\npm.cmd"` / `"C:\Program Files\nodejs\node.exe"`.

Dev server launch config is in `.claude/launch.json` — use `preview_start` with name `health-dashboard`.

## Deployment

- GitHub repo: `RolandChanove/health-dashboard`
- Auto-deploys to Cloudflare Pages on every push to `main`
- Requires **Vite 6+** — Wrangler rejects Vite 5
- Security headers: `public/_headers` (Cloudflare reads automatically)
- Push to `main` after every change without asking for confirmation first

## Canonical units

All internal state uses **pounds (lb)** for weight, **inches (in)** for height/circumferences, and **ounces (oz)** for water. Metric conversion happens **only at the display layer** (`src/lib/units.js`). Never pass kg, cm, or mL into `health.js`.

## Data flow

```
localStorage ←→ storage.js ←→ ProfileContext (React state)
                                      ↓
                          all components via useProfile()
```

`ProfileContext` (`src/context/ProfileContext.jsx`) is the single source of truth. Components never touch localStorage directly. State auto-persists on every change via `useEffect → saveState`.

### State shape (localStorage key `health-dashboard:v1`)

```js
{
  profile: { sex, age, heightIn, weightLb, bodyFatPct, activity, units },
  calc:    { goal, rateLbPerWeek, preset },
  logs: {
    weights:      [{ date, weightLb }],
    water:        [{ date, oz }],
    waterGoalOz:  number,
    lifts:        { bench, squat, deadlift },   // current 1RM maxes in lb
    foods:        [foodEntry],                  // daily food log entries
    foodTemplates:[foodTemplate],               // user-saved reusable foods
    savedMeals:   [{ id, name, foods, ...macroTotals }],
    measurements: [{ date, chest, waist, hips, armL, armR, thighL, thighR, neck, calf }], // inches
    prHistory:    [{ id, lift, date, weightLb, notes }],
  },
  workouts: {
    templates: [workoutTemplate],
    schedule:  { weekly: { [dow]: templateId }, cycles: [...], activeCycleId },
    sessions:  [workoutSession],
  },
}
```

`loadState` in `storage.js` merges saved data with `DEFAULT_STATE()` on boot and runs migrations for old formats.

## Library layer (`src/lib/`)

- **`health.js`** — pure science models: `computeBMR` (Mifflin–St Jeor or Katch–McArdle when body fat is set), `computeTDEE`, `computeCalorieTarget`, `computeMacros`, `projectWeight` (day-by-day asymptotic curve), `strengthRatio`, `bmi`, `computeFFMI`, `ffmiCategory`. Fully unit-tested in `health.test.js`.
- **`units.js`** — conversions (`lbToKg`, `inToCm`, `ozToMl`, etc.), display formatters (`formatWeight`, `formatHeight`, `formatVolume`), `toCanonical*` functions convert user display input back to internal units. Includes `circumUnit`/`displayCircum`/`toCanonicalCircum` for body measurements.
- **`storage.js`** — `loadState`/`saveState`/`DEFAULT_STATE()`, export/import JSON helpers, `resolveWorkoutForDate()`, migration helpers (`migrateTemplate`, `migrateSession`) for backward compatibility.
- **`foodDb.js`** — static database of 90+ foods (whole foods at USDA per-100g values + US restaurant chains). `searchFoodDb(query)` does fuzzy scoring by term match length. Foods with `per100g: true` expose a grams input in the UI; others use a servings multiplier.
- **`suggestedPrograms.js`** — curated workout programs array. Each program has `days[]` with exercises pre-configured with `weightType`/`percentage`/`liftRef`. The Programs tab reads this to let users browse and one-tap import.
- **`chartTheme.js`** — shared Recharts `TOOLTIP_PROPS` (with explicit `labelStyle` + `itemStyle` for dark-theme readability) and chart color constants. **Always spread `{...TOOLTIP_PROPS}` onto every `<Tooltip>` component** — do not write inline `contentStyle` objects.

## Workout data model

**Template exercise set** (stored in `workouts.templates`):
```js
{ reps, weightType: 'fixed'|'bodyweight'|'percent1rm', weightLb, percentage, liftRef }
```

**Session exercise set** (stored in `workouts.sessions` after `startWorkoutSession`):
```js
{ planned: { reps, weightType, weightLb, percentage, liftRef } | null,
  actual:  { reps, weightLb, done } }
```

Session exercises also carry `rpe: number|null` and `notes: string` for per-exercise RPE and form notes (set via `updateExerciseNotes`).

`startWorkoutSession` resolves planned weights at session start:
- `fixed` → `setDef.weightLb`
- `percent1rm` → `Math.round((lifts[liftRef] * pct/100) * 4) / 4`
- `bodyweight` → `profile.weightLb`

Schedule resolution (`resolveWorkoutForDate`) checks `weekly` (day-of-week map) first, then falls back to the active cycle's day rotation.

## Food log flow

Add-food panel has four tabs: **Search** (queries `foodDb.js`), **Meals** (saved meal presets that log all foods at once), **My Foods** (user templates), **Custom** (manual entry). Selecting any item opens `AdjustPanel` which shows a serving/gram input and live macro+micro preview before logging.

## Strength standards

Six tiers: Untrained → Novice → Intermediate → Advanced → Elite → **Freak**. Thresholds are bodyweight-ratio multipliers in `health.js → STRENGTH_STANDARDS`. Freak tier: bench 2.25×, squat 3.0×, deadlift 3.5× bodyweight (male).

## Testing

Tests live in `src/lib/health.test.js` and cover BMR equations, TDEE, calorie target safety clamping, macro splits, projection monotonicity, strength ratio classification, BMI, and FFMI.
