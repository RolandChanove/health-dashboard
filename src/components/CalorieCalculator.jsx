import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { useProfile } from '../context/ProfileContext.jsx'
import { Card } from './ui/Card.jsx'
import { SelectInput, NumberInput, SegmentedControl } from './ui/Field.jsx'
import {
  computeCalorieTarget,
  computeMacros,
  GOALS,
  DIET_PRESETS,
} from '../lib/health.js'
import { weightUnit, lbToKg, kgToLb } from '../lib/units.js'
import { TOOLTIP_PROPS } from '../lib/chartTheme.js'

const MACRO_COLORS = { protein: '#5D707F', carbs: '#4A8A5F', fat: '#E8C547' }

export function CalorieCalculator() {
  const { profile, calc, setCalc } = useProfile()
  const metric = profile.units === 'metric'

  const result = useMemo(() => computeCalorieTarget(profile, calc), [profile, calc])
  const macros = useMemo(
    () =>
      computeMacros({
        calories: result.target,
        weightLb: profile.weightLb,
        preset: calc.preset,
      }),
    [result.target, profile.weightLb, calc.preset],
  )

  const pieData = [
    { name: 'Protein', key: 'protein', value: macros.protein.kcal, grams: macros.protein.grams },
    { name: 'Carbs', key: 'carbs', value: macros.carbs.kcal, grams: macros.carbs.grams },
    { name: 'Fat', key: 'fat', value: macros.fat.kcal, grams: macros.fat.grams },
  ]

  // rate input shown in the active unit system
  const rateDisplay = metric
    ? Math.round(lbToKg(calc.rateLbPerWeek) * 100) / 100
    : calc.rateLbPerWeek
  const onRate = (v) =>
    setCalc({ rateLbPerWeek: metric ? kgToLb(Number(v)) : Number(v) })

  return (
    <Card
      title="Calorie & macro calculator"
      subtitle={`${result.method} • activity-adjusted`}
    >
      <div className="grid gap-5 lg:grid-cols-[0.9fr,1.1fr]">
        {/* Controls + numbers */}
        <div>
          <div className="grid grid-cols-2 gap-3">
            <SelectInput
              label="Goal"
              value={calc.goal}
              onChange={(v) => setCalc({ goal: v })}
              options={GOALS.map((g) => ({ value: g.id, label: g.label }))}
            />
            <NumberInput
              label={`Rate (${weightUnit(profile.units)}/week)`}
              value={rateDisplay}
              onChange={onRate}
              step={metric ? 0.1 : 0.25}
              min={0}
            />
          </div>

          <div className="mt-3">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">Diet style</span>
            <SegmentedControl
              value={calc.preset}
              onChange={(v) => setCalc({ preset: v })}
              options={DIET_PRESETS.map((d) => ({ value: d.id, label: d.label }))}
            />
          </div>

          <div className="mt-4 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 p-4 text-white">
            <div className="text-xs font-medium uppercase tracking-wide text-brand-100">
              Daily target
            </div>
            <div className="mt-0.5 text-3xl font-bold tabular-nums">
              {result.target}
              <span className="ml-1 text-base font-medium text-brand-100">kcal</span>
            </div>
            <div className="mt-1 text-sm text-brand-100">
              Maintenance {Math.round(result.tdee)} kcal ·{' '}
              {result.dailyDelta === 0
                ? 'no adjustment'
                : `${result.dailyDelta > 0 ? '+' : ''}${result.dailyDelta} kcal/day`}
            </div>
          </div>

          {(result.rateClamped || result.floored) && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 ring-1 ring-amber-200">
              {result.floored
                ? 'Target was raised to a safe minimum intake. '
                : ''}
              {result.rateClamped
                ? `Rate capped at ~1% of bodyweight/week (${result.maxRate.toFixed(2)} lb) for safety.`
                : ''}
            </p>
          )}
        </div>

        {/* Macro pie + table */}
        <div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={2}
                  isAnimationActive={false}
                >
                  {pieData.map((d) => (
                    <Cell key={d.key} fill={MACRO_COLORS[d.key]} />
                  ))}
                </Pie>
                <Tooltip
                  {...TOOLTIP_PROPS}
                  formatter={(v, n, p) => [`${p.payload.grams} g (${v} kcal)`, n]}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(val) => <span className="text-xs text-slate-600">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2">
            {pieData.map((d) => (
              <div
                key={d.key}
                className="rounded-xl p-3 text-center ring-1 ring-slate-900/5"
                style={{ background: `${MACRO_COLORS[d.key]}12` }}
              >
                <div className="text-xs font-medium" style={{ color: MACRO_COLORS[d.key] }}>
                  {d.name}
                </div>
                <div className="mt-0.5 text-lg font-semibold tabular-nums text-slate-800">
                  {d.grams}
                  <span className="text-xs font-normal text-slate-400"> g</span>
                </div>
                <div className="text-[11px] text-slate-400">{d.value} kcal</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
