import { useState } from 'react'
import { useProfile } from '../context/ProfileContext.jsx'
import { resolveWorkoutForDate, isoDaysAgo } from '../lib/storage.js'
import { lbToKg, kgToLb, round } from '../lib/units.js'
import { Card } from './ui/Card.jsx'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function fmtLb(lb, isMetric) {
  if (isMetric) return `${round(lbToKg(lb), 1)} kg`
  return `${lb} lb`
}

export function TodayWorkout({ onGoToWorkouts }) {
  const { workouts, profile, startWorkoutSession, updateSet, addSet, removeSet, completeSession, deleteSession, updateExerciseNotes } = useProfile()

  const today = isoDaysAgo(0)
  const dayName = DAY_NAMES[new Date(today + 'T12:00:00').getDay()]
  const session = workouts.sessions.find((s) => s.date === today)
  const template = resolveWorkoutForDate(workouts, today)
  const isMetric = profile.units === 'metric'

  // Rest day
  if (!template && !session) {
    return (
      <Card title="Today's Workout">
        <div className="py-6 text-center">
          <p className="font-semibold text-slate-700">{dayName} — Rest Day</p>
          <p className="mt-1 text-sm text-slate-400">No workout scheduled.</p>
          {onGoToWorkouts && (
            <button onClick={onGoToWorkouts} className="mt-3 text-sm font-medium text-brand-700 hover:text-brand-600">
              Set up a schedule →
            </button>
          )}
        </div>
      </Card>
    )
  }

  // Template scheduled, not started yet
  if (!session) {
    return (
      <Card title={`${dayName} — ${template.name}`}>
        <div className="space-y-1.5 mb-4">
          {template.exercises.map((ex) => (
            <div key={ex.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-700">{ex.name}</span>
              <span className="text-slate-500">
                {ex.sets.length} sets · {ex.sets[0] && SetPreviewLabel(ex.sets[0], isMetric)}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={() => startWorkoutSession(template, today)}
          className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition"
        >
          Start Workout
        </button>
      </Card>
    )
  }

  // Active / completed session
  const doneCount = session.exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.actual.done).length, 0)
  const totalCount = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
  const allDone = totalCount > 0 && doneCount === totalCount

  return (
    <Card
      title={session.templateName}
      subtitle={`${dayName}${session.completed ? ' · Completed ✓' : ` · ${doneCount}/${totalCount} sets done`}`}
      action={
        !session.completed && (
          <button onClick={() => { if (confirm('Delete this workout session?')) deleteSession(session.id) }} className="text-xs text-slate-400 hover:text-rose-500">
            Delete
          </button>
        )
      }
    >
      {/* Progress bar */}
      <div className="mb-4 h-1 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full rounded-full bg-brand-600 transition-all duration-300" style={{ width: totalCount ? `${(doneCount / totalCount) * 100}%` : '0%' }} />
      </div>

      <div className="space-y-5">
        {session.exercises.map((ex, exIdx) => (
          <ExerciseLogger
            key={ex.exerciseId ?? exIdx}
            exercise={ex}
            exIdx={exIdx}
            sessionId={session.id}
            isMetric={isMetric}
            locked={session.completed}
            updateSet={updateSet}
            addSet={addSet}
            removeSet={removeSet}
            updateNotes={(patch) => updateExerciseNotes(session.id, exIdx, patch)}
          />
        ))}

        {!session.completed && (
          <button
            onClick={() => completeSession(session.id)}
            className={`w-full rounded-xl py-2.5 text-sm font-semibold text-white transition ${allDone ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'}`}
          >
            {allDone ? '✓ Complete Workout' : 'Finish Early'}
          </button>
        )}
      </div>
    </Card>
  )
}

function SetPreviewLabel(setDef, isMetric) {
  if (!setDef) return ''
  if (setDef.weightType === 'bodyweight') return 'BW'
  if (setDef.weightType === 'percent1rm') return `${setDef.percentage}% 1RM`
  return fmtLb(setDef.weightLb ?? 0, isMetric)
}

function ExerciseLogger({ exercise, exIdx, sessionId, isMetric, locked, updateSet, addSet, removeSet, updateNotes }) {
  const doneCount = exercise.sets.filter((s) => s.actual.done).length
  const [showNotes, setShowNotes] = useState(false)

  return (
    <div className="rounded-xl bg-slate-50 p-3">
      {/* Exercise header */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-slate-700 text-sm">{exercise.name}</p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${doneCount === exercise.sets.length ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-200 text-slate-500'}`}>
          {doneCount}/{exercise.sets.length}
        </span>
      </div>

      <div className="space-y-2">
        {exercise.sets.map((set, setIdx) => (
          <SetRow
            key={setIdx}
            set={set}
            setIdx={setIdx}
            isMetric={isMetric}
            locked={locked}
            onChange={(patch) => updateSet(sessionId, exIdx, setIdx, patch)}
            onRemove={() => removeSet(sessionId, exIdx, setIdx)}
            canRemove={exercise.sets.length > 1}
          />
        ))}
      </div>

      {/* Add set + notes */}
      <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
        {!locked && (
          <button onClick={() => addSet(sessionId, exIdx)} className="text-sm font-medium text-brand-700 hover:text-brand-600 py-1">
            + Add set
          </button>
        )}
        {!locked && (
          <button
            onClick={() => setShowNotes((v) => !v)}
            className="text-xs text-slate-400 hover:text-brand-700 py-1 ml-auto"
          >
            {showNotes ? '▲ Hide' : `RPE / notes${exercise.rpe != null ? ` · ${exercise.rpe}` : ''}${exercise.notes ? ' ✎' : ''}`}
          </button>
        )}
      </div>

      {(showNotes || locked) && (exercise.rpe != null || exercise.notes || !locked) && (
        <div className="mt-2 space-y-2">
          {locked ? (
            <>
              {exercise.rpe != null && <p className="text-xs text-slate-500">RPE <span className="font-semibold text-slate-700">{exercise.rpe}/10</span></p>}
              {exercise.notes && <p className="text-xs text-slate-500 italic">{exercise.notes}</p>}
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-500 shrink-0">RPE</label>
                <input
                  type="number" min={1} max={10} step={0.5}
                  inputMode="decimal"
                  value={exercise.rpe ?? ''}
                  onChange={(e) => updateNotes({ rpe: e.target.value === '' ? null : Number(e.target.value) })}
                  className="w-16 rounded-lg px-2 py-1.5 text-base ring-1 ring-slate-200 outline-none focus:ring-brand-600"
                  placeholder="—"
                />
              </div>
              <textarea
                rows={2}
                value={exercise.notes ?? ''}
                onChange={(e) => updateNotes({ notes: e.target.value })}
                placeholder="Form notes, how it felt…"
                className="w-full rounded-lg px-2 py-2 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600 resize-none"
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

function SetRow({ set, setIdx, isMetric, locked, onChange, onRemove, canRemove }) {
  const { planned, actual } = set
  const done = actual.done
  const weightStep = isMetric ? 2.5 : 5

  const planLabel = (() => {
    if (!planned) return '—'
    if (planned.weightType === 'bodyweight') return `BW × ${planned.reps}`
    if (planned.weightType === 'percent1rm') return `${planned.percentage}% × ${planned.reps}`
    const w = isMetric ? `${round(lbToKg(planned.weightLb), 1)}` : `${planned.weightLb}`
    return `${w}${isMetric ? 'kg' : 'lb'} × ${planned.reps}`
  })()

  const weightDisplay = isMetric ? round(lbToKg(actual.weightLb), 1) : actual.weightLb

  // Completed set — compact read-only row
  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-900/20 px-3 py-2">
        <span className="text-xs font-bold text-emerald-500 w-5 text-center">{setIdx + 1}</span>
        <span className="flex-1 text-sm text-slate-600 line-through">{planLabel}</span>
        <span className="text-sm font-medium text-emerald-400">
          {weightDisplay}{isMetric ? 'kg' : 'lb'} × {actual.reps} ✓
        </span>
        {!locked && (
          <button
            onClick={() => onChange({ done: false })}
            className="text-slate-500 text-xs hover:text-rose-400 ml-1"
            title="Undo"
          >↩</button>
        )}
      </div>
    )
  }

  // Locked (completed session) — plain read
  if (locked) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-xs font-bold text-slate-400 w-5 text-center">{setIdx + 1}</span>
        <span className="flex-1 text-sm text-slate-500">{planLabel}</span>
        <span className="text-sm text-slate-700">{weightDisplay}{isMetric ? 'kg' : 'lb'} × {actual.reps}</span>
      </div>
    )
  }

  // Active set — big inputs for mobile
  return (
    <div className="rounded-xl bg-slate-100 p-2">
      {/* Plan hint */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Set {setIdx + 1}</span>
        <span className="text-[10px] text-slate-400">Plan: {planLabel}</span>
        {canRemove && (
          <button onClick={onRemove} className="text-slate-400 hover:text-rose-500 text-base leading-none ml-2">×</button>
        )}
      </div>

      {/* Weight / reps / done — large touch targets */}
      <div className="flex items-center gap-2">
        {/* Weight */}
        <div className="flex items-center flex-1 rounded-lg ring-1 ring-slate-200 bg-slate-50 overflow-hidden">
          <button
            onClick={() => {
              const newVal = round(weightDisplay - weightStep, 2)
              const lb = isMetric ? kgToLb(Math.max(0, newVal)) : Math.max(0, newVal)
              onChange({ weightLb: round(lb, 2) })
            }}
            className="px-2.5 py-3 text-slate-400 hover:text-slate-700 text-lg font-light select-none"
          >−</button>
          <input
            type="number" min={0} step={weightStep}
            inputMode="decimal"
            value={weightDisplay}
            onChange={(e) => {
              const lb = isMetric ? kgToLb(Number(e.target.value)) : Number(e.target.value)
              onChange({ weightLb: round(lb, 2) })
            }}
            className="w-0 flex-1 text-center text-base font-semibold bg-transparent outline-none text-slate-800 py-3"
          />
          <span className="text-xs text-slate-400 pr-1">{isMetric ? 'kg' : 'lb'}</span>
          <button
            onClick={() => {
              const newVal = round(weightDisplay + weightStep, 2)
              const lb = isMetric ? kgToLb(newVal) : newVal
              onChange({ weightLb: round(lb, 2) })
            }}
            className="px-2.5 py-3 text-slate-400 hover:text-slate-700 text-lg font-light select-none"
          >+</button>
        </div>

        <span className="text-slate-400 text-sm">×</span>

        {/* Reps */}
        <div className="flex items-center rounded-lg ring-1 ring-slate-200 bg-slate-50 overflow-hidden">
          <button
            onClick={() => onChange({ reps: Math.max(1, actual.reps - 1) })}
            className="px-2 py-3 text-slate-400 hover:text-slate-700 text-lg font-light select-none"
          >−</button>
          <input
            type="number" min={1}
            inputMode="numeric"
            value={actual.reps}
            onChange={(e) => onChange({ reps: Math.max(1, Number(e.target.value)) })}
            className="w-8 text-center text-base font-semibold bg-transparent outline-none text-slate-800 py-3"
          />
          <button
            onClick={() => onChange({ reps: actual.reps + 1 })}
            className="px-2 py-3 text-slate-400 hover:text-slate-700 text-lg font-light select-none"
          >+</button>
        </div>

        {/* Done button — large green CTA */}
        <button
          onClick={() => onChange({ done: true })}
          className="rounded-xl bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-600 text-white font-bold text-base px-4 py-3 transition select-none"
          title="Mark set done"
        >
          ✓
        </button>
      </div>
    </div>
  )
}
