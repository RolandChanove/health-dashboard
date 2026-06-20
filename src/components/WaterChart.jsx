import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import { useProfile } from '../context/ProfileContext.jsx'
import { Card } from './ui/Card.jsx'
import { ozToMl, volumeUnit } from '../lib/units.js'

function shortDate(iso) {
  const [, m, d] = iso.split('-')
  return `${Number(m)}/${Number(d)}`
}
function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function WaterChart() {
  const { profile, logs, addWater, setWaterGoal } = useProfile()
  const metric = profile.units === 'metric'
  const unit = volumeUnit(profile.units)
  const conv = (oz) => (metric ? Math.round(ozToMl(oz)) : Math.round(oz))

  const [custom, setCustom] = useState('')

  const goalDisplay = conv(logs.waterGoalOz)

  const data = useMemo(
    () =>
      logs.water.map((w) => ({
        label: shortDate(w.date),
        amount: conv(w.oz),
        met: w.oz >= logs.waterGoalOz,
      })),
    [logs.water, logs.waterGoalOz, metric],
  )

  const today = logs.water.find((w) => w.date === todayIso())
  const todayOz = today?.oz ?? 0
  const pct = Math.min(100, Math.round((todayOz / logs.waterGoalOz) * 100))

  // Quick-add buttons sized to the active unit system.
  const quickAdds = metric
    ? [{ label: '+250 mL', oz: 250 / 29.5735 }, { label: '+500 mL', oz: 500 / 29.5735 }]
    : [{ label: '+8 oz', oz: 8 }, { label: '+16 oz', oz: 16 }]

  return (
    <Card
      title="Water intake"
      subtitle={`Today: ${conv(todayOz)} / ${goalDisplay} ${unit} (${pct}%)`}
      action={
        <div className="flex items-center gap-2">
          {quickAdds.map((q) => (
            <button
              key={q.label}
              onClick={() => addWater(q.oz)}
              className="rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-100"
            >
              {q.label}
            </button>
          ))}
        </div>
      }
    >
      {/* Today progress bar */}
      <div className="mb-4">
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: 'linear-gradient(to right, #5D707F, #9C3848)' }}
          />
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2E2E30" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8E8E92' }} minTickGap={16} />
            <YAxis tick={{ fontSize: 11, fill: '#8E8E92' }} width={44} />
            <Tooltip
              formatter={(v) => [`${v} ${unit}`, 'Water']}
              contentStyle={{ borderRadius: 12, border: '1px solid #2E2E30', fontSize: 12, backgroundColor: '#141416', color: '#E0E0E2' }}
              cursor={{ fill: '#2E2E30' }}
            />
            <ReferenceLine
              y={goalDisplay}
              stroke="#5D707F"
              strokeDasharray="4 4"
              label={{ value: 'Goal', position: 'right', fontSize: 11, fill: '#5D707F' }}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.met ? '#9C3848' : '#5D707F'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom add + goal */}
      <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-slate-100 pt-4">
        <label className="block w-32">
          <span className="mb-1 block text-xs font-medium text-slate-500">Custom add</span>
          <div className="flex items-center rounded-lg ring-1 ring-slate-300 focus-within:ring-2 focus-within:ring-brand-500">
            <input
              type="number"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="w-full rounded-lg bg-transparent px-3 py-2 text-sm outline-none"
            />
            <span className="px-2 text-sm text-slate-400">{unit}</span>
          </div>
        </label>
        <button
          onClick={() => {
            if (custom === '') return
            addWater(metric ? Number(custom) / 29.5735 : Number(custom))
            setCustom('')
          }}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
        >
          Add
        </button>
        <label className="ml-auto block w-32">
          <span className="mb-1 block text-xs font-medium text-slate-500">Daily goal</span>
          <div className="flex items-center rounded-lg ring-1 ring-slate-300 focus-within:ring-2 focus-within:ring-brand-500">
            <input
              type="number"
              value={goalDisplay}
              onChange={(e) =>
                setWaterGoal(metric ? Number(e.target.value) / 29.5735 : Number(e.target.value))
              }
              className="w-full rounded-lg bg-transparent px-3 py-2 text-sm outline-none"
            />
            <span className="px-2 text-sm text-slate-400">{unit}</span>
          </div>
        </label>
      </div>
    </Card>
  )
}
