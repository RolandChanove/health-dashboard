import { useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useProfile } from '../context/ProfileContext.jsx'
import { lbToKg, round } from '../lib/units.js'
import { Card } from './ui/Card.jsx'

const CHART_GRID   = '#2E2E30'
const CHART_TICK   = '#8E8E92'
const LINE_COLOR   = '#9C3848'
const TT_STYLE     = { backgroundColor: '#141416', border: '1px solid #2E2E30', borderRadius: 8, fontSize: 12, color: '#E0E0E2' }

function shortDate(iso) {
  const [, m, d] = iso.split('-')
  return `${Number(m)}/${Number(d)}`
}

export function WorkoutHistory() {
  const { workouts, profile, deleteSession } = useProfile()
  const isMetric = profile.units === 'metric'
  const wtUnit = isMetric ? 'kg' : 'lb'

  const { templates, sessions } = workouts
  const completed = [...sessions].filter((s) => s.completed).sort((a, b) => b.date.localeCompare(a.date))

  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [selectedExerciseName, setSelectedExerciseName] = useState('')

  const filteredSessions = selectedTemplateId
    ? completed.filter((s) => s.templateId === selectedTemplateId)
    : completed

  const exerciseNames = useMemo(() => {
    const names = new Set()
    filteredSessions.forEach((s) => s.exercises.forEach((e) => names.add(e.name)))
    return [...names]
  }, [filteredSessions])

  const activeExercise = exerciseNames.includes(selectedExerciseName) ? selectedExerciseName : (exerciseNames[0] ?? '')

  const chartData = useMemo(() => {
    return [...filteredSessions]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((s) => {
        const ex = s.exercises.find((e) => e.name === activeExercise)
        const doneSets = ex?.sets.filter((set) => set.actual?.done ?? set.done) ?? []
        const maxLb = doneSets.length > 0
          ? Math.max(...doneSets.map((set) => set.actual?.weightLb ?? set.weightLb ?? 0))
          : null
        const maxDisplay = maxLb != null ? (isMetric ? round(lbToKg(maxLb), 1) : maxLb) : null
        return { date: shortDate(s.date), weight: maxDisplay }
      })
      .filter((d) => d.weight != null)
  }, [filteredSessions, activeExercise, isMetric])

  if (completed.length === 0) {
    return (
      <Card title="History">
        <p className="text-center text-sm text-slate-400 py-6">No completed workouts yet. Finish a session to see your history.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <Card title="Progression">
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={selectedTemplateId}
            onChange={(e) => { setSelectedTemplateId(e.target.value); setSelectedExerciseName('') }}
            className="rounded-lg px-3 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
          >
            <option value="">All Workouts</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {exerciseNames.length > 0 && (
            <select
              value={activeExercise}
              onChange={(e) => setSelectedExerciseName(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
            >
              {exerciseNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          )}
        </div>

        {chartData.length >= 2 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: CHART_TICK }} />
              <YAxis tick={{ fontSize: 11, fill: CHART_TICK }} unit={` ${wtUnit}`} />
              <Tooltip contentStyle={TT_STYLE} formatter={(v) => [`${v} ${wtUnit}`, 'Max Weight']} />
              <Line type="monotone" dataKey="weight" stroke={LINE_COLOR} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-sm text-slate-400 py-4">
            {chartData.length === 1 ? 'One session so far — keep going to see a trend.' : 'No data for selected exercise.'}
          </p>
        )}
      </Card>

      <Card title={`Sessions (${filteredSessions.length})`}>
        <div className="space-y-3">
          {filteredSessions.map((s) => (
            <SessionCard key={s.id} session={s} isMetric={isMetric} wtUnit={wtUnit} onDelete={() => { if (confirm('Delete this session from history?')) deleteSession(s.id) }} />
          ))}
        </div>
      </Card>
    </div>
  )
}

function SessionCard({ session, isMetric, wtUnit, onDelete }) {
  const [open, setOpen] = useState(false)

  // Support both old (set.done/set.weightLb) and new (set.actual.*) format
  const getActual = (set) => set.actual ?? set
  const isDone = (set) => getActual(set).done ?? false
  const getWeightLb = (set) => getActual(set).weightLb ?? 0
  const getReps = (set) => getActual(set).reps ?? 0

  const totalSets = session.exercises.reduce((n, ex) => n + ex.sets.filter(isDone).length, 0)
  const totalVol = session.exercises.reduce(
    (n, ex) => n + ex.sets.filter(isDone).reduce((acc, s) => acc + getReps(s) * (isMetric ? lbToKg(getWeightLb(s)) : getWeightLb(s)), 0),
    0,
  )

  return (
    <div className="rounded-xl bg-slate-50 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between p-3 text-left">
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
                {ex.sets.map((set, j) => {
                  const done = isDone(set)
                  const wt = getWeightLb(set)
                  const reps = getReps(set)
                  const plan = set.planned
                  return (
                    <div key={j} className={`flex gap-3 text-xs ${done ? 'text-slate-600' : 'text-slate-400'}`}>
                      <span className="w-4">{j + 1}</span>
                      <span>{isMetric ? round(lbToKg(wt), 1) : wt} {wtUnit} × {reps} reps</span>
                      {plan && (
                        <span className="text-slate-500">
                          (plan: {plan.weightType === 'bodyweight' ? 'BW' : plan.weightType === 'percent1rm' ? `${plan.percentage}%` : `${isMetric ? round(lbToKg(plan.weightLb), 1) : plan.weightLb} ${wtUnit}`} × {plan.reps})
                        </span>
                      )}
                      {!done && <span className="text-slate-400 italic">skipped</span>}
                    </div>
                  )
                })}
              </div>
              {(ex.rpe != null || ex.notes) && (
                <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-slate-500">
                  {ex.rpe != null && <span>RPE <span className="font-semibold text-slate-700">{ex.rpe}/10</span></span>}
                  {ex.notes && <span className="italic">{ex.notes}</span>}
                </div>
              )}
            </div>
          ))}
          <button onClick={onDelete} className="mt-2 text-xs text-slate-400 hover:text-rose-500">Delete session</button>
        </div>
      )}
    </div>
  )
}
