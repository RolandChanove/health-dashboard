import { useState } from 'react'
import { useProfile } from '../context/ProfileContext.jsx'
import { lbToKg, kgToLb, round } from '../lib/units.js'
import { Card } from './ui/Card.jsx'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const EMPTY_EXERCISE = () => ({ _key: crypto.randomUUID(), name: '', sets: 3, reps: 8, weight: 0 })

function blankForm() {
  return { id: null, name: '', exercises: [EMPTY_EXERCISE()] }
}

function templateToForm(t, isMetric) {
  return {
    id: t.id,
    name: t.name,
    exercises: t.exercises.map((ex) => ({
      _key: ex.id,
      name: ex.name,
      sets: ex.defaultSets,
      reps: ex.defaultReps,
      weight: isMetric ? round(lbToKg(ex.defaultWeightLb), 1) : round(ex.defaultWeightLb, 1),
    })),
  }
}

function formToTemplate(form, isMetric) {
  return {
    id: form.id ?? crypto.randomUUID(),
    name: form.name.trim() || 'Unnamed Workout',
    exercises: form.exercises
      .filter((ex) => ex.name.trim())
      .map((ex) => ({
        id: ex._key,
        name: ex.name.trim(),
        defaultSets: Math.max(1, Number(ex.sets) || 1),
        defaultReps: Math.max(1, Number(ex.reps) || 1),
        defaultWeightLb: isMetric
          ? round(kgToLb(Number(ex.weight) || 0), 2)
          : Number(ex.weight) || 0,
      })),
  }
}

export function WorkoutBuilder() {
  const {
    workouts,
    profile,
    addWorkoutTemplate,
    updateWorkoutTemplate,
    deleteWorkoutTemplate,
    setWeeklyDay,
    clearWeeklyDay,
    addCycle,
    updateCycle,
    deleteCycle,
    setActiveCycle,
  } = useProfile()

  const isMetric = profile.units === 'metric'
  const wtUnit = isMetric ? 'kg' : 'lb'
  const { templates, schedule } = workouts

  const [form, setForm] = useState(null) // null | form object
  const [cycleForm, setCycleForm] = useState(null)

  // --- Template CRUD ---
  function handleSave() {
    if (!form) return
    const t = formToTemplate(form, isMetric)
    if (form.id) {
      updateWorkoutTemplate(form.id, t)
    } else {
      addWorkoutTemplate(t)
    }
    setForm(null)
  }

  function updateExercise(idx, patch) {
    setForm((f) => ({
      ...f,
      exercises: f.exercises.map((ex, i) => (i === idx ? { ...ex, ...patch } : ex)),
    }))
  }

  function moveExercise(idx, dir) {
    setForm((f) => {
      const exs = [...f.exercises]
      const swap = idx + dir
      if (swap < 0 || swap >= exs.length) return f
      ;[exs[idx], exs[swap]] = [exs[swap], exs[idx]]
      return { ...f, exercises: exs }
    })
  }

  // --- Cycle helpers ---
  function saveCycle() {
    if (!cycleForm) return
    const cycle = {
      ...cycleForm,
      id: cycleForm.id ?? crypto.randomUUID(),
      name: cycleForm.name.trim() || 'My Cycle',
    }
    if (cycleForm.id) {
      updateCycle(cycleForm.id, cycle)
    } else {
      addCycle(cycle)
    }
    setCycleForm(null)
  }

  return (
    <div className="space-y-6">
      {/* Template list */}
      <Card
        title="Workouts"
        action={
          !form && (
            <button
              onClick={() => setForm(blankForm())}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
            >
              + New Workout
            </button>
          )
        }
      >
        {templates.length === 0 && !form && (
          <p className="text-sm text-slate-400 text-center py-4">
            No workouts yet. Create one to get started.
          </p>
        )}

        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-slate-800">{t.name}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setForm(templateToForm(t, isMetric)); setCycleForm(null) }}
                    className="text-xs text-brand-600 hover:text-brand-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${t.name}"?`)) deleteWorkoutTemplate(t.id)
                    }}
                    className="text-xs text-slate-400 hover:text-rose-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                {t.exercises.map((e) => e.name).join(' · ')}
              </p>
            </div>
          ))}
        </div>

        {/* Inline template form */}
        {form && (
          <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4 space-y-4">
            <input
              type="text"
              placeholder="Workout name (e.g. Thursday — Bench + Pull)"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm ring-1 ring-slate-300 outline-none focus:ring-brand-500"
            />

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Exercises</p>
              {form.exercises.map((ex, idx) => (
                <div key={ex._key} className="grid grid-cols-[1fr_3.5rem_3.5rem_4.5rem_auto] gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Exercise name"
                    value={ex.name}
                    onChange={(e) => updateExercise(idx, { name: e.target.value })}
                    className="rounded-lg px-2 py-1.5 text-sm ring-1 ring-slate-300 outline-none focus:ring-brand-500"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      value={ex.sets}
                      min={1}
                      onChange={(e) => updateExercise(idx, { sets: e.target.value })}
                      className="w-full rounded-lg px-2 py-1.5 text-sm ring-1 ring-slate-300 outline-none focus:ring-brand-500"
                      title="Sets"
                      placeholder="Sets"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">sets</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={ex.reps}
                      min={1}
                      onChange={(e) => updateExercise(idx, { reps: e.target.value })}
                      className="w-full rounded-lg px-2 py-1.5 text-sm ring-1 ring-slate-300 outline-none focus:ring-brand-500"
                      title="Reps"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">reps</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={ex.weight}
                      min={0}
                      step={isMetric ? 0.5 : 2.5}
                      onChange={(e) => updateExercise(idx, { weight: e.target.value })}
                      className="w-full rounded-lg px-2 py-1.5 text-sm ring-1 ring-slate-300 outline-none focus:ring-brand-500"
                      title={`Default weight (${wtUnit})`}
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">{wtUnit}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => moveExercise(idx, -1)} disabled={idx === 0} className="text-slate-300 hover:text-slate-500 disabled:opacity-30">↑</button>
                    <button onClick={() => moveExercise(idx, 1)} disabled={idx === form.exercises.length - 1} className="text-slate-300 hover:text-slate-500 disabled:opacity-30">↓</button>
                    <button
                      onClick={() => setForm((f) => ({ ...f, exercises: f.exercises.filter((_, i) => i !== idx) }))}
                      disabled={form.exercises.length === 1}
                      className="text-slate-300 hover:text-rose-400 disabled:opacity-30"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setForm((f) => ({ ...f, exercises: [...f.exercises, EMPTY_EXERCISE()] }))}
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                + Add Exercise
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Save
              </button>
              <button
                onClick={() => setForm(null)}
                className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Weekly schedule */}
      {templates.length > 0 && (
        <Card title="Weekly Schedule" subtitle="Assign workouts to specific days of the week">
          <div className="space-y-2">
            {DAY_LABELS.map((label, dow) => {
              const key = String(dow)
              const assigned = key in schedule.weekly ? schedule.weekly[key] : '__unassigned__'
              return (
                <div key={dow} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-medium text-slate-500">{label}</span>
                  <select
                    value={assigned}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '__unassigned__') clearWeeklyDay(dow)
                      else setWeeklyDay(dow, val === 'rest' ? null : val)
                    }}
                    className="flex-1 rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-500"
                  >
                    <option value="__unassigned__">— Unassigned (use cycle fallback)</option>
                    <option value="rest">Rest Day</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            "Unassigned" days fall through to an active cycle below. "Rest Day" blocks the cycle for that day.
          </p>
        </Card>
      )}

      {/* Cycle schedule */}
      {templates.length > 0 && (
        <Card
          title="Rotating Cycles"
          subtitle="A cycle repeats its sequence of workouts from a start date"
          action={
            !cycleForm && (
              <button
                onClick={() =>
                  setCycleForm({
                    id: null,
                    name: '',
                    startDate: new Date().toISOString().slice(0, 10),
                    days: ['rest'],
                  })
                }
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
              >
                + New Cycle
              </button>
            )
          }
        >
          {schedule.cycles.length === 0 && !cycleForm && (
            <p className="text-sm text-slate-400 text-center py-2">No cycles yet.</p>
          )}

          <div className="space-y-3">
            {schedule.cycles.map((c) => (
              <div key={c.id} className={`rounded-xl p-3 ${schedule.activeCycleId === c.id ? 'bg-brand-50 ring-1 ring-brand-200' : 'bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">
                      Starts {c.startDate} · {c.days.length}-day cycle
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveCycle(schedule.activeCycleId === c.id ? null : c.id)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                        schedule.activeCycleId === c.id
                          ? 'bg-brand-600 text-white'
                          : 'bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {schedule.activeCycleId === c.id ? 'Active' : 'Activate'}
                    </button>
                    <button
                      onClick={() => setCycleForm({ ...c })}
                      className="text-xs text-brand-600 hover:text-brand-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteCycle(c.id) }}
                      className="text-xs text-slate-400 hover:text-rose-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.days.map((d, i) => (
                    <span
                      key={i}
                      className={`rounded-md px-2 py-0.5 text-xs ${
                        d === 'rest'
                          ? 'bg-slate-200 text-slate-500'
                          : 'bg-brand-100 text-brand-700'
                      }`}
                    >
                      {d === 'rest' ? 'Rest' : (templates.find((t) => t.id === d)?.name ?? '?')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cycle form */}
          {cycleForm && (
            <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4 space-y-3">
              <input
                type="text"
                placeholder="Cycle name (e.g. PPL Cycle)"
                value={cycleForm.name}
                onChange={(e) => setCycleForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm ring-1 ring-slate-300 outline-none focus:ring-brand-500"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 whitespace-nowrap">Start date</label>
                <input
                  type="date"
                  value={cycleForm.startDate}
                  onChange={(e) => setCycleForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="rounded-lg px-3 py-1.5 text-sm ring-1 ring-slate-300 outline-none focus:ring-brand-500"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Days in cycle</p>
                {cycleForm.days.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-10">Day {i + 1}</span>
                    <select
                      value={d}
                      onChange={(e) =>
                        setCycleForm((f) => {
                          const days = [...f.days]
                          days[i] = e.target.value
                          return { ...f, days }
                        })
                      }
                      className="flex-1 rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-500"
                    >
                      <option value="rest">Rest Day</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        setCycleForm((f) => ({ ...f, days: f.days.filter((_, j) => j !== i) }))
                      }
                      disabled={cycleForm.days.length === 1}
                      className="text-slate-300 hover:text-rose-400 disabled:opacity-30"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setCycleForm((f) => ({ ...f, days: [...f.days, 'rest'] }))}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  + Add Day
                </button>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={saveCycle}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Save Cycle
                </button>
                <button
                  onClick={() => setCycleForm(null)}
                  className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
