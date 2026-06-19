import { useProfile } from '../context/ProfileContext.jsx'
import { Card } from './ui/Card.jsx'
import { NumberInput, SelectInput } from './ui/Field.jsx'
import { ACTIVITY_LEVELS } from '../lib/health.js'
import {
  lbToKg,
  kgToLb,
  inToCm,
  cmToIn,
  weightUnit,
} from '../lib/units.js'

export function ProfilePanel() {
  const { profile, setProfile } = useProfile()
  const metric = profile.units === 'metric'

  const weightVal = metric
    ? Math.round(lbToKg(profile.weightLb) * 10) / 10
    : Math.round(profile.weightLb * 10) / 10

  const onWeight = (v) =>
    setProfile({ weightLb: metric ? kgToLb(Number(v)) : Number(v) })

  return (
    <Card title="Your profile" subtitle="Used across every calculation">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SelectInput
          label="Sex"
          value={profile.sex}
          onChange={(v) => setProfile({ sex: v })}
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ]}
        />
        <NumberInput
          label="Age"
          value={profile.age}
          onChange={(v) => setProfile({ age: Number(v) })}
          unit="yr"
          min={10}
          max={100}
        />
        <NumberInput
          label="Weight"
          value={weightVal}
          onChange={onWeight}
          unit={weightUnit(profile.units)}
          step={0.1}
        />

        {metric ? (
          <NumberInput
            label="Height"
            value={Math.round(inToCm(profile.heightIn))}
            onChange={(v) => setProfile({ heightIn: cmToIn(Number(v)) })}
            unit="cm"
          />
        ) : (
          <HeightFeetInches
            inches={profile.heightIn}
            onChange={(inches) => setProfile({ heightIn: inches })}
          />
        )}

        <NumberInput
          label="Body fat"
          value={profile.bodyFatPct ?? ''}
          onChange={(v) => setProfile({ bodyFatPct: v === '' ? null : Number(v) })}
          unit="%"
          step={0.5}
          min={3}
          max={70}
        />
        <SelectInput
          label="Activity level"
          value={profile.activity}
          onChange={(v) => setProfile({ activity: v })}
          options={ACTIVITY_LEVELS.map((a) => ({ value: a.id, label: a.label }))}
          className="col-span-2 sm:col-span-1"
        />
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Body-fat % is optional. When provided, calorie needs use the more precise
        Katch–McArdle equation; otherwise Mifflin–St Jeor is used.
      </p>
    </Card>
  )
}

// Imperial height split into feet + inches for a natural input.
function HeightFeetInches({ inches, onChange }) {
  const ft = Math.floor(inches / 12)
  const inch = Math.round(inches - ft * 12)
  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-slate-500">Height</span>
      <div className="flex gap-2">
        <div className="flex flex-1 items-center rounded-lg ring-1 ring-slate-300 focus-within:ring-2 focus-within:ring-brand-500">
          <input
            type="number"
            value={ft}
            min={3}
            max={8}
            onChange={(e) => onChange(Number(e.target.value) * 12 + inch)}
            className="w-full rounded-lg bg-transparent px-3 py-2 text-sm outline-none"
          />
          <span className="px-2 text-sm text-slate-400">ft</span>
        </div>
        <div className="flex flex-1 items-center rounded-lg ring-1 ring-slate-300 focus-within:ring-2 focus-within:ring-brand-500">
          <input
            type="number"
            value={inch}
            min={0}
            max={11}
            onChange={(e) => onChange(ft * 12 + Number(e.target.value))}
            className="w-full rounded-lg bg-transparent px-3 py-2 text-sm outline-none"
          />
          <span className="px-2 text-sm text-slate-400">in</span>
        </div>
      </div>
    </div>
  )
}
