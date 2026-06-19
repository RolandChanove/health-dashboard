// ---------------------------------------------------------------------------
// health.js — pure, testable models for the dashboard.
//
// Canonical units throughout this module:
//   weight  -> pounds (lb)
//   height  -> inches (in)
//   energy  -> kilocalories (kcal)
// Conversions to metric happen internally where a formula requires kg/cm.
//
// References:
//   Mifflin MD, St Jeor ST, et al. Am J Clin Nutr. 1990 (BMR).
//   Katch & McArdle (lean-body-mass BMR).
//   1 lb body fat ~= 3500 kcal (Wishnofsky); the projection below improves on
//   the naive linear form by recomputing TDEE as weight changes (cf. Hall et al.
//   / NIH Body Weight Planner adaptive behaviour).
// ---------------------------------------------------------------------------

import { lbToKg, inToCm, KCAL_PER_LB_FAT } from './units.js'

// --- Activity multipliers (applied to BMR to get TDEE) ---
export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', factor: 1.2, hint: 'Little or no exercise, desk job' },
  { id: 'light', label: 'Lightly active', factor: 1.375, hint: 'Light exercise 1–3 days/week' },
  { id: 'moderate', label: 'Moderately active', factor: 1.55, hint: 'Moderate exercise 3–5 days/week' },
  { id: 'very', label: 'Very active', factor: 1.725, hint: 'Hard exercise 6–7 days/week' },
  { id: 'athlete', label: 'Athlete', factor: 1.9, hint: 'Very hard exercise / physical job' },
]

export const activityFactor = (id) =>
  ACTIVITY_LEVELS.find((a) => a.id === id)?.factor ?? 1.55

// ---------------------------------------------------------------------------
// BMR
// ---------------------------------------------------------------------------

// Mifflin–St Jeor (most accurate predictive equation for the general public).
// sex: 'male' | 'female'
export function bmrMifflin({ weightLb, heightIn, age, sex }) {
  const kg = lbToKg(weightLb)
  const cm = inToCm(heightIn)
  const base = 10 * kg + 6.25 * cm - 5 * age
  return base + (sex === 'female' ? -161 : 5)
}

// Katch–McArdle — uses lean body mass, more accurate when body-fat % is known.
// bodyFatPct: 0–100
export function bmrKatch({ weightLb, bodyFatPct }) {
  const kg = lbToKg(weightLb)
  const leanKg = kg * (1 - bodyFatPct / 100)
  return 370 + 21.6 * leanKg
}

// Pick the best available equation: Katch–McArdle if a valid body-fat % is
// provided, else Mifflin–St Jeor. Returns { bmr, method }.
export function computeBMR(profile) {
  const { bodyFatPct } = profile
  if (bodyFatPct != null && bodyFatPct > 0 && bodyFatPct < 75) {
    return { bmr: bmrKatch(profile), method: 'Katch–McArdle' }
  }
  return { bmr: bmrMifflin(profile), method: 'Mifflin–St Jeor' }
}

// TDEE = BMR * activity factor
export function computeTDEE(profile) {
  const { bmr, method } = computeBMR(profile)
  const tdee = bmr * activityFactor(profile.activity)
  return { bmr, tdee, method }
}

// ---------------------------------------------------------------------------
// Calorie goal
// ---------------------------------------------------------------------------

export const GOALS = [
  { id: 'lose', label: 'Lose weight', sign: -1 },
  { id: 'maintain', label: 'Maintain', sign: 0 },
  { id: 'gain', label: 'Gain weight', sign: 1 },
]

// Minimum safe intake floors (kcal).
const MIN_KCAL = { male: 1500, female: 1200 }

// rateLbPerWeek: desired change magnitude in lb/week (always positive).
// Returns target intake + diagnostics, with safety clamping.
export function computeCalorieTarget(profile, { goal, rateLbPerWeek }) {
  const { bmr, tdee, method } = computeTDEE(profile)
  const goalDef = GOALS.find((g) => g.id === goal) ?? GOALS[1]
  const sign = goalDef.sign

  // Recommended ceiling: ~1% of bodyweight per week.
  const maxRate = (profile.weightLb * 0.01)
  const requestedRate = goal === 'maintain' ? 0 : Math.max(0, rateLbPerWeek)
  const cappedRate = Math.min(requestedRate, maxRate)
  const rateClamped = cappedRate < requestedRate

  const dailyDelta = (sign * cappedRate * KCAL_PER_LB_FAT) / 7
  let target = tdee + dailyDelta

  const floor = MIN_KCAL[profile.sex] ?? 1200
  let floored = false
  if (target < floor) {
    target = floor
    floored = true
  }

  return {
    bmr,
    tdee,
    method,
    target: Math.round(target),
    dailyDelta: Math.round(dailyDelta),
    effectiveRate: cappedRate,
    maxRate,
    rateClamped,
    floored,
  }
}

// ---------------------------------------------------------------------------
// Macros
// ---------------------------------------------------------------------------

export const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 }

// Diet presets define protein (g per lb bodyweight) and fat (% of calories).
export const DIET_PRESETS = [
  { id: 'balanced', label: 'Balanced', proteinPerLb: 0.8, fatPct: 0.27 },
  { id: 'highprotein', label: 'High protein', proteinPerLb: 1.0, fatPct: 0.25 },
  { id: 'lowcarb', label: 'Low carb', proteinPerLb: 0.9, fatPct: 0.4 },
]

// Compute grams of protein / carbs / fat for a calorie target.
// Protein scales with bodyweight; fat is a % of calories (with a floor of
// 0.3 g/lb to stay healthy); carbs fill the remainder (never negative).
export function computeMacros({ calories, weightLb, preset }) {
  const p = DIET_PRESETS.find((d) => d.id === preset) ?? DIET_PRESETS[0]

  let proteinG = p.proteinPerLb * weightLb
  const fatFloorG = 0.3 * weightLb
  let fatG = Math.max((p.fatPct * calories) / KCAL_PER_G.fat, fatFloorG)

  let proteinKcal = proteinG * KCAL_PER_G.protein
  let fatKcal = fatG * KCAL_PER_G.fat
  let carbKcal = calories - proteinKcal - fatKcal

  // If protein+fat already exceed the budget, trim fat first, then protein.
  if (carbKcal < 0) {
    fatKcal = Math.max(fatFloorG * KCAL_PER_G.fat, fatKcal + carbKcal)
    fatG = fatKcal / KCAL_PER_G.fat
    carbKcal = calories - proteinKcal - fatKcal
    if (carbKcal < 0) {
      proteinKcal = Math.max(0, proteinKcal + carbKcal)
      proteinG = proteinKcal / KCAL_PER_G.protein
      carbKcal = 0
    }
  }

  const carbsG = carbKcal / KCAL_PER_G.carbs
  return {
    protein: { grams: Math.round(proteinG), kcal: Math.round(proteinKcal) },
    carbs: { grams: Math.round(carbsG), kcal: Math.round(carbKcal) },
    fat: { grams: Math.round(fatG), kcal: Math.round(fatKcal) },
  }
}

// ---------------------------------------------------------------------------
// Weight-loss projection (dynamic — recomputes TDEE each day)
// ---------------------------------------------------------------------------

// Simulate body weight day-by-day given a fixed daily intake. Because BMR/TDEE
// fall as weight drops, the deficit shrinks over time and the curve flattens
// toward a maintenance plateau — far more realistic than a straight line.
// Returns [{ day, weight }] of length days+1 (day 0 = start).
export function projectWeight(profile, { intake, days = 120 }) {
  const out = []
  let weightLb = profile.weightLb
  out.push({ day: 0, weight: round1(weightLb) })

  for (let d = 1; d <= days; d++) {
    const { tdee } = computeTDEE({ ...profile, weightLb })
    const balance = intake - tdee // negative => deficit
    weightLb += balance / KCAL_PER_LB_FAT
    if (weightLb < 60) weightLb = 60 // guard against absurd values
    out.push({ day: d, weight: round1(weightLb) })
  }
  return out
}

// Estimate days to reach a target weight under a fixed intake (or null if the
// plateau is on the wrong side of the goal and it will never be reached).
export function daysToTarget(profile, { intake, targetLb, maxDays = 1000 }) {
  let weightLb = profile.weightLb
  const losing = targetLb < weightLb
  for (let d = 1; d <= maxDays; d++) {
    const { tdee } = computeTDEE({ ...profile, weightLb })
    weightLb += (intake - tdee) / KCAL_PER_LB_FAT
    if (losing ? weightLb <= targetLb : weightLb >= targetLb) return d
  }
  return null
}

// ---------------------------------------------------------------------------
// Body composition / BMI
// ---------------------------------------------------------------------------

export function bmi({ weightLb, heightIn }) {
  const kg = lbToKg(weightLb)
  const m = inToCm(heightIn) / 100
  if (!m) return 0
  return kg / (m * m)
}

export function bmiCategory(value) {
  if (value < 18.5) return { label: 'Underweight', color: '#38bdf8' }
  if (value < 25) return { label: 'Normal', color: '#22c55e' }
  if (value < 30) return { label: 'Overweight', color: '#f59e0b' }
  return { label: 'Obese', color: '#ef4444' }
}

// Returns lean + fat mass in lb when body-fat % is known.
export function bodyComposition({ weightLb, bodyFatPct }) {
  if (bodyFatPct == null || bodyFatPct <= 0) return null
  const fat = weightLb * (bodyFatPct / 100)
  return { fatMassLb: fat, leanMassLb: weightLb - fat }
}

// ---------------------------------------------------------------------------
// Strength ratios + levels (lift ÷ bodyweight)
// ---------------------------------------------------------------------------

// Approximate bodyweight-ratio thresholds by lift & sex (one-rep / working max).
// Levels: Untrained < Novice < Intermediate < Advanced < Elite.
// Derived from common strength-standard tables (e.g. ExRx-style ratios).
const STRENGTH_STANDARDS = {
  male: {
    bench: [0.5, 0.75, 1.0, 1.5, 2.0],
    squat: [0.75, 1.25, 1.5, 2.25, 2.75],
    deadlift: [1.0, 1.5, 2.0, 2.5, 3.0],
  },
  female: {
    bench: [0.35, 0.5, 0.75, 1.0, 1.5],
    squat: [0.5, 0.75, 1.25, 1.75, 2.25],
    deadlift: [0.5, 1.0, 1.25, 1.75, 2.5],
  },
}

export const STRENGTH_LEVELS = [
  'Untrained',
  'Novice',
  'Intermediate',
  'Advanced',
  'Elite',
]

export const STRENGTH_LEVEL_COLORS = {
  Untrained: '#94a3b8',
  Novice: '#38bdf8',
  Intermediate: '#22c55e',
  Advanced: '#f59e0b',
  Elite: '#a855f7',
}

// lift: 'bench' | 'squat' | 'deadlift'
export function strengthRatio({ lift, weightLifted, bodyWeightLb, sex }) {
  const ratio = bodyWeightLb > 0 ? weightLifted / bodyWeightLb : 0
  const thresholds = (STRENGTH_STANDARDS[sex] ?? STRENGTH_STANDARDS.male)[lift]

  // Determine level index by how many thresholds the ratio meets/exceeds.
  let levelIndex = 0
  for (let i = 0; i < thresholds.length; i++) {
    if (ratio >= thresholds[i]) levelIndex = i + 1
  }
  // Clamp so index maps into STRENGTH_LEVELS (0..4).
  const idx = Math.min(levelIndex, STRENGTH_LEVELS.length - 1)
  // Progress toward the next level (0..1) for a progress bar.
  const lower = idx === 0 ? 0 : thresholds[idx - 1]
  const upper = thresholds[Math.min(idx, thresholds.length - 1)]
  const nextThreshold = thresholds[Math.min(idx, thresholds.length - 1)]
  const progress =
    upper > lower ? Math.min(1, Math.max(0, (ratio - lower) / (upper - lower))) : 1

  return {
    ratio,
    level: STRENGTH_LEVELS[idx],
    levelIndex: idx,
    color: STRENGTH_LEVEL_COLORS[STRENGTH_LEVELS[idx]],
    nextThreshold,
    progress,
    thresholds,
  }
}

// Helpers --------------------------------------------------------------------
function round1(n) {
  return Math.round(n * 10) / 10
}
