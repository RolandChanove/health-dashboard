import { useProfile } from '../context/ProfileContext.jsx'
import { resolveWorkoutForDate, isoDaysAgo } from '../lib/storage.js'
import { lbToKg, kgToLb, round } from '../lib/units.js'
import { Card } from './ui/Card.jsx'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function TodayWorkout({ onGoToWorkouts }) {
  const {
    workouts,
    profile,
    startWorkoutSession,
    updateSet,
    addSet,
    removeSet,
    completeSession,
    deleteSession,
  } = useProfile()

  const today = isoDaysAgo(0)
  const dayName = DAY_NAMES[new Date(today + 'T12:00:00').getDay()]
  const session = workouts.sessions.find((s) => s.date === today)
  const template = resolveWorkoutForDate(workouts, today)
  const isMetric = profile.units === 'metric'
  const wtUnit = isMetric ? 'kg' : 'lb'

  // Rest day — no template scheduled and no active session
  if (!template && !session) {
    return (
      <Card title="Today's Workout">
        <div className="py-6 text-center">
          <p className="font-semibold text-slate-700">{dayName} — Rest Day</p>
          <p className="mt-1 text-sm text-slate-400">No workout scheduled.</p>
          {onGoToWorkouts && (
            <button
              onClick={onGoToWorkouts}
              className="mt-3 text-sm font-medium text-brand-600 hover:underline"
            >
              Set up a schedule →
            </button>
          )}
        </div>
      </Card>
    )
  }

  // Template scheduled but not started yet
  if (!session) {
    return (
      <Card title={`${dayName} — ${template.name}`}>
        <div className="space-y-1.5 mb-4">
          {template.exercises.map((ex) => (
            <div key={ex.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-700">{ex.name}</span>
              <span className="text-slate-400">
                {ex.defaultSets} × {ex.defaultReps}{' '}
                {ex.defaultWeightLb > 0 &&
                  `@ ${isMetric ? round(lbToKg(ex.defaultWeightLb), 1) : ex.defaultWeightLb} ${wtUnit}`}
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

  // Active or completed session
  const allDone =
    session.exercises.every((ex) => ex.sets.length > 0 && ex.sets.every((s) => s.done))

  return (
    <Card
      title={session.templateName}
      subtitle={`${dayName}${session.completed ? ' · Completed ✓' : ' · In Progress'}`}
      action={
        !session.completed && (
          <button
            onClick={() => {
              if (confirm('Delete this workout session?')) deleteSession(session.id)
            }}
            className="text-xs text-slate-400 hover:text-rose-500"
          >
            Delete
          </button>
        )
      }
    >
      <div className="space-y-4">
        {session.exercises.map((ex, exIdx) => (
          <ExerciseLogger
            key={ex.exerciseId}
            exercise={ex}
            exIdx={exIdx}
            sessionId={session.id}
            isMetric={isMetric}
            wtUnit={wtUnit}
            locked={session.completed}
            updateSet={updateSet}
            addSet={addSet}
            removeSet={removeSet}
          />
        ))}

        {!session.completed && (
          <button
            onClick={() => completeSession(session.id)}
            className={`w-full rounded-xl py-2.5 text-sm font-semibold text-white transition ${
              allDone
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-slate-400 hover:bg-slate-500'
            }`}
          >
            {allDone ? '✓ Complete Workout' : 'Finish Early'}
          </button>
        )}
      </div>
    </Card>
  )
}

function ExerciseLogger({ exercise, exIdx, sessionId, isMetric, wtUnit, locked, updateSet, addSet, removeSet }) {
  const doneCount = exercise.sets.filter((s) => s.done).length

  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium text-slate-700">{exercise.name}</p>
        <span className="text-xs text-slate-400">
          {doneCount}/{exercise.sets.length} sets
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="grid grid-cols-[1.5rem_1fr_1fr_1.5rem] gap-2 px-1 text-xs font-medium text-slate-400">
          <span>#</span>
          <span>{wtUnit}</span>
          <span>Reps</span>
          <span />
        </div>

        {exercise.sets.map((set, setIdx) => {
          const displayWeight = isMetric ? round(lbToKg(set.weightLb), 1) : set.weightLb
          return (
            <div
              key={setIdx}
              className={`grid grid-cols-[1.5rem_1fr_1fr_1.5rem] gap-2 items-center ${
                set.done ? 'opacity-60' : ''
              }`}
            >
              <span
                className={`text-center text-xs font-bold ${
                  set.done ? 'text-emerald-600' : 'text-slate-300'
                }`}
              >
                {setIdx + 1}
              </span>
              <input
                type="number"
                value={displayWeight}
                disabled={locked}
                onChange={(e) => {
                  const lb = isMetric ? kgToLb(Number(e.target.value)) : Number(e.target.value)
                  updateSet(sessionId, exIdx, setIdx, { weightLb: round(lb, 2) })
                }}
                className="w-full rounded-lg bg-white px-2 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-500 disabled:bg-slate-100"
              />
              <input
                type="number"
                value={set.reps}
                disabled={locked}
                onChange={(e) => updateSet(sessionId, exIdx, setIdx, { reps: Number(e.target.value) })}
                className="w-full rounded-lg bg-white px-2 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-500 disabled:bg-slate-100"
              />
              <input
                type="checkbox"
                checked={set.done}
                disabled={locked}
                onChange={(e) => updateSet(sessionId, exIdx, setIdx, { done: e.target.checked })}
                className="h-4 w-4 cursor-pointer accent-emerald-500"
              />
            </div>
          )
        })}
      </div>

      {!locked && (
        <div className="mt-2 flex gap-3">
          <button
            onClick={() => addSet(sessionId, exIdx)}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            + Add Set
          </button>
          {exercise.sets.length > 1 && (
            <button
              onClick={() => removeSet(sessionId, exIdx, exercise.sets.length - 1)}
              className="text-xs text-slate-400 hover:text-rose-500"
            >
              − Remove Set
            </button>
          )}
        </div>
      )}
    </div>
  )
}
