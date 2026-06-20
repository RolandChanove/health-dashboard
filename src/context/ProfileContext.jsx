import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  loadState,
  saveState,
  clearState,
  DEFAULT_STATE,
  exportStateToFile,
  importStateFromFile,
  isoDaysAgo,
} from '../lib/storage.js'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const api = useMemo(() => {
    // --- profile ---
    const setProfile = (patch) =>
      setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }))

    const setUnits = (units) =>
      setState((s) => ({ ...s, profile: { ...s.profile, units } }))

    const toggleUnits = () =>
      setState((s) => ({
        ...s,
        profile: {
          ...s.profile,
          units: s.profile.units === 'imperial' ? 'metric' : 'imperial',
        },
      }))

    // --- calculator settings ---
    const setCalc = (patch) =>
      setState((s) => ({ ...s, calc: { ...s.calc, ...patch } }))

    // --- weight log ---
    const addWeight = (weightLb, date = isoDaysAgo(0)) =>
      setState((s) => {
        const others = s.logs.weights.filter((w) => w.date !== date)
        const weights = [...others, { date, weightLb: Number(weightLb) }].sort(
          (a, b) => a.date.localeCompare(b.date),
        )
        const latest = weights[weights.length - 1]
        return {
          ...s,
          logs: { ...s.logs, weights },
          profile: { ...s.profile, weightLb: latest.weightLb },
        }
      })

    const removeWeight = (date) =>
      setState((s) => ({
        ...s,
        logs: { ...s.logs, weights: s.logs.weights.filter((w) => w.date !== date) },
      }))

    // --- water log ---
    const addWater = (oz, date = isoDaysAgo(0)) =>
      setState((s) => {
        const existing = s.logs.water.find((w) => w.date === date)
        const others = s.logs.water.filter((w) => w.date !== date)
        const newOz = (existing?.oz ?? 0) + Number(oz)
        const water = [...others, { date, oz: Math.max(0, newOz) }].sort((a, b) =>
          a.date.localeCompare(b.date),
        )
        return { ...s, logs: { ...s.logs, water } }
      })

    const setWaterGoal = (oz) =>
      setState((s) => ({ ...s, logs: { ...s.logs, waterGoalOz: Number(oz) } }))

    // --- lifts ---
    const setLift = (lift, weight) =>
      setState((s) => ({
        ...s,
        logs: { ...s.logs, lifts: { ...s.logs.lifts, [lift]: Number(weight) } },
      }))

    // --- food log ---
    const addFoodEntry = (entry) =>
      setState((s) => ({
        ...s,
        logs: { ...s.logs, foods: [...(s.logs.foods ?? []), entry] },
      }))

    const removeFoodEntry = (id) =>
      setState((s) => ({
        ...s,
        logs: { ...s.logs, foods: (s.logs.foods ?? []).filter((e) => e.id !== id) },
      }))

    // --- food templates ---
    const addFoodTemplate = (template) =>
      setState((s) => ({
        ...s,
        logs: { ...s.logs, foodTemplates: [...(s.logs.foodTemplates ?? []), template] },
      }))

    const updateFoodTemplate = (id, patch) =>
      setState((s) => ({
        ...s,
        logs: {
          ...s.logs,
          foodTemplates: (s.logs.foodTemplates ?? []).map((t) => (t.id === id ? { ...t, ...patch } : t)),
        },
      }))

    const deleteFoodTemplate = (id) =>
      setState((s) => ({
        ...s,
        logs: { ...s.logs, foodTemplates: (s.logs.foodTemplates ?? []).filter((t) => t.id !== id) },
      }))

    // --- saved meals ---
    const addSavedMeal = (meal) =>
      setState((s) => ({
        ...s,
        logs: { ...s.logs, savedMeals: [...(s.logs.savedMeals ?? []), meal] },
      }))

    const updateSavedMeal = (id, patch) =>
      setState((s) => ({
        ...s,
        logs: {
          ...s.logs,
          savedMeals: (s.logs.savedMeals ?? []).map((m) => (m.id === id ? { ...m, ...patch } : m)),
        },
      }))

    const deleteSavedMeal = (id) =>
      setState((s) => ({
        ...s,
        logs: { ...s.logs, savedMeals: (s.logs.savedMeals ?? []).filter((m) => m.id !== id) },
      }))

    // --- body measurements ---
    const addMeasurement = (entry) =>
      setState((s) => {
        const others = (s.logs.measurements ?? []).filter((m) => m.date !== entry.date)
        return {
          ...s,
          logs: {
            ...s.logs,
            measurements: [...others, entry].sort((a, b) => a.date.localeCompare(b.date)),
          },
        }
      })

    const removeMeasurement = (date) =>
      setState((s) => ({
        ...s,
        logs: { ...s.logs, measurements: (s.logs.measurements ?? []).filter((m) => m.date !== date) },
      }))

    // --- PR history ---
    const addPR = (entry) =>
      setState((s) => ({
        ...s,
        logs: {
          ...s.logs,
          prHistory: [...(s.logs.prHistory ?? []), entry].sort((a, b) => a.date.localeCompare(b.date)),
          // also update the current max if this is a new record
          lifts: {
            ...s.logs.lifts,
            [entry.lift]: Math.max(s.logs.lifts[entry.lift] ?? 0, entry.weightLb),
          },
        },
      }))

    const deletePR = (id) =>
      setState((s) => ({
        ...s,
        logs: { ...s.logs, prHistory: (s.logs.prHistory ?? []).filter((p) => p.id !== id) },
      }))

    // --- workout exercise notes (RPE + freetext) ---
    const updateExerciseNotes = (sessionId, exIdx, patch) =>
      setState((s) => ({
        ...s,
        workouts: {
          ...s.workouts,
          sessions: s.workouts.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess
            return {
              ...sess,
              exercises: sess.exercises.map((ex, i) =>
                i === exIdx ? { ...ex, ...patch } : ex,
              ),
            }
          }),
        },
      }))

    // --- workout templates ---
    const addWorkoutTemplate = (template) =>
      setState((s) => ({
        ...s,
        workouts: { ...s.workouts, templates: [...s.workouts.templates, template] },
      }))

    const updateWorkoutTemplate = (id, patch) =>
      setState((s) => ({
        ...s,
        workouts: {
          ...s.workouts,
          templates: s.workouts.templates.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        },
      }))

    const deleteWorkoutTemplate = (id) =>
      setState((s) => {
        const weekly = Object.fromEntries(
          Object.entries(s.workouts.schedule.weekly).map(([k, v]) => [k, v === id ? null : v]),
        )
        const cycles = s.workouts.schedule.cycles.map((c) => ({
          ...c,
          days: c.days.map((d) => (d === id ? 'rest' : d)),
        }))
        return {
          ...s,
          workouts: {
            ...s.workouts,
            templates: s.workouts.templates.filter((t) => t.id !== id),
            schedule: { ...s.workouts.schedule, weekly, cycles },
          },
        }
      })

    // --- schedule ---
    const setWeeklyDay = (dow, templateId) =>
      setState((s) => ({
        ...s,
        workouts: {
          ...s.workouts,
          schedule: {
            ...s.workouts.schedule,
            weekly: { ...s.workouts.schedule.weekly, [String(dow)]: templateId },
          },
        },
      }))

    const clearWeeklyDay = (dow) =>
      setState((s) => {
        const weekly = { ...s.workouts.schedule.weekly }
        delete weekly[String(dow)]
        return {
          ...s,
          workouts: { ...s.workouts, schedule: { ...s.workouts.schedule, weekly } },
        }
      })

    const addCycle = (cycle) =>
      setState((s) => ({
        ...s,
        workouts: {
          ...s.workouts,
          schedule: { ...s.workouts.schedule, cycles: [...s.workouts.schedule.cycles, cycle] },
        },
      }))

    const updateCycle = (id, patch) =>
      setState((s) => ({
        ...s,
        workouts: {
          ...s.workouts,
          schedule: {
            ...s.workouts.schedule,
            cycles: s.workouts.schedule.cycles.map((c) => (c.id === id ? { ...c, ...patch } : c)),
          },
        },
      }))

    const deleteCycle = (id) =>
      setState((s) => ({
        ...s,
        workouts: {
          ...s.workouts,
          schedule: {
            ...s.workouts.schedule,
            cycles: s.workouts.schedule.cycles.filter((c) => c.id !== id),
            activeCycleId: s.workouts.schedule.activeCycleId === id ? null : s.workouts.schedule.activeCycleId,
          },
        },
      }))

    const setActiveCycle = (id) =>
      setState((s) => ({
        ...s,
        workouts: {
          ...s.workouts,
          schedule: { ...s.workouts.schedule, activeCycleId: id },
        },
      }))

    // --- workout sessions (logging) ---
    const startWorkoutSession = (template, date) =>
      setState((s) => {
        const lifts = s.logs.lifts
        const bodyWeightLb = s.profile.weightLb
        const session = {
          id: crypto.randomUUID(),
          date,
          templateId: template.id,
          templateName: template.name,
          completed: false,
          exercises: template.exercises.map((ex) => ({
            exerciseId: ex.id,
            name: ex.name,
            sets: (ex.sets ?? []).map((setDef) => {
              let plannedWeightLb = 0
              if (setDef.weightType === 'fixed') {
                plannedWeightLb = setDef.weightLb ?? 0
              } else if (setDef.weightType === 'percent1rm') {
                const base = lifts[setDef.liftRef] ?? 0
                plannedWeightLb = Math.round((base * (setDef.percentage ?? 0)) / 100 * 4) / 4
              } else if (setDef.weightType === 'bodyweight') {
                plannedWeightLb = bodyWeightLb
              }
              return {
                planned: {
                  reps: setDef.reps,
                  weightType: setDef.weightType,
                  weightLb: plannedWeightLb,
                  percentage: setDef.percentage,
                  liftRef: setDef.liftRef,
                },
                actual: { reps: setDef.reps, weightLb: plannedWeightLb, done: false },
              }
            }),
          })),
        }
        return {
          ...s,
          workouts: { ...s.workouts, sessions: [...s.workouts.sessions, session] },
        }
      })

    // patch applies to set.actual
    const updateSet = (sessionId, exIdx, setIdx, patch) =>
      setState((s) => ({
        ...s,
        workouts: {
          ...s.workouts,
          sessions: s.workouts.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess
            return {
              ...sess,
              exercises: sess.exercises.map((ex, i) => {
                if (i !== exIdx) return ex
                return {
                  ...ex,
                  sets: ex.sets.map((set, j) =>
                    j === setIdx ? { ...set, actual: { ...set.actual, ...patch } } : set,
                  ),
                }
              }),
            }
          }),
        },
      }))

    const addSet = (sessionId, exIdx) =>
      setState((s) => ({
        ...s,
        workouts: {
          ...s.workouts,
          sessions: s.workouts.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess
            return {
              ...sess,
              exercises: sess.exercises.map((ex, i) => {
                if (i !== exIdx) return ex
                const last = ex.sets[ex.sets.length - 1]
                return {
                  ...ex,
                  sets: [
                    ...ex.sets,
                    {
                      planned: null,
                      actual: {
                        reps: last?.actual?.reps ?? 8,
                        weightLb: last?.actual?.weightLb ?? 0,
                        done: false,
                      },
                    },
                  ],
                }
              }),
            }
          }),
        },
      }))

    const removeSet = (sessionId, exIdx, setIdx) =>
      setState((s) => ({
        ...s,
        workouts: {
          ...s.workouts,
          sessions: s.workouts.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess
            return {
              ...sess,
              exercises: sess.exercises.map((ex, i) => {
                if (i !== exIdx) return ex
                return { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) }
              }),
            }
          }),
        },
      }))

    const completeSession = (sessionId) =>
      setState((s) => ({
        ...s,
        workouts: {
          ...s.workouts,
          sessions: s.workouts.sessions.map((sess) =>
            sess.id === sessionId ? { ...sess, completed: true } : sess,
          ),
        },
      }))

    const deleteSession = (sessionId) =>
      setState((s) => ({
        ...s,
        workouts: {
          ...s.workouts,
          sessions: s.workouts.sessions.filter((sess) => sess.id !== sessionId),
        },
      }))

    // --- data management ---
    const resetData = () => {
      clearState()
      setState(DEFAULT_STATE())
    }
    const exportData = () => exportStateToFile(state)
    const importData = async (file) => {
      const next = await importStateFromFile(file)
      setState(next)
    }

    return {
      setProfile,
      setUnits,
      toggleUnits,
      setCalc,
      addWeight,
      removeWeight,
      addWater,
      setWaterGoal,
      setLift,
      addFoodEntry,
      removeFoodEntry,
      addFoodTemplate,
      updateFoodTemplate,
      deleteFoodTemplate,
      addSavedMeal,
      updateSavedMeal,
      deleteSavedMeal,
      addMeasurement,
      removeMeasurement,
      addPR,
      deletePR,
      updateExerciseNotes,
      addWorkoutTemplate,
      updateWorkoutTemplate,
      deleteWorkoutTemplate,
      setWeeklyDay,
      clearWeeklyDay,
      addCycle,
      updateCycle,
      deleteCycle,
      setActiveCycle,
      startWorkoutSession,
      updateSet,
      addSet,
      removeSet,
      completeSession,
      deleteSession,
      resetData,
      exportData,
      importData,
    }
  }, [state])

  const value = useMemo(() => ({ ...state, ...api }), [state, api])

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider')
  return ctx
}
