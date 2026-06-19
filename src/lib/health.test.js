import { describe, it, expect } from 'vitest'
import {
  bmrMifflin,
  bmrKatch,
  computeTDEE,
  computeCalorieTarget,
  computeMacros,
  projectWeight,
  strengthRatio,
  bmi,
} from './health.js'

const male = { weightLb: 180, heightIn: 70, age: 30, sex: 'male', activity: 'moderate' }

describe('BMR', () => {
  it('matches hand-calculated Mifflin–St Jeor for a known male profile', () => {
    // 180 lb=81.65kg, 70in=177.8cm -> 10*81.65 + 6.25*177.8 - 5*30 + 5 = ~1782
    expect(bmrMifflin(male)).toBeCloseTo(1782, -1)
  })

  it('female equation is 166 kcal below male (the +5 vs -161 offset)', () => {
    const f = bmrMifflin({ ...male, sex: 'female' })
    const m = bmrMifflin(male)
    expect(m - f).toBeCloseTo(166, 5)
  })

  it('Katch–McArdle uses lean mass', () => {
    const v = bmrKatch({ weightLb: 180, bodyFatPct: 20 })
    // lean = 81.65*0.8=65.3kg -> 370 + 21.6*65.3 = ~1781
    expect(v).toBeCloseTo(1781, -1)
  })
})

describe('TDEE + calorie target', () => {
  it('applies the moderate activity factor (1.55)', () => {
    const { bmr, tdee } = computeTDEE(male)
    expect(tdee / bmr).toBeCloseTo(1.55, 5)
  })

  it('creates a deficit when losing and caps the rate at ~1% bodyweight', () => {
    const r = computeCalorieTarget(male, { goal: 'lose', rateLbPerWeek: 5 })
    expect(r.rateClamped).toBe(true)
    expect(r.effectiveRate).toBeCloseTo(1.8, 5) // 1% of 180
    expect(r.target).toBeLessThan(r.tdee)
  })

  it('respects a safe calorie floor', () => {
    const tiny = { ...male, weightLb: 110 }
    const r = computeCalorieTarget(tiny, { goal: 'lose', rateLbPerWeek: 2 })
    expect(r.target).toBeGreaterThanOrEqual(1500)
  })
})

describe('macros', () => {
  it('macro kcal sum is within rounding of the calorie target', () => {
    const m = computeMacros({ calories: 2200, weightLb: 180, preset: 'balanced' })
    const total = m.protein.kcal + m.carbs.kcal + m.fat.kcal
    expect(Math.abs(total - 2200)).toBeLessThan(6)
  })

  it('high-protein preset yields more protein than balanced', () => {
    const hp = computeMacros({ calories: 2200, weightLb: 180, preset: 'highprotein' })
    const bal = computeMacros({ calories: 2200, weightLb: 180, preset: 'balanced' })
    expect(hp.protein.grams).toBeGreaterThan(bal.protein.grams)
  })
})

describe('weight projection', () => {
  it('decreases monotonically under a deficit and flattens (non-linear)', () => {
    const proj = projectWeight(male, { intake: 1800, days: 120 })
    // monotonic down
    for (let i = 1; i < proj.length; i++) {
      expect(proj[i].weight).toBeLessThanOrEqual(proj[i - 1].weight + 0.01)
    }
    // early loss exceeds late loss (adaptive flattening)
    const early = proj[0].weight - proj[10].weight
    const late = proj[110].weight - proj[120].weight
    expect(early).toBeGreaterThan(late)
  })
})

describe('strength ratios', () => {
  it('computes ratio and classifies level', () => {
    const r = strengthRatio({ lift: 'deadlift', weightLifted: 360, bodyWeightLb: 180, sex: 'male' })
    expect(r.ratio).toBeCloseTo(2.0, 5)
    expect(r.level).toBe('Advanced')
  })
})

describe('bmi', () => {
  it('computes a known BMI', () => {
    // 180lb, 70in -> ~25.8
    expect(bmi(male)).toBeCloseTo(25.8, 1)
  })
})
