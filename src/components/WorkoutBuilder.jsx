import { useState } from 'react'
import { useProfile } from '../context/ProfileContext.jsx'
import { lbToKg, kgToLb, round } from '../lib/units.js'
import { Card } from './ui/Card.jsx'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const LIFT_REFS = ['bench', 'squat', 'deadlift']
const LIFT_NAMES = { bench: 'Bench', squat: 'Squat', deadlift: 'Deadlift' }

const PRESET_EXERCISES = [
  { name: 'Bench Press', liftRef: 'bench' },
  { name: 'Back Squat',  liftRef: 'squat' },
  { name: 'Deadlift',   liftRef: 'deadlift' },
]

function blankSet() {
  return { reps: 5, weightType: 'fixed', weightLb: 0, percentage: 75, liftRef: 'bench' }
}

function blankExercise(name = '', liftRef = null) {
  return {
    _key: crypto.randomUUID(),
    name,
    sets: [{ ...blankSet(), ...(liftRef ? { weightType: 'percent1rm', liftRef } : {}) }],
  }
}

function blankForm() {
  return { id: null, name: '', exercises: [blankExercise()] }
}

function templateToForm(t, isMetric) {
  return {
    id: t.id,
    name: t.name,
    exercises: t.exercises.map((ex) => ({
      _key: ex.id,
      name: ex.name,
      sets: ex.sets.map((s) => ({
        ...s,
        weightLb: isMetric ? round(lbToKg(s.weightLb ?? 0), 1) : (s.weightLb ?? 0),
      })),
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
        sets: ex.sets.map((s) => ({
          reps: Math.max(1, Number(s.reps) || 1),
          weightType: s.weightType,
          weightLb:
            s.weightType === 'fixed'
              ? isMetric
                ? round(kgToLb(Number(s.weightLb) || 0), 2)
                : Number(s.weightLb) || 0
              : 0,
          percentage: s.weightType === 'percent1rm' ? Number(s.percentage) || 75 : null,
          liftRef: s.weightType === 'percent1rm' ? s.liftRef : null,
        })),
      })),
  }
}

export function WorkoutBuilder() {
  const {
    workouts, profile,
    addWorkoutTemplate, updateWorkoutTemplate, deleteWorkoutTemplate,
    setWeeklyDay, clearWeeklyDay,
    addCycle, updateCycle, deleteCycle, setActiveCycle,
  } = useProfile()

  const isMetric = profile.units === 'metric'
  const wtUnit = isMetric ? 'kg' : 'lb'
  const { templates, schedule } = workouts

  const [form, setForm] = useState(null)
  const [cycleForm, setCycleForm] = useState(null)

  function handleSave() {
    if (!form) return
    const t = formToTemplate(form, isMetric)
    if (form.id) updateWorkoutTemplate(form.id, t)
    else addWorkoutTemplate(t)
    setForm(null)
  }

  function updateExSet(exIdx, setIdx, patch) {
    setForm((f) => ({
      ...f,
      exercises: f.exercises.map((ex, i) =>
        i !== exIdx ? ex : {
          ...ex,
          sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)),
        },
      ),
    }))
  }

  function addExSet(exIdx) {
    setForm((f) => ({
      ...f,
      exercises: f.exercises.map((ex, i) => {
        if (i !== exIdx) return ex
        const last = ex.sets[ex.sets.length - 1]
        return { ...ex, sets: [...ex.sets, { ...(last ?? blankSet()) }] }
      }),
    }))
  }

  function removeExSet(exIdx, setIdx) {
    setForm((f) => ({
      ...f,
      exercises: f.exercises.map((ex, i) =>
        i !== exIdx ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) },
      ),
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

  function addPreset(preset) {
    setForm((f) => ({ ...f, exercises: [...f.exercises, blankExercise(preset.name, preset.liftRef)] }))
  }

  function saveCycle() {
    if (!cycleForm) return
    const cycle = { ...cycleForm, id: cycleForm.id ?? crypto.randomUUID(), name: cycleForm.name.trim() || 'My Cycle' }
    if (cycleForm.id) updateCycle(cycleForm.id, cycle)
    else addCycle(cycle)
    setCycleForm(null)
  }

  return (
    <div className="space-y-6">
      {/* Templates */}
      <Card
        title="Workouts"
        action={!form && (
          <button
            onClick={() => { setForm(blankForm()); setCycleForm(null) }}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition"
          >
            + New Workout
          </button>
        )}
      >
        {templates.length === 0 && !form && (
          <p className="py-4 text-center text-sm text-slate-400">No workouts yet. Create one to get started.</p>
        )}

        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-slate-800">{t.name}</p>
                <div className="flex gap-3">
                  <button onClick={() => { setForm(templateToForm(t, isMetric)); setCycleForm(null) }} className="text-xs text-brand-700 hover:text-brand-600">Edit</button>
                  <button onClick={() => { if (confirm(`Delete "${t.name}"?`)) deleteWorkoutTemplate(t.id) }} className="text-xs text-slate-400 hover:text-rose-500">Delete</button>
                </div>
              </div>
              <p className="text-xs text-slate-500">{t.exercises.map((e) => e.name).join(' · ')}</p>
            </div>
          ))}
        </div>

        {/* Inline edit form */}
        {form && (
          <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4 space-y-4">
            <input
              type="text"
              placeholder="Workout name (e.g. Thursday — Bench + Pull)"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
            />

            {/* Quick-add presets */}
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Quick-add:</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_EXERCISES.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => addPreset(p)}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-brand-200 hover:text-brand-700 transition"
                  >
                    + {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercises */}
            <div className="space-y-4">
              {form.exercises.map((ex, exIdx) => (
                <ExerciseForm
                  key={ex._key}
                  ex={ex}
                  exIdx={exIdx}
                  isFirst={exIdx === 0}
                  isLast={exIdx === form.exercises.length - 1}
                  isMetric={isMetric}
                  wtUnit={wtUnit}
                  onNameChange={(v) => setForm((f) => ({ ...f, exercises: f.exercises.map((e, i) => i === exIdx ? { ...e, name: v } : e) }))}
                  onSetChange={(setIdx, patch) => updateExSet(exIdx, setIdx, patch)}
                  onAddSet={() => addExSet(exIdx)}
                  onRemoveSet={(setIdx) => removeExSet(exIdx, setIdx)}
                  onMoveUp={() => moveExercise(exIdx, -1)}
                  onMoveDown={() => moveExercise(exIdx, 1)}
                  onRemove={() => setForm((f) => ({ ...f, exercises: f.exercises.filter((_, i) => i !== exIdx) }))}
                  canRemove={form.exercises.length > 1}
                />
              ))}
            </div>

            <button
              onClick={() => setForm((f) => ({ ...f, exercises: [...f.exercises, blankExercise()] }))}
              className="text-xs font-medium text-brand-700 hover:text-brand-600"
            >
              + Add Exercise
            </button>

            <div className="flex gap-2 pt-1 border-t border-brand-200">
              <button onClick={handleSave} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition">Save</button>
              <button onClick={() => setForm(null)} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 transition">Cancel</button>
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
                  <span className="w-8 shrink-0 text-xs font-medium text-slate-500">{label}</span>
                  <select
                    value={assigned}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '__unassigned__') clearWeeklyDay(dow)
                      else setWeeklyDay(dow, val === 'rest' ? null : val)
                    }}
                    className="flex-1 rounded-lg px-3 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
                  >
                    <option value="__unassigned__">— Unassigned (use cycle fallback)</option>
                    <option value="rest">Rest Day</option>
                    {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-slate-400">"Unassigned" falls through to an active cycle below. "Rest Day" blocks the cycle.</p>
        </Card>
      )}

      {/* Cycles */}
      {templates.length > 0 && (
        <Card
          title="Rotating Cycles"
          subtitle="Repeats its sequence from a start date on unassigned days"
          action={!cycleForm && (
            <button
              onClick={() => setCycleForm({ id: null, name: '', startDate: new Date().toISOString().slice(0, 10), days: ['rest'] })}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition"
            >
              + New Cycle
            </button>
          )}
        >
          {schedule.cycles.length === 0 && !cycleForm && (
            <p className="py-2 text-center text-sm text-slate-400">No cycles yet.</p>
          )}
          <div className="space-y-3">
            {schedule.cycles.map((c) => (
              <div key={c.id} className={`rounded-xl p-3 ${schedule.activeCycleId === c.id ? 'bg-brand-50 ring-1 ring-brand-200' : 'bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">Starts {c.startDate} · {c.days.length}-day cycle</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setActiveCycle(schedule.activeCycleId === c.id ? null : c.id)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${schedule.activeCycleId === c.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {schedule.activeCycleId === c.id ? 'Active' : 'Activate'}
                    </button>
                    <button onClick={() => setCycleForm({ ...c })} className="text-xs text-brand-700 hover:text-brand-600">Edit</button>
                    <button onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteCycle(c.id) }} className="text-xs text-slate-400 hover:text-rose-500">Delete</button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.days.map((d, i) => (
                    <span key={i} className={`rounded-md px-2 py-0.5 text-xs ${d === 'rest' ? 'bg-slate-200 text-slate-500' : 'bg-brand-100 text-brand-700'}`}>
                      {d === 'rest' ? 'Rest' : (templates.find((t) => t.id === d)?.name ?? '?')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {cycleForm && (
            <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4 space-y-3">
              <input type="text" placeholder="Cycle name (e.g. PPL)" value={cycleForm.name} onChange={(e) => setCycleForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600" />
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 whitespace-nowrap">Start date</label>
                <input type="date" value={cycleForm.startDate} onChange={(e) => setCycleForm((f) => ({ ...f, startDate: e.target.value }))} className="rounded-lg px-3 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Days</p>
                {cycleForm.days.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-12">Day {i + 1}</span>
                    <select value={d} onChange={(e) => setCycleForm((f) => { const days = [...f.days]; days[i] = e.target.value; return { ...f, days } })} className="flex-1 rounded-lg px-3 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600">
                      <option value="rest">Rest Day</option>
                      {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <button onClick={() => setCycleForm((f) => ({ ...f, days: f.days.filter((_, j) => j !== i) }))} disabled={cycleForm.days.length === 1} className="text-slate-400 hover:text-rose-500 disabled:opacity-30">×</button>
                  </div>
                ))}
                <button onClick={() => setCycleForm((f) => ({ ...f, days: [...f.days, 'rest'] }))} className="text-xs font-medium text-brand-700 hover:text-brand-600">+ Add Day</button>
              </div>
              <div className="flex gap-2 pt-1 border-t border-brand-200">
                <button onClick={saveCycle} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition">Save Cycle</button>
                <button onClick={() => setCycleForm(null)} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 transition">Cancel</button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

function ExerciseForm({ ex, exIdx, isFirst, isLast, isMetric, wtUnit, onNameChange, onSetChange, onAddSet, onRemoveSet, onMoveUp, onMoveDown, onRemove, canRemove }) {
  return (
    <div className="rounded-xl bg-slate-100 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Exercise name"
          value={ex.name}
          onChange={(e) => onNameChange(e.target.value)}
          className="flex-1 rounded-lg px-2.5 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
        />
        <button onClick={onMoveUp} disabled={isFirst} className="text-slate-400 hover:text-slate-600 disabled:opacity-25 text-sm px-1">↑</button>
        <button onClick={onMoveDown} disabled={isLast} className="text-slate-400 hover:text-slate-600 disabled:opacity-25 text-sm px-1">↓</button>
        {canRemove && <button onClick={onRemove} className="text-slate-400 hover:text-rose-500 text-sm px-1">×</button>}
      </div>

      {/* Per-set rows */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-[1.5rem_2.5rem_1fr_1.5rem] gap-1.5 text-[10px] font-medium text-slate-400 px-0.5">
          <span>#</span><span>Reps</span><span>Weight</span><span />
        </div>
        {ex.sets.map((s, setIdx) => (
          <div key={setIdx} className="grid grid-cols-[1.5rem_2.5rem_1fr_1.5rem] gap-1.5 items-center">
            <span className="text-center text-xs text-slate-500">{setIdx + 1}</span>
            <input
              type="number" min={1} value={s.reps}
              onChange={(e) => onSetChange(setIdx, { reps: e.target.value })}
              className="rounded px-1.5 py-1 text-sm text-center ring-1 ring-slate-200 outline-none focus:ring-brand-600"
            />
            <WeightInput s={s} setIdx={setIdx} isMetric={isMetric} wtUnit={wtUnit} onChange={(patch) => onSetChange(setIdx, patch)} />
            <button onClick={() => onRemoveSet(setIdx)} disabled={ex.sets.length === 1} className="text-slate-400 hover:text-rose-500 disabled:opacity-25 text-sm text-center">×</button>
          </div>
        ))}
      </div>
      <button onClick={onAddSet} className="text-xs font-medium text-brand-700 hover:text-brand-600">+ Add Set</button>
    </div>
  )
}

function WeightInput({ s, isMetric, wtUnit, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <select
        value={s.weightType}
        onChange={(e) => onChange({ weightType: e.target.value })}
        className="rounded px-1.5 py-1 text-xs ring-1 ring-slate-200 outline-none focus:ring-brand-600 shrink-0"
      >
        <option value="fixed">Fixed</option>
        <option value="bodyweight">BW</option>
        <option value="percent1rm">% 1RM</option>
      </select>

      {s.weightType === 'fixed' && (
        <div className="flex items-center gap-1 flex-1">
          <input
            type="number" min={0} step={isMetric ? 0.5 : 2.5}
            value={s.weightLb ?? 0}
            onChange={(e) => onChange({ weightLb: e.target.value })}
            className="w-full rounded px-1.5 py-1 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
          />
          <span className="text-xs text-slate-400 shrink-0">{wtUnit}</span>
        </div>
      )}

      {s.weightType === 'bodyweight' && (
        <span className="text-xs text-slate-500 px-1.5">Body weight</span>
      )}

      {s.weightType === 'percent1rm' && (
        <div className="flex items-center gap-1 flex-1">
          <input
            type="number" min={1} max={200}
            value={s.percentage ?? 75}
            onChange={(e) => onChange({ percentage: e.target.value })}
            className="w-14 rounded px-1.5 py-1 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
          />
          <span className="text-xs text-slate-400">%</span>
          <select
            value={s.liftRef ?? 'bench'}
            onChange={(e) => onChange({ liftRef: e.target.value })}
            className="flex-1 rounded px-1.5 py-1 text-xs ring-1 ring-slate-200 outline-none focus:ring-brand-600"
          >
            {LIFT_REFS.map((r) => <option key={r} value={r}>{LIFT_NAMES[r]}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}
