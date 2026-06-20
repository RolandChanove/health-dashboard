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
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium text-slate-700">{exercise.name}</p>
        <span className="text-xs text-slate-400">{doneCount}/{exercise.sets.length}</span>
      </div>

      <div className="grid grid-cols-[1.5rem_1fr_1fr_1.5rem] gap-x-2 mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        <span>#</span>
        <span>Plan</span>
        <span>Actual</span>
        <span />
      </div>

      <div className="space-y-1.5">
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

      {/* Notes / RPE area */}
      <div className="mt-2 pt-2 border-t border-slate-200">
        {!locked && (
          <button
            onClick={() => setShowNotes((v) => !v)}
            className="text-xs text-slate-400 hover:text-brand-700"
          >
            {showNotes ? '▲ Hide notes' : `▼ RPE / notes${exercise.rpe != null ? ` · RPE ${exercise.rpe}` : ''}${exercise.notes ? ' · has notes' : ''}`}
          </button>
        )}
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
                  <label className="text-xs text-slate-500 shrink-0">RPE (1–10)</label>
                  <input
                    type="number" min={1} max={10} step={0.5}
                    value={exercise.rpe ?? ''}
                    onChange={(e) => updateNotes({ rpe: e.target.value === '' ? null : Number(e.target.value) })}
                    className="w-16 rounded-lg px-2 py-1 text-xs ring-1 ring-slate-200 outline-none focus:ring-brand-600"
                    placeholder="—"
                  />
                </div>
                <textarea
                  rows={2}
                  value={exercise.notes ?? ''}
                  onChange={(e) => updateNotes({ notes: e.target.value })}
                  placeholder="Form notes, how it felt, deload next week…"
                  className="w-full rounded-lg px-2 py-1.5 text-xs ring-1 ring-slate-200 outline-none focus:ring-brand-600 resize-none"
                />
              </>
            )}
          </div>
        )}
      </div>

      {!locked && (
        <button onClick={() => addSet(sessionId, exIdx)} className="mt-2 text-xs font-medium text-brand-700 hover:text-brand-600">
          + Add set
        </button>
      )}
    </div>
  )
}

function SetRow({ set, setIdx, isMetric, locked, onChange, onRemove, canRemove }) {
  const { planned, actual } = set
  const done = actual.done

  const planLabel = (() => {
    if (!planned) return '—'
    if (planned.weightType === 'bodyweight') return `BW × ${planned.reps}`
    if (planned.weightType === 'percent1rm') return `${planned.percentage}% × ${planned.reps}`
    const w = isMetric ? `${round(lbToKg(planned.weightLb), 1)}kg` : `${planned.weightLb}lb`
    return `${w} × ${planned.reps}`
  })()

  const actualWeightDisplay = isMetric ? round(lbToKg(actual.weightLb), 1) : actual.weightLb

  return (
    <div className={`grid grid-cols-[1.5rem_1fr_1fr_1.5rem] gap-x-2 items-center rounded-lg px-1 py-0.5 ${done ? 'bg-emerald-900/20' : ''}`}>
      {/* Set number */}
      <span className={`text-center text-xs font-bold ${done ? 'text-emerald-500' : 'text-slate-400'}`}>
        {setIdx + 1}
      </span>

      {/* Plan (read-only) */}
      <span className={`text-xs ${done ? 'text-slate-500 line-through' : 'text-slate-600'}`}>
        {planLabel}
      </span>

      {/* Actual */}
      {locked || done ? (
        <span className="text-xs text-slate-700">
          {isMetric ? `${round(lbToKg(actual.weightLb), 1)}kg` : `${actual.weightLb}lb`} × {actual.reps}
          {done && <span className="ml-1 text-emerald-500">✓</span>}
        </span>
      ) : (
        <div className="flex items-center gap-1">
          <input
            type="number" min={0} step={isMetric ? 0.5 : 2.5}
            value={actualWeightDisplay}
            onChange={(e) => {
              const lb = isMetric ? kgToLb(Number(e.target.value)) : Number(e.target.value)
              onChange({ weightLb: round(lb, 2) })
            }}
            className="w-14 rounded px-1.5 py-1 text-xs ring-1 ring-slate-200 outline-none focus:ring-brand-600"
          />
          <span className="text-slate-400 text-[10px]">×</span>
          <input
            type="number" min={1}
            value={actual.reps}
            onChange={(e) => onChange({ reps: Number(e.target.value) })}
            className="w-10 rounded px-1.5 py-1 text-xs ring-1 ring-slate-200 outline-none focus:ring-brand-600"
          />
          <button
            onClick={() => onChange({ done: true })}
            className="rounded px-1.5 py-1 text-xs bg-slate-200 text-slate-500 hover:bg-emerald-700 hover:text-white transition"
            title="Mark done"
          >
            ✓
          </button>
        </div>
      )}

      {/* Remove */}
      {!locked && canRemove ? (
        <button onClick={onRemove} className="text-slate-400 hover:text-rose-500 text-center leading-none">×</button>
      ) : (
        <span />
      )}
    </div>
  )
}
