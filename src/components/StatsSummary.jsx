import { useMemo } from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  PolarRadiusAxis,
} from 'recharts'
import { useProfile } from '../context/ProfileContext.jsx'
import { Card } from './ui/Card.jsx'
import { StatCard } from './ui/StatCard.jsx'
import {
  computeTDEE,
  bmi,
  bmiCategory,
  bodyComposition,
  strengthRatio,
} from '../lib/health.js'
import { formatWeight, formatHeight, weightUnit, lbToKg } from '../lib/units.js'

export function StatsSummary() {
  const { profile, logs } = useProfile()
  const unit = weightUnit(profile.units)

  const { tdee, bmr, method } = useMemo(() => computeTDEE(profile), [profile])
  const bmiVal = useMemo(() => bmi(profile), [profile])
  const bmiCat = bmiCategory(bmiVal)
  const comp = useMemo(() => bodyComposition(profile), [profile])

  // Radar: normalize key stats to 0–100 against sensible reference ranges so
  // they're comparable on one axis.
  const radarData = useMemo(() => {
    const norm = (v, lo, hi) => Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100))
    const total =
      (logs.lifts.bench + logs.lifts.squat + logs.lifts.deadlift) / profile.weightLb
    return [
      { metric: 'BMI', value: norm(bmiVal, 15, 35) },
      { metric: 'Body fat', value: norm(profile.bodyFatPct ?? 25, 5, 40) },
      { metric: 'Strength', value: norm(total, 1.5, 7) },
      { metric: 'Activity', value: norm(tdee / bmr, 1.2, 1.9) },
      {
        metric: 'Hydration',
        value: norm(
          (logs.water.at(-1)?.oz ?? 0) / (logs.waterGoalOz || 100),
          0,
          1.2,
        ),
      },
    ]
  }, [profile, logs, bmiVal, tdee, bmr])

  return (
    <Card title="Stats summary" subtitle="A snapshot of where you stand">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Weight" value={formatWeight(profile.weightLb, profile.units).split(' ')[0]} unit={unit} />
        <StatCard label="Height" value={formatHeight(profile.heightIn, profile.units)} />
        <StatCard
          label="BMI"
          value={bmiVal.toFixed(1)}
          hint={bmiCat.label}
          accent="text-slate-900"
        />
        <StatCard label="Body fat" value={profile.bodyFatPct ?? '—'} unit={profile.bodyFatPct ? '%' : ''} />
        {comp && (
          <>
            <StatCard
              label="Lean mass"
              value={formatWeight(comp.leanMassLb, profile.units).split(' ')[0]}
              unit={unit}
            />
            <StatCard
              label="Fat mass"
              value={formatWeight(comp.fatMassLb, profile.units).split(' ')[0]}
              unit={unit}
            />
          </>
        )}
        <StatCard label="BMR" value={Math.round(bmr)} unit="kcal" hint={method} />
        <StatCard label="Maintenance (TDEE)" value={Math.round(tdee)} unit="kcal" />
      </div>

      <div className="mt-5 grid items-center gap-4 lg:grid-cols-[1fr,1.1fr]">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="72%">
              <PolarGrid stroke="#2E2E30" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#8E8E92' }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                dataKey="value"
                stroke="#9C3848"
                fill="#9C3848"
                fillOpacity={0.35}
                isAnimationActive={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-sm text-slate-500">
          <p className="font-medium text-slate-700">How to read this</p>
          <p className="mt-1">
            Each axis is normalized 0–100 against a typical range, so you can see your overall
            balance at a glance — strength, body composition, activity, and hydration together.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            BMI category: <span style={{ color: bmiCat.color }}>{bmiCat.label}</span>. BMR via{' '}
            {method}.
          </p>
        </div>
      </div>
    </Card>
  )
}
