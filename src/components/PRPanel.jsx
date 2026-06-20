import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useProfile } from '../context/ProfileContext.jsx'
import { Card } from './ui/Card.jsx'
import { lbToKg, kgToLb, round } from '../lib/units.js'

const LIFTS = [
  { key: 'bench',    label: 'Bench Press', color: '#9C3848' },
  { key: 'squat',    label: 'Back Squat',  color: '#5D707F' },
  { key: 'deadlift', label: 'Deadlift',    color: '#E8C547' },
]

function todayIso() { return new Date().toISOString().slice(0, 10) }
function shortDate(iso) {
  const [, m, d] = iso.split('-')
  return `${Number(m)}/${Number(d)}`
}

export function PRPanel() {
  const { profile, logs, addPR, deletePR } = useProfile()
  const isMetric = profile.units === 'metric'
  const unit = isMetric ? 'kg' : 'lb'
  const conv = (lb) => isMetric ? round(lbToKg(lb), 1) : lb

  const prHistory = logs.prHistory ?? []

  const [activeLift, setActiveLift] = useState('bench')
  const [showForm, setShowForm] = useState(false)
  const [formLift, setFormLift] = useState('bench')
  const [formWeight, setFormWeight] = useState('')
  const [formDate, setFormDate] = useState(todayIso)
  const [formNotes, setFormNotes] = useState('')

  // Chart data: PR progression for active lift
  const chartData = useMemo(() => {
    return prHistory
      .filter((p) => p.lift === activeLift)
      .map((p) => ({ date: shortDate(p.date), fullDate: p.date, weight: conv(p.weightLb) }))
  }, [prHistory, activeLift, isMetric])

  // Current bests per lift
  const bests = useMemo(() => {
    const out = {}
    for (const lift of LIFTS) {
      const entries = prHistory.filter((p) => p.lift === lift.key)
      out[lift.key] = entries.length > 0
        ? entries.reduce((best, p) => p.weightLb > best.weightLb ? p : best)
        : null
    }
    return out
  }, [prHistory])

  function handleAdd() {
    const lb = isMetric ? kgToLb(Number(formWeight)) : Number(formWeight)
    if (!lb || lb <= 0) return
    addPR({
      id: crypto.randomUUID(),
      lift: formLift,
      date: formDate,
      weightLb: round(lb, 2),
      notes: formNotes.trim(),
    })
    setFormWeight('')
    setFormNotes('')
    setShowForm(false)
  }

  const liftColor = LIFTS.find((l) => l.key === activeLift)?.color ?? '#9C3848'
  const activeHistory = prHistory.filter((p) => p.lift === activeLift)

  return (
    <Card title="Personal records" subtitle="All-time bests for your main lifts">

      {/* Best cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {LIFTS.map((lift) => {
          const best = bests[lift.key]
          return (
            <div key={lift.key} className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">{lift.label}</p>
              {best ? (
                <>
                  <p className="text-xl font-bold" style={{ color: lift.color }}>
                    {conv(best.weightLb)}
                  </p>
                  <p className="text-xs text-slate-400">{unit} · {best.date}</p>
                </>
              ) : (
                <p className="text-sm text-slate-400 py-2">—</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Lift tabs + chart */}
      <div className="flex gap-1 mb-3">
        {LIFTS.map((lift) => (
          <button
            key={lift.key}
            onClick={() => setActiveLift(lift.key)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
              activeLift === lift.key ? 'text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
            style={activeLift === lift.key ? { background: lift.color } : {}}
          >
            {lift.label}
          </button>
        ))}
      </div>

      {chartData.length > 1 ? (
        <div className="h-48 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2E30" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8E8E92' }} minTickGap={20} />
              <YAxis
                domain={['dataMin - 10', 'dataMax + 10']}
                tick={{ fontSize: 11, fill: '#8E8E92' }}
                width={44}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#141416', border: '1px solid #2E2E30', borderRadius: 8, fontSize: 12, color: '#E0E0E2' }}
                formatter={(v) => [`${v} ${unit}`, 'Weight']}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke={liftColor}
                strokeWidth={2.5}
                dot={{ r: 4, fill: liftColor }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : chartData.length === 1 ? (
        <p className="text-xs text-slate-400 mb-4 text-center">Log more PRs to see the progression chart.</p>
      ) : (
        <p className="text-xs text-slate-400 mb-4 text-center">No PRs logged for this lift yet.</p>
      )}

      {/* PR history list */}
      {activeHistory.length > 0 && (
        <div className="space-y-1 mb-4 max-h-44 overflow-y-auto">
          {[...activeHistory].reverse().map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <div className="min-w-0">
                <span className="text-sm font-semibold" style={{ color: liftColor }}>
                  {conv(p.weightLb)} {unit}
                </span>
                <span className="ml-2 text-xs text-slate-400">{p.date}</span>
                {p.notes && <p className="text-xs text-slate-400 mt-0.5 italic truncate">{p.notes}</p>}
              </div>
              <button
                onClick={() => deletePR(p.id)}
                className="ml-2 shrink-0 text-slate-300 hover:text-rose-500 transition"
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <div className="rounded-xl border border-slate-200 p-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label>
              <span className="mb-0.5 block text-[10px] text-slate-400">Lift</span>
              <select
                value={formLift}
                onChange={(e) => setFormLift(e.target.value)}
                className="w-full rounded-lg px-2 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
              >
                {LIFTS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-0.5 block text-[10px] text-slate-400">Weight ({unit})</span>
              <input
                autoFocus
                type="number" min={0} step={isMetric ? 0.5 : 2.5}
                value={formWeight}
                onChange={(e) => setFormWeight(e.target.value)}
                className="w-full rounded-lg px-2 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
              />
            </label>
            <label>
              <span className="mb-0.5 block text-[10px] text-slate-400">Date</span>
              <input
                type="date"
                value={formDate}
                max={todayIso()}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full rounded-lg px-2 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
              />
            </label>
            <label>
              <span className="mb-0.5 block text-[10px] text-slate-400">Notes (optional)</span>
              <input
                type="text"
                placeholder="e.g. competition, belt+wraps"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full rounded-lg px-2 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
              />
            </label>
          </div>
          <div className="flex gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={handleAdd}
              disabled={!formWeight}
              className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 transition disabled:opacity-40"
            >
              Log PR
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg px-4 py-1.5 text-sm text-slate-500 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-xl border border-dashed border-slate-200 py-2.5 text-sm font-medium text-slate-400 hover:border-brand-600 hover:text-brand-700 transition"
        >
          + Log a PR
        </button>
      )}
    </Card>
  )
}
