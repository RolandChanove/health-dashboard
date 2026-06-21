import { useState } from 'react'
import { useProfile } from '../context/ProfileContext.jsx'
import { Card } from './ui/Card.jsx'
import { SUGGESTED_PROGRAMS } from '../lib/suggestedPrograms.js'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_FULL  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function ProgramsTab() {
  const [selected, setSelected] = useState(null)

  if (selected) {
    return <ProgramDetail program={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Suggested Programs</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Pre-built plans you can import directly into your workout schedule.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SUGGESTED_PROGRAMS.map((prog) => (
          <button
            key={prog.id}
            onClick={() => setSelected(prog)}
            className="rounded-2xl bg-slate-50 p-5 text-left ring-1 ring-slate-200 hover:ring-brand-600 hover:bg-slate-100 transition group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 group-hover:text-brand-700 transition">{prog.name}</p>
                {prog.author && <p className="text-xs text-slate-400 mt-0.5">by {prog.author}</p>}
              </div>
              <span className="text-slate-400 text-lg shrink-0">→</span>
            </div>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">{prog.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {prog.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-brand-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {prog.days.filter((d) => !d.isRest).length} training days · {prog.days.reduce((n, d) => n + d.exercises.length, 0)} total exercises
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Program detail + import ──────────────────────────────────────────────────

function ProgramDetail({ program, onBack }) {
  const { workouts, addWorkoutTemplate, setWeeklyDay, clearWeeklyDay } = useProfile()
  const [activeDay, setActiveDay] = useState(0)
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(false)

  const trainingDays = program.days.filter((d) => !d.isRest)
  const restDays     = program.days.filter((d) => d.isRest)

  function handleImport() {
    setImporting(true)

    // Create a template for each non-rest day
    const templates = trainingDays.map((day) => ({
      id: crypto.randomUUID(),
      name: day.name,
      exercises: day.exercises.map((ex) => ({
        id: crypto.randomUUID(),
        name: ex.name,
        sets: ex.sets,
        notes: ex.notes,
      })),
    }))

    templates.forEach(addWorkoutTemplate)

    // Assign to weekly schedule
    trainingDays.forEach((day, i) => {
      setWeeklyDay(day.dayOfWeek, templates[i].id)
    })
    // Clear rest days
    restDays.forEach((day) => clearWeeklyDay(day.dayOfWeek))

    setImporting(false)
    setImported(true)
  }

  const alreadyExists = workouts.templates.some((t) =>
    trainingDays.some((d) => t.name === d.name)
  )

  const currentDay = program.days[activeDay]

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div className="flex items-start gap-3">
        <button onClick={onBack} className="mt-0.5 shrink-0 text-slate-400 hover:text-slate-600 transition text-sm">
          ← Back
        </button>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-800">{program.name}</h2>
          {program.author && <p className="text-xs text-slate-400">{program.author}</p>}
        </div>
      </div>

      {/* Description card */}
      <Card title="Overview">
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{program.description}</p>

        {/* Weekly layout */}
        <div className="flex gap-1.5 flex-wrap mb-5">
          {program.days.map((day, i) => (
            <div
              key={i}
              className={`flex flex-col items-center rounded-xl px-2 py-2 min-w-[3rem] ${
                day.isRest ? 'bg-slate-100 text-slate-400' : 'bg-brand-200 text-brand-700'
              }`}
            >
              <span className="text-[10px] font-bold uppercase">{DAY_NAMES[day.dayOfWeek]}</span>
              <span className="text-[9px] mt-0.5 text-center leading-tight">
                {day.isRest ? 'Rest' : day.focus.split(' · ')[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Loading rules */}
        {program.loadingRules && (
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Loading Rules</p>
            <ul className="space-y-1">
              {program.loadingRules.map((rule, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-500">
                  <span className="text-brand-700 shrink-0 mt-0.5">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Import button */}
        {imported ? (
          <div className="rounded-xl bg-emerald-900/20 px-4 py-3 text-sm font-medium text-emerald-400">
            ✓ Program imported! Go to the Workouts tab to see your new templates and schedule.
          </div>
        ) : (
          <button
            onClick={handleImport}
            disabled={importing || alreadyExists}
            className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition disabled:opacity-50"
          >
            {alreadyExists
              ? 'Already imported (templates already exist)'
              : importing
              ? 'Importing…'
              : '⬇ Import Program to My Workouts'}
          </button>
        )}
        {alreadyExists && !imported && (
          <p className="mt-1.5 text-xs text-slate-400 text-center">
            Templates with these names already exist. Delete them first to re-import.
          </p>
        )}
      </Card>

      {/* Day-by-day view */}
      <Card title="Daily Breakdown">
        {/* Day tabs */}
        <div className="flex gap-1 flex-wrap mb-4 -mt-1">
          {program.days.map((day, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                activeDay === i
                  ? 'bg-brand-600 text-white'
                  : day.isRest
                  ? 'text-slate-400 hover:bg-slate-100'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {DAY_NAMES[day.dayOfWeek]}
            </button>
          ))}
        </div>

        {/* Active day detail */}
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-slate-800">{currentDay.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{DAY_FULL[currentDay.dayOfWeek]} · {currentDay.focus}</p>
          </div>

          {currentDay.isRest ? (
            <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-500">
              Active recovery day — yoga, mobility work, light core, foam rolling, optional sauna.
              Keep it easy; this is where you actually grow.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-2 text-left font-semibold text-slate-400 pr-3">Exercise</th>
                    <th className="pb-2 text-center font-semibold text-slate-400 px-2 whitespace-nowrap">Sets × Reps</th>
                    <th className="pb-2 text-left font-semibold text-slate-400 pl-3">Load / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentDay.exercises.map((ex, i) => {
                    const set0 = ex.sets[0]
                    const loadLabel = set0.weightType === 'bodyweight'
                      ? 'Bodyweight'
                      : set0.weightType === 'percent1rm'
                      ? `${set0.percentage}% 1RM`
                      : 'Set your load'
                    return (
                      <tr key={i} className={i % 2 === 0 ? '' : 'bg-slate-50/50'}>
                        <td className="py-2 pr-3 font-medium text-slate-700">{ex.name}</td>
                        <td className="py-2 px-2 text-center text-slate-500 whitespace-nowrap">
                          {ex.sets.length}×{set0.reps === 1 ? '—' : set0.reps}
                        </td>
                        <td className="py-2 pl-3 text-slate-400">
                          <span className="font-medium text-slate-600">{loadLabel}</span>
                          {ex.notes && <span className="ml-2 text-slate-400">· {ex.notes}</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Progression table */}
      {program.progression && (
        <Card title="4-Week Progression Wave">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-2 text-left font-semibold text-slate-400 pr-4 whitespace-nowrap">Week</th>
                  <th className="pb-2 text-left font-semibold text-slate-400 pr-4">Main Lifts</th>
                  <th className="pb-2 text-left font-semibold text-slate-400">Accessories</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {program.progression.map((row) => (
                  <tr key={row.week}>
                    <td className="py-2 pr-4 font-bold text-brand-700">W{row.week}</td>
                    <td className="py-2 pr-4 text-slate-600">{row.main}</td>
                    <td className="py-2 text-slate-500">{row.accessory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
