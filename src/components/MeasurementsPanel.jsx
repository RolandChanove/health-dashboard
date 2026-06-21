import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useProfile } from '../context/ProfileContext.jsx'
import { Card } from './ui/Card.jsx'
import { inToCm, cmToIn, round } from '../lib/units.js'
import { TOOLTIP_PROPS, CHART_GRID, CHART_TICK } from '../lib/chartTheme.js'

const FIELDS = [
  { key: 'chest',  label: 'Chest',       color: '#9C3848' },
  { key: 'waist',  label: 'Waist',       color: '#E8C547' },
  { key: 'hips',   label: 'Hips',        color: '#5D707F' },
  { key: 'armL',   label: 'Left Arm',    color: '#4A8A5F' },
  { key: 'armR',   label: 'Right Arm',   color: '#7A6A9F' },
  { key: 'thighL', label: 'Left Thigh',  color: '#C87040' },
  { key: 'thighR', label: 'Right Thigh', color: '#E87060' },
  { key: 'neck',   label: 'Neck',        color: '#6AACB8' },
  { key: 'calf',   label: 'Calf',        color: '#A8A040' },
]

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
function shortDate(iso) {
  const [, m, d] = iso.split('-')
  return `${Number(m)}/${Number(d)}`
}
function conv(inches, isMetric) {
  return isMetric ? round(inToCm(inches), 1) : round(inches, 1)
}

export function MeasurementsPanel() {
  const { profile, logs, addMeasurement, removeMeasurement } = useProfile()
  const isMetric = profile.units === 'metric'
  const unit = isMetric ? 'cm' : 'in'

  const measurements = logs.measurements ?? []

  // Chart: which fields are visible
  const [visible, setVisible] = useState({ chest: true, waist: true, hips: false, armL: false, armR: false, thighL: false, thighR: false, neck: false, calf: false })

  // Log form
  const [date, setDate] = useState(todayIso)
  const [form, setForm] = useState(Object.fromEntries(FIELDS.map((f) => [f.key, ''])))
  const [showForm, setShowForm] = useState(false)

  // Latest measurement for display
  const latest = measurements[measurements.length - 1]

  const chartData = useMemo(() =>
    measurements.map((m) => {
      const point = { date: shortDate(m.date) }
      for (const f of FIELDS) {
        if (m[f.key] != null && m[f.key] > 0) point[f.key] = conv(m[f.key], isMetric)
      }
      return point
    }),
    [measurements, isMetric],
  )

  function handleSave() {
    const entry = { date }
    let hasData = false
    for (const f of FIELDS) {
      const val = Number(form[f.key])
      if (val > 0) {
        entry[f.key] = isMetric ? cmToIn(val) : val
        hasData = true
      }
    }
    if (!hasData) return
    addMeasurement(entry)
    setForm(Object.fromEntries(FIELDS.map((f) => [f.key, ''])))
    setShowForm(false)
  }

  function toggleField(key) {
    setVisible((v) => ({ ...v, [key]: !v[key] }))
  }

  const activeFields = FIELDS.filter((f) => visible[f.key])

  return (
    <Card title="Body measurements" subtitle={latest ? `Last logged ${latest.date}` : 'No entries yet'}>

      {/* Latest snapshot */}
      {latest && (
        <div className="grid grid-cols-3 gap-2 mb-5 sm:grid-cols-5">
          {FIELDS.filter((f) => latest[f.key] > 0).map((f) => (
            <div key={f.key} className="rounded-xl bg-slate-50 px-2 py-2 text-center">
              <p className="text-xs text-slate-400">{f.label}</p>
              <p className="text-base font-bold" style={{ color: f.color }}>
                {conv(latest[f.key], isMetric)}
              </p>
              <p className="text-[10px] text-slate-400">{unit}</p>
            </div>
          ))}
        </div>
      )}

      {/* Field toggles for chart */}
      {measurements.length > 1 && (
        <>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {FIELDS.map((f) => (
              <button
                key={f.key}
                onClick={() => toggleField(f.key)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition ${
                  visible[f.key]
                    ? 'text-white border-transparent'
                    : 'bg-transparent text-slate-400 border-slate-200'
                }`}
                style={visible[f.key] ? { background: f.color, borderColor: f.color } : {}}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="h-60 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: CHART_TICK }} minTickGap={20} />
                <YAxis
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 11, fill: CHART_TICK }}
                  width={40}
                  unit={unit}
                />
                <Tooltip
                  {...TOOLTIP_PROPS}
                  formatter={(v, name) => {
                    const f = FIELDS.find((x) => x.key === name)
                    return [`${v} ${unit}`, f?.label ?? name]
                  }}
                />
                {activeFields.map((f) => (
                  <Line
                    key={f.key}
                    type="monotone"
                    dataKey={f.key}
                    stroke={f.color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: f.color }}
                    activeDot={{ r: 5 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* History list */}
      {measurements.length > 0 && (
        <div className="space-y-1.5 mb-4 max-h-48 overflow-y-auto">
          {[...measurements].reverse().map((m) => (
            <div key={m.date} className="flex items-start justify-between rounded-xl bg-slate-50 px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-slate-600">{m.date}</p>
                <p className="text-[11px] text-slate-400 flex flex-wrap gap-x-2.5 mt-0.5">
                  {FIELDS.filter((f) => m[f.key] > 0).map((f) => (
                    <span key={f.key}>{f.label}: <span className="text-slate-600">{conv(m[f.key], isMetric)}{unit}</span></span>
                  ))}
                </p>
              </div>
              <button
                onClick={() => removeMeasurement(m.date)}
                className="ml-2 shrink-0 text-slate-300 hover:text-rose-500 transition"
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* Log form */}
      {showForm ? (
        <div className="rounded-xl border border-slate-200 p-3 space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-slate-500">Date</label>
            <input
              type="date"
              value={date}
              max={todayIso()}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg px-2 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {FIELDS.map((f) => (
              <label key={f.key}>
                <span className="mb-0.5 block text-[10px] text-slate-400">{f.label} ({unit})</span>
                <input
                  type="number" min={0} step={0.5}
                  value={form[f.key]}
                  onChange={(e) => setForm((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="w-full rounded-lg px-2 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
                />
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={handleSave}
              className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 transition"
            >
              Save measurements
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
          + Log measurements
        </button>
      )}
    </Card>
  )
}
