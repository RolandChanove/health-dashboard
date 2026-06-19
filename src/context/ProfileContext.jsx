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

  // Persist on every change (localStorage is the source of truth).
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
        // Keep the profile's current weight in sync with the latest entry.
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
