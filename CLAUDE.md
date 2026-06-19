# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # start Vite dev server at http://localhost:5173
npm run build        # production build → dist/
npm run preview      # serve the dist/ build locally

# Tests
npm test             # run all Vitest unit tests
```

Node must be on PATH. If `npm` isn't found, use the absolute path:
`"C:\Program Files\nodejs\npm.cmd"` / `"C:\Program Files\nodejs\node.exe"`.

The dev server launch config lives in `.claude/launch.json` — use `preview_start` with name `health-dashboard` to open it in the preview panel.

## Architecture

### Canonical units
All internal state and library functions use **pounds (lb)** for weight, **inches (in)** for height, and **ounces (oz)** for water. Metric conversion happens only at the display layer (`src/lib/units.js`). Never pass kg or cm into `health.js`.

### Data flow
```
localStorage ←→ storage.js ←→ ProfileContext (React state)
                                      ↓
                              all components via useProfile()
```

`ProfileContext` (`src/context/ProfileContext.jsx`) is the single source of truth. It holds `profile`, `logs`, and `calc`, auto-persists to localStorage on every state change, and exposes mutation functions (`addWeight`, `addWater`, `setLift`, `setProfile`, etc.). Components never write to localStorage directly.

### Library layer (`src/lib/`)

- **`health.js`** — all science models as pure functions: `computeBMR`, `computeTDEE`, `computeCalorieTarget`, `computeMacros`, `projectWeight`, `strengthRatio`, `bmi`. No side effects; fully unit-tested. When body-fat % is present and valid, `computeBMR` automatically switches from Mifflin–St Jeor to Katch–McArdle.
- **`units.js`** — conversion helpers (`lbToKg`, `inToCm`, `ozToMl`, etc.) and display formatters (`formatWeight`, `formatHeight`, `formatVolume`). The `toCanonical*` functions convert display values back to internal units before storing.
- **`storage.js`** — `loadState`/`saveState` (localStorage key `health-dashboard:v1`), `DEFAULT_STATE()` (generates ~14 days of seed data), and JSON export/import helpers.

### Weight-loss projection model
`projectWeight` in `health.js` simulates day-by-day, recomputing TDEE from the current (decreasing) weight each iteration. This produces a realistic asymptotic curve rather than a straight line. The projection overlays on the weight chart as a dashed line and is derived from the calorie target in `calc.goal` / `calc.rateLbPerWeek`.

### Deployment
- GitHub repo: `RolandChanove/health-dashboard`
- Deployed via Cloudflare Workers & Pages (new unified interface)
- Build command: `npm run build` | Deploy command: `npx wrangler deploy`
- Requires **Vite 6+** — Wrangler rejects Vite 5 at the deploy step
- Auto-deploys on every push to `main`
- Security headers served via `public/_headers` (Cloudflare reads this automatically)
- Custom domain DNS auto-wired since domain is on Cloudflare

## Testing

Tests live in `src/lib/health.test.js` and cover BMR equations, TDEE, calorie target safety clamping, macro splits, projection monotonicity, strength ratio classification, and BMI. Run a single test by name:

```bash
npm test -- --reporter=verbose -t "Katch"
```
