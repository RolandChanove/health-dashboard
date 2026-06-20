import { useMemo } from 'react'
import { useProfile } from '../context/ProfileContext.jsx'
import { Card } from './ui/Card.jsx'
import { strengthRatio, STRENGTH_LEVELS, STRENGTH_LEVEL_COLORS } from '../lib/health.js'
import {
  weightUnit,
  lbToKg,
  kgToLb,
  toCanonicalWeight,
} from '../lib/units.js'

const LIFTS = [
  { id: 'bench', label: 'Bench Press' },
  { id: 'squat', label: 'Squat' },
  { id: 'deadlift', label: 'Deadlift' },
]

export function StrengthRatios() {
  const { profile, logs, setLift } = useProfile()
  const metric = profile.units === 'metric'
  const unit = weightUnit(profile.units)
  const disp = (lb) => (metric ? Math.round(lbToKg(lb) * 10) / 10 : Math.round(lb * 10) / 10)

  const results = useMemo(
    () =>
      LIFTS.map((l) => ({
        ...l,
        weight: logs.lifts[l.id],
        ...strengthRatio({
          lift: l.id,
          weightLifted: logs.lifts[l.id],
          bodyWeightLb: profile.weightLb,
          sex: profile.sex,
        }),
      })),
    [logs.lifts, profile.weightLb, profile.sex],
  )

  const totalLb = logs.lifts.bench + logs.lifts.squat + logs.lifts.deadlift
  const totalRatio = profile.weightLb > 0 ? totalLb / profile.weightLb : 0

  return (
    <Card
      title="Strength ratios"
      subtitle="Lift ÷ bodyweight, with strength level"
      action={
        <div className="rounded-lg bg-slate-50 px-3 py-1.5 text-right ring-1 ring-slate-900/5">
          <div className="text-[11px] uppercase text-slate-400">Total ÷ BW</div>
          <div className="text-lg font-bold tabular-nums text-slate-800">
            {totalRatio.toFixed(2)}×
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {results.map((r) => (
          <div key={r.id}>
            <div className="flex items-end justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <span className="w-28 text-sm font-medium text-slate-700">{r.label}</span>
                  <div className="flex w-28 items-center rounded-lg ring-1 ring-slate-300 focus-within:ring-2 focus-within:ring-brand-500">
                    <input
                      type="number"
                      value={disp(r.weight)}
                      onChange={(e) =>
                        setLift(r.id, toCanonicalWeight(e.target.value, profile.units))
                      }
                      className="w-full rounded-lg bg-transparent px-3 py-1.5 text-sm outline-none"
                    />
                    <span className="px-2 text-xs text-slate-400">{unit}</span>
                  </div>
                </label>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold tabular-nums text-slate-800">
                  {r.ratio.toFixed(2)}×
                </div>
                <div className="text-xs font-medium" style={{ color: r.color }}>
                  {r.level}
                </div>
              </div>
            </div>

            {/* Level progress bar */}
            <div className="mt-2">
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${((r.levelIndex + r.progress) / STRENGTH_LEVELS.length) * 100}%`,
                    background: r.color,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Level legend */}
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-200 pt-3">
        {STRENGTH_LEVELS.map((lvl) => (
          <span key={lvl} className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: STRENGTH_LEVEL_COLORS[lvl] }} />
            {lvl}
          </span>
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Levels are bodyweight-ratio thresholds adjusted for {profile.sex === 'female' ? 'female' : 'male'} lifters.
        Update your bodyweight in the profile to recalculate.
      </p>
    </Card>
  )
}
