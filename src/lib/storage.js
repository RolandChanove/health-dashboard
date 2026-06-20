// localStorage persistence + JSON export/import + seed data.
// Canonical units: weight=lb, height=in, water=oz. Dates are ISO 'YYYY-MM-DD'.

const STORAGE_KEY = 'health-dashboard:v1'

export function isoDaysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

// Build ~14 days of realistic sample data so every chart renders on first load.
function seedData() {
  const weights = []
  const water = []
  // Start at 198 lb, gentle downward trend with daily noise.
  let w = 198
  for (let i = 13; i >= 0; i--) {
    w -= 0.25 + Math.random() * 0.25
    const noisy = w + (Math.random() - 0.5) * 1.2
    weights.push({ date: isoDaysAgo(i), weightLb: Math.round(noisy * 10) / 10 })
    // Water between ~80 and ~130 oz.
    water.push({ date: isoDaysAgo(i), oz: Math.round(80 + Math.random() * 50) })
  }
  return { weights, water }
}

export const DEFAULT_STATE = () => {
  const seeded = seedData()
  return {
    profile: {
      sex: 'male',
      age: 30,
      heightIn: 70, // 5'10"
      weightLb: seeded.weights[seeded.weights.length - 1].weightLb,
      bodyFatPct: 20,
      activity: 'moderate',
      units: 'imperial', // 'imperial' | 'metric'
    },
    logs: {
      weights: seeded.weights,
      water: seeded.water,
      waterGoalOz: 100,
      lifts: { bench: 185, squat: 245, deadlift: 315 },
    },
    calc: {
      goal: 'lose',
      rateLbPerWeek: 1,
      preset: 'balanced',
    },
    workouts: {
      // WorkoutTemplate[]: { id, name, exercises: { id, name, defaultSets, defaultReps, defaultWeightLb }[] }
      templates: [],
      schedule: {
        // weekly: { '0'–'6': templateId | null }
        //   key present  → explicit assignment (null = rest, string = template)
        //   key absent   → unassigned (falls through to active cycle)
        weekly: {},
        // CycleSchedule[]: { id, name, startDate, days: (templateId | 'rest')[] }
        cycles: [],
        activeCycleId: null,
      },
      // WorkoutSession[]: { id, date, templateId, templateName, completed, exercises }
      // exercise: { exerciseId, name, sets: { reps, weightLb, done }[] }
      sessions: [],
    },
  }
}

// Resolve which workout template (or null) is scheduled for a given ISO date.
// Weekly assignments take priority; active cycle fills unassigned days.
export function resolveWorkoutForDate(workouts, isoDate) {
  if (!workouts) return null
  const d = new Date(isoDate + 'T12:00:00')
  const dow = String(d.getDay()) // '0'=Sun … '6'=Sat
  const { weekly, cycles, activeCycleId } = workouts.schedule

  if (dow in weekly) {
    const tid = weekly[dow]
    if (!tid) return null // explicitly rest
    return workouts.templates.find((t) => t.id === tid) ?? null
  }

  if (activeCycleId) {
    const cycle = cycles.find((c) => c.id === activeCycleId)
    if (cycle?.startDate && cycle.days.length) {
      const start = new Date(cycle.startDate + 'T12:00:00')
      const diff = Math.floor((d - start) / 86400000)
      if (diff >= 0) {
        const key = cycle.days[diff % cycle.days.length]
        if (key && key !== 'rest') {
          return workouts.templates.find((t) => t.id === key) ?? null
        }
      }
    }
  }

  return null
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE()
    const parsed = JSON.parse(raw)
    const def = DEFAULT_STATE()
    return {
      profile: { ...def.profile, ...parsed.profile },
      logs: { ...def.logs, ...parsed.logs },
      calc: { ...def.calc, ...parsed.calc },
      workouts: parsed.workouts ?? def.workouts,
    }
  } catch (e) {
    console.warn('Failed to load saved state, using defaults.', e)
    return DEFAULT_STATE()
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save state.', e)
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY)
}

// --- JSON export / import ---

export function exportStateToFile(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `corpus-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function importStateFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        const def = DEFAULT_STATE()
        resolve({
          profile: { ...def.profile, ...parsed.profile },
          logs: { ...def.logs, ...parsed.logs },
          calc: { ...def.calc, ...parsed.calc },
          workouts: parsed.workouts ?? def.workouts,
        })
      } catch (e) {
        reject(e)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export { STORAGE_KEY }
