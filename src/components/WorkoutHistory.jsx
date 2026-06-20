import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useProfile } from '../context/ProfileContext.jsx'
import { lbToKg, round } from '../lib/units.js'
import { Card } from './ui/Card.jsx'

function shortDate(iso) {
  const [, m, d] = iso.split('-')
  return `${Number(m)}/${Number(d)}`
}

export function WorkoutHistory() {
  const { workouts, profile, deleteSession } = useProfile()
  const isMetric = profile.units === 'metric'
  const wtUnit = isMetric ? 'kg' : 'lb'

  const { templates, sessions } = workouts
  const completed = [...sessions]
    .filter((s) => s.completed)
    .sort((a, b) => b.date.localeCompare(a.date))

  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [selectedExerciseName, setSelectedExerciseName] = useState('')

  const filteredSessions = selectedTemplateId
    ? completed.filter((s) => s.templateId === selectedTemplateId)
    : completed

  // Collect unique exercise names from filtered sessions
  const exerciseNames = useMemo(() => {
    const names = new Set()
    filteredSessions.forEach((s) => s.exercises.forEach((e) => names.add(e.name)))
    return [...names]
  }, [filteredSessions])

  // Auto-select first exercise when template changes
  const activeExercise = exerciseNames.includes(selectedExerciseName)
    ? selectedExerciseName
    : exerciseNames[0] ?? ''

  // Chart data: max weight per session for the selected exercise
  const chartData = useMemo(() => {
    return [...filteredSessions]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((s) => {
        const ex = s.exercises.find((e) => e.name === activeExercise)
        const doneSets = ex?.sets.filter((set) => set.done) ?? []
        const maxLb = doneSets.length > 0 ? Math.max(...doneSets.map((set) => set.weightLb)) : null
        const maxDisplay = maxLb != null ? (isMetric ? round(lbToKg(maxLb), 1) : maxLb) : null
        return { date: shortDate(s.date), weight: maxDisplay }
      })
      .filter((d) => d.weight != null)
  }, [filteredSessions, activeExercise, isMetric])

  if (completed.length === 0) {
    return (
      <Card title="History">
        <p className="text-center text-sm text-slate-400 py-6">
          No completed workouts yet. Finish a session to see your history.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <Card title="Progression">
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={selectedTemplateId}
            onChange={(e) => { setSelectedTemplateId(e.target.value); setSelectedExerciseName('') }}
            className="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-500"
          >
            <option value="">All Workouts</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {exerciseNames.length > 0 && (
            <select
              value={activeExercise}
              onChange={(e) => setSelectedExerciseName(e.target.value)}
              className="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-500"
            >
              {exerciseNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          )}
        </div>

        {chartData.length >= 2 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit={` ${wtUnit}`} />
              <Tooltip formatter={(v) => [`${v} ${wtUnit}`, 'Max Weight']} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-sm text-slate-400 py-4">
            {chartData.length === 1
              ? 'One session so far — keep going to see a trend.'
              : 'No data for selected exercise.'}
          </p>
        )}
      </Card>

      {/* Session list */}
      <Card title={`Sessions (${filteredSessions.length})`}>
        <div className="space-y-3">
          {filteredSessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              isMetric={isMetric}
              wtUnit={wtUnit}
              onDelete={() => {
                if (confirm('Delete this session from history?')) deleteSession(s.id)
              }}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}

function SessionCard({ session, isMetric, wtUnit, onDelete }) {
  const [open, setOpen] = useState(false)

  const totalSets = session.exercises.reduce((n, ex) => n + ex.sets.filter((s) => s.done).length, 0)
  const totalVol = session.exercises.reduce(
    (n, ex) =>
      n +
      ex.sets
        .filter((s) => s.done)
        .reduce((acc, s) => acc + s.reps * (isMetric ? lbToKg(s.weightLb) : s.weightLb), 0),
    0,
  )

  return (
    <div className="rounded-xl bg-slate-50 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div>
          <p className="font-medium text-slate-800">{session.templateName}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {session.date} · {totalSets} sets · {round(totalVol, 0).toLocaleString()} {wtUnit} volume
          </p>
        </div>
        <span className="text-slate-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-200">
          {session.exercises.map((ex, i) => (
            <div key={i} className="mt-3">
              <p className="text-sm font-medium text-slate-700 mb-1">{ex.name}</p>
              <div className="space-y-0.5">
                {ex.sets.map((set, j) => (
                  <div key={j} className={`flex gap-3 text-xs ${set.done ? 'text-slate-600' : 'text-slate-300'}`}>
                    <span className="w-4">{j + 1}</span>
                    <span>
                      {isMetric ? round(lbToKg(set.weightLb), 1) : set.weightLb} {wtUnit}
                    </span>
                    <span>× {set.reps} reps</span>
                    {!set.done && <span className="text-slate-300">skipped</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={onDelete}
            className="mt-2 text-xs text-slate-400 hover:text-rose-500"
          >
            Delete session
          </button>
        </div>
      )}
    </div>
  )
}
