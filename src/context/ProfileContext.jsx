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
      setState((s) => ({
        ...s,
        workouts: {
          ...s.workouts,
          sessions: [
            ...s.workouts.sessions,
            {
              id: crypto.randomUUID(),
              date,
              templateId: template.id,
              templateName: template.name,
              completed: false,
              exercises: template.exercises.map((ex) => ({
                exerciseId: ex.id,
                name: ex.name,
                sets: Array.from({ length: Math.max(1, ex.defaultSets) }, () => ({
                  reps: ex.defaultReps,
                  weightLb: ex.defaultWeightLb,
                  done: false,
                })),
              })),
            },
          ],
        },
      }))

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
                  sets: ex.sets.map((set, j) => (j === setIdx ? { ...set, ...patch } : set)),
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
                  sets: [...ex.sets, { reps: last?.reps ?? 8, weightLb: last?.weightLb ?? 0, done: false }],
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
