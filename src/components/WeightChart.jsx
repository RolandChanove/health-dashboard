import { useMemo, useState } from 'react'
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from 'recharts'
import { useProfile } from '../context/ProfileContext.jsx'
import { Card } from './ui/Card.jsx'
import { NumberInput } from './ui/Field.jsx'
import {
  computeCalorieTarget,
  projectWeight,
} from '../lib/health.js'
import { lbToKg, weightUnit, toCanonicalWeight } from '../lib/units.js'
import { TOOLTIP_PROPS, CHART_GRID, CHART_TICK } from '../lib/chartTheme.js'

// local date helpers
function shortDate(iso) {
  const [y, m, d] = iso.split('-')
  return `${Number(m)}/${Number(d)}`
}
function isoDaysFrom(iso, add) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + add)
  return d.toISOString().slice(0, 10)
}
function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function WeightChart() {
  const { profile, logs, calc, addWeight, removeWeight } = useProfile()
  const metric = profile.units === 'metric'
  const unit = weightUnit(profile.units)
  const conv = (lb) => (metric ? Math.round(lbToKg(lb) * 10) / 10 : Math.round(lb * 10) / 10)

  const [showProjection, setShowProjection] = useState(false)
  const [newWeight, setNewWeight] = useState('')
  const [newDate, setNewDate] = useState(todayIso())

  // Calorie target drives the projection's daily intake.
  const target = useMemo(
    () => computeCalorieTarget(profile, calc),
    [profile, calc],
  )

  const data = useMemo(() => {
    const logged = logs.weights.map((w) => ({
      date: w.date,
      label: shortDate(w.date),
      actual: conv(w.weightLb),
    }))

    if (!showProjection || logged.length === 0) return logged

    // Project forward 120 days from the last logged date/weight.
    const last = logs.weights[logs.weights.length - 1]
    const proj = projectWeight({ ...profile, weightLb: last.weightLb }, {
      intake: target.target,
      days: 90,
    })

    const projPoints = proj.map((p) => ({
      date: isoDaysFrom(last.date, p.day),
      label: shortDate(isoDaysFrom(last.date, p.day)),
      projected: conv(p.weight),
    }))
    // Anchor the projection line to the last actual point for visual continuity.
    projPoints[0].projected = conv(last.weightLb)

    return [...logged, ...projPoints.slice(1)]
  }, [logs.weights, showProjection, profile, target.target]) // eslint-disable-line

  const handleAdd = () => {
    if (newWeight === '') return
    addWeight(toCanonicalWeight(newWeight, profile.units), newDate)
    setNewWeight('')
  }

  const first = logs.weights[0]
  const last = logs.weights[logs.weights.length - 1]
  const change = first && last ? last.weightLb - first.weightLb : 0

  return (
    <Card
      title="Weight over time"
      subtitle={
        first
          ? `${change >= 0 ? '+' : ''}${conv(change)} ${unit} over ${logs.weights.length} entries`
          : 'No entries yet'
      }
      action={
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showProjection}
            onChange={(e) => setShowProjection(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600"
          />
          Show projection
        </label>
      }
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART_TICK }} minTickGap={24} />
            <YAxis
              domain={['dataMin - 2', 'dataMax + 2']}
              tick={{ fontSize: 11, fill: CHART_TICK }}
              width={44}
              tickFormatter={(v) => Math.round(v)}
            />
            <Tooltip
              {...TOOLTIP_PROPS}
              formatter={(v, name) => [`${v} ${unit}`, name === 'actual' ? 'Logged' : 'Projected']}
              labelFormatter={(l) => `Date: ${l}`}
            />
            {showProjection && (
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#E8C547"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#9C3848"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: '#9C3848' }}
              activeDot={{ r: 5 }}
              connectNulls
              isAnimationActive={false}
            />
            <Brush
              dataKey="label"
              height={22}
              stroke="#3E3E42"
              fill="#1C1C1E"
              travellerWidth={8}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {showProjection && (
        <p className="mt-2 text-xs text-slate-400">
          Dashed line projects forward at{' '}
          <span className="font-medium text-amber-600">{target.target} kcal/day</span>. The curve
          flattens as your metabolism adapts to a lower body weight (dynamic model).
        </p>
      )}

      {/* Add-entry form */}
      <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-slate-100 pt-4">
        <NumberInput
          label="Log weight"
          value={newWeight}
          onChange={setNewWeight}
          unit={unit}
          step={0.1}
          className="w-32"
        />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Date</span>
          <input
            type="date"
            value={newDate}
            max={todayIso()}
            onChange={(e) => setNewDate(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>
        <button
          onClick={handleAdd}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
        >
          Add
        </button>
        {last && (
          <button
            onClick={() => removeWeight(last.date)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
            title={`Remove latest entry (${last.date})`}
          >
            Undo latest
          </button>
        )}
      </div>
    </Card>
  )
}
