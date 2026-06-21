// localStorage persistence + JSON export/import + seed data.
// Canonical units: weight=lb, height=in, water=oz. Dates are ISO 'YYYY-MM-DD'.
//
// Exercise set shape (in templates):
//   { reps, weightType: 'fixed'|'bodyweight'|'percent1rm', weightLb, percentage, liftRef }
//
// Session set shape (logged):
//   { planned: { reps, weightType, weightLb, percentage, liftRef } | null,
//     actual:  { reps, weightLb, done } }

const STORAGE_KEY = 'health-dashboard:v1'

export function isoDaysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function seedData() {
  const weights = []
  const water = []
  let w = 198
  for (let i = 13; i >= 0; i--) {
    w -= 0.25 + Math.random() * 0.25
    const noisy = w + (Math.random() - 0.5) * 1.2
    weights.push({ date: isoDaysAgo(i), weightLb: Math.round(noisy * 10) / 10 })
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
      heightIn: 70,
      weightLb: seeded.weights[seeded.weights.length - 1].weightLb,
      bodyFatPct: 20,
      activity: 'moderate',
      units: 'imperial',
    },
    logs: {
      weights: seeded.weights,
      water: seeded.water,
      waterGoalOz: 100,
      lifts: { bench: 185, squat: 245, deadlift: 315 },
      foods: [],
      foodTemplates: [],
      measurements: [],   // [{ date, chest, waist, hips, armL, armR, thighL, thighR, neck, calf }] in inches
      savedMeals: [],     // [{ id, name, foods: [...foodEntry] }]
      prHistory: [],      // [{ id, lift, date, weightLb, notes }]
    },
    calc: {
      goal: 'lose',
      rateLbPerWeek: 1,
      preset: 'balanced',
    },
    workouts: {
      templates: [],
      schedule: {
        weekly: {},
        cycles: [],
        activeCycleId: null,
      },
      sessions: [],
    },
  }
}

// --- Migration helpers ---

function migrateTemplate(t) {
  if (!Array.isArray(t.exercises)) return t
  // Old format: exercise had defaultSets/defaultReps/defaultWeightLb
  const needsMigration = t.exercises.some((ex) => ex.defaultSets !== undefined)
  if (!needsMigration) return t
  return {
    ...t,
    exercises: t.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      sets: Array.from({ length: Math.max(1, ex.defaultSets ?? 3) }, () => ({
        reps: ex.defaultReps ?? 8,
        weightType: 'fixed',
        weightLb: ex.defaultWeightLb ?? 0,
        percentage: null,
        liftRef: null,
      })),
    })),
  }
}

function migrateSession(sess) {
  if (!Array.isArray(sess.exercises)) return sess
  const needsMigration = sess.exercises.some(
    (ex) => ex.sets.length > 0 && ex.sets[0].actual === undefined,
  )
  if (!needsMigration) return sess
  return {
    ...sess,
    exercises: sess.exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((set) => ({
        planned: null,
        actual: { reps: set.reps ?? 0, weightLb: set.weightLb ?? 0, done: set.done ?? false },
      })),
    })),
  }
}

function migrateWorkouts(workouts) {
  if (!workouts) return workouts
  return {
    ...workouts,
    templates: (workouts.templates ?? []).map(migrateTemplate),
    sessions: (workouts.sessions ?? []).map(migrateSession),
  }
}

// --- Schedule resolution ---

export function resolveWorkoutForDate(workouts, isoDate) {
  if (!workouts) return null
  const d = new Date(isoDate + 'T12:00:00')
  const dow = String(d.getDay())
  const { weekly, cycles, activeCycleId } = workouts.schedule

  if (dow in weekly) {
    const tid = weekly[dow]
    if (!tid) return null
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

// --- Persistence ---

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
      workouts: migrateWorkouts(parsed.workouts ?? def.workouts),
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

export function exportStateToFile(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `corpra-${new Date().toISOString().slice(0, 10)}.json`
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
          workouts: migrateWorkouts(parsed.workouts ?? def.workouts),
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

// ─── Supabase sync ────────────────────────────────────────────────────────────

export async function loadFromSupabase(userId) {
  try {
    const { supabase } = await import('./supabase.js')
    const { data, error } = await supabase
      .from('user_data')
      .select('state')
      .eq('user_id', userId)
      .maybeSingle()
    if (error || !data?.state) return null
    const def = DEFAULT_STATE()
    return {
      profile:  { ...def.profile,  ...data.state.profile  },
      logs:     { ...def.logs,     ...data.state.logs     },
      calc:     { ...def.calc,     ...data.state.calc     },
      workouts: migrateWorkouts(data.state.workouts ?? def.workouts),
    }
  } catch {
    return null
  }
}

export async function syncToSupabase(userId, state) {
  try {
    const { supabase } = await import('./supabase.js')
    await supabase.from('user_data').upsert({
      user_id:    userId,
      state,
      updated_at: new Date().toISOString(),
    })
  } catch {
    // fail silently — localStorage is the live fallback
  }
}
