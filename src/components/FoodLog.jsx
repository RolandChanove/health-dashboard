import { useState, useMemo } from 'react'
import { useProfile } from '../context/ProfileContext.jsx'
import { Card } from './ui/Card.jsx'
import { computeCalorieTarget, computeMacros } from '../lib/health.js'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function num(v) {
  return Number(v) || 0
}

// Micronutrient definitions with numeric RDA targets by sex
const MICRO_DEFS = [
  { key: 'fiber',     label: 'Fiber',     unit: 'g',   male: 38,   female: 25,   isLimit: false },
  { key: 'sugar',     label: 'Sugar',     unit: 'g',   male: null, female: null, isLimit: false },
  { key: 'sodium',    label: 'Sodium',    unit: 'mg',  male: 2300, female: 2300, isLimit: true  },
  { key: 'potassium', label: 'Potassium', unit: 'mg',  male: 3400, female: 2600, isLimit: false },
  { key: 'calcium',   label: 'Calcium',   unit: 'mg',  male: 1000, female: 1000, isLimit: false },
  { key: 'iron',      label: 'Iron',      unit: 'mg',  male: 8,    female: 18,   isLimit: false },
  { key: 'vitaminC',  label: 'Vitamin C', unit: 'mg',  male: 90,   female: 75,   isLimit: false },
  { key: 'vitaminD',  label: 'Vitamin D', unit: 'µg',  male: 15,   female: 15,   isLimit: false },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg',  male: 400,  female: 310,  isLimit: false },
]

const MACRO_KEYS = ['calories', 'protein', 'carbs', 'fat']
const MICRO_KEYS = MICRO_DEFS.map((m) => m.key)

function blankForm() {
  return {
    name: '', servingSize: '',
    calories: '', protein: '', carbs: '', fat: '',
    fiber: '', sugar: '', sodium: '', potassium: '',
    calcium: '', iron: '', vitaminC: '', vitaminD: '', magnesium: '',
  }
}

export function FoodLog() {
  const { profile, calc, logs, addFoodEntry, removeFoodEntry } = useProfile()
  const [date, setDate] = useState(todayIso)
  const [form, setForm] = useState(null)
  const [showMicros, setShowMicros] = useState(false)

  // Compute calorie + macro targets from current goal settings
  const targets = useMemo(() => {
    const cal = computeCalorieTarget(profile, calc)
    const mac = computeMacros({ calories: cal.target, weightLb: profile.weightLb, preset: calc.preset })
    return {
      calories: cal.target,
      protein: mac.protein.grams,
      carbs: mac.carbs.grams,
      fat: mac.fat.grams,
    }
  }, [profile, calc])

  const entries = useMemo(
    () => (logs.foods ?? []).filter((e) => e.date === date),
    [logs.foods, date],
  )

  const totals = useMemo(() => {
    const keys = [...MACRO_KEYS, ...MICRO_KEYS]
    const acc = Object.fromEntries(keys.map((k) => [k, 0]))
    for (const e of entries) {
      for (const k of keys) acc[k] += num(e[k])
    }
    return acc
  }, [entries])

  function handleAdd() {
    if (!form?.name.trim()) return
    addFoodEntry({
      id: crypto.randomUUID(),
      date,
      name: form.name.trim(),
      servingSize: form.servingSize.trim(),
      ...Object.fromEntries([...MACRO_KEYS, ...MICRO_KEYS].map((k) => [k, num(form[k])])),
    })
    setForm(null)
    setShowMicros(false)
  }

  const sex = profile.sex

  return (
    <Card title="Food log" subtitle="Daily intake vs. your goal targets">

      {/* Date row */}
      <div className="flex items-center gap-3 mb-5">
        <input
          type="date"
          value={date}
          max={todayIso()}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg px-3 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
        />
        {date !== todayIso() && (
          <button onClick={() => setDate(todayIso())} className="text-xs text-brand-700 hover:text-brand-600">
            → Today
          </button>
        )}
      </div>

      {/* Macro progress bars */}
      <div className="space-y-2.5 mb-5">
        <MacroBar label="Calories" logged={Math.round(totals.calories)} target={targets.calories} unit="kcal" color="#9C3848" />
        <MacroBar label="Protein"  logged={Math.round(totals.protein)}  target={targets.protein}  unit="g"    color="#5D707F" />
        <MacroBar label="Carbs"    logged={Math.round(totals.carbs)}    target={targets.carbs}    unit="g"    color="#4A8A5F" />
        <MacroBar label="Fat"      logged={Math.round(totals.fat)}      target={targets.fat}      unit="g"    color="#E8C547" />
      </div>

      {/* Entry list */}
      <div className="space-y-1.5 mb-3">
        {entries.length === 0 && !form && (
          <p className="py-3 text-center text-sm text-slate-400">Nothing logged yet for this day.</p>
        )}
        {entries.map((e) => (
          <div key={e.id} className="flex items-start justify-between rounded-xl bg-slate-50 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-slate-800">
                {e.name}
                {e.servingSize && (
                  <span className="ml-1.5 text-xs font-normal text-slate-400">({e.servingSize})</span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {e.calories} kcal
                {e.protein > 0 && ` · P: ${e.protein}g`}
                {e.carbs > 0   && ` · C: ${e.carbs}g`}
                {e.fat > 0     && ` · F: ${e.fat}g`}
              </p>
            </div>
            <button
              onClick={() => removeFoodEntry(e.id)}
              className="ml-3 mt-0.5 shrink-0 text-slate-400 hover:text-rose-500 transition"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Inline add form */}
      {form ? (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 space-y-2.5 mb-4">
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Food name (e.g. Chicken breast)"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="flex-1 rounded-lg px-3 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
            />
            <input
              type="text"
              placeholder="Serving (e.g. 100g)"
              value={form.servingSize}
              onChange={(e) => setForm((f) => ({ ...f, servingSize: e.target.value }))}
              className="w-32 rounded-lg px-3 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { key: 'calories', label: 'Calories', unit: 'kcal' },
              { key: 'protein',  label: 'Protein',  unit: 'g' },
              { key: 'carbs',    label: 'Carbs',    unit: 'g' },
              { key: 'fat',      label: 'Fat',      unit: 'g' },
            ].map(({ key, label, unit }) => (
              <label key={key}>
                <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {label} <span className="normal-case font-normal">({unit})</span>
                </span>
                <input
                  type="number" min={0} value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-lg px-2 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
                />
              </label>
            ))}
          </div>

          <button
            onClick={() => setShowMicros((v) => !v)}
            className="text-xs font-medium text-brand-700 hover:text-brand-600"
          >
            {showMicros ? '▲ Hide micronutrients' : '▼ Add micronutrients (optional)'}
          </button>

          {showMicros && (
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-brand-200">
              {MICRO_DEFS.map((m) => (
                <label key={m.key}>
                  <span className="mb-0.5 block text-[10px] text-slate-400">
                    {m.label} ({m.unit})
                  </span>
                  <input
                    type="number" min={0} value={form[m.key]}
                    onChange={(e) => setForm((f) => ({ ...f, [m.key]: e.target.value }))}
                    className="w-full rounded-lg px-2 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
                  />
                </label>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1 border-t border-brand-200">
            <button
              onClick={handleAdd}
              className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 transition"
            >
              Log Food
            </button>
            <button
              onClick={() => { setForm(null); setShowMicros(false) }}
              className="rounded-lg px-4 py-1.5 text-sm text-slate-500 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setForm(blankForm())}
          className="mb-4 w-full rounded-xl border border-dashed border-slate-200 py-2.5 text-sm font-medium text-slate-400 hover:border-brand-600 hover:text-brand-700 transition"
        >
          + Log food
        </button>
      )}

      {/* Daily total summary row */}
      {entries.length > 0 && (
        <div className="mb-5 rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Day total</p>
          <p className="text-sm font-medium text-slate-700">
            {Math.round(totals.calories)} kcal
            <span className="text-slate-400 font-normal">
              {' '}· P: {Math.round(totals.protein)}g
              · C: {Math.round(totals.carbs)}g
              · F: {Math.round(totals.fat)}g
            </span>
          </p>
        </div>
      )}

      {/* Micronutrient progress */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Micronutrients
        </p>
        <div className="space-y-2">
          {MICRO_DEFS.map((m) => {
            const logged = Math.round(totals[m.key] * 10) / 10
            const target = m[sex] ?? m.male
            if (!target) {
              return logged > 0 ? (
                <div key={m.key} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{m.label}</span>
                  <span className="text-xs tabular-nums text-slate-400">
                    {logged} {m.unit} <span className="text-slate-300">(no target)</span>
                  </span>
                </div>
              ) : null
            }
            return (
              <MicroBar
                key={m.key}
                label={m.label}
                logged={logged}
                target={target}
                unit={m.unit}
                isLimit={m.isLimit}
              />
            )
          })}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Targets are RDA/DRI guidance values. Log micronutrients when adding food to see progress here.
          Sodium shows an upper limit — green means under, red means over.
        </p>
      </div>
    </Card>
  )
}

function MacroBar({ label, logged, target, unit, color }) {
  const pct = target > 0 ? Math.min(100, (logged / target) * 100) : 0
  const over = logged > target && target > 0
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs tabular-nums text-slate-500">
          <span className={over ? 'font-semibold text-rose-500' : ''}>{logged}</span>
          {' / '}{target} {unit}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: over ? '#9C3848' : color }}
        />
      </div>
    </div>
  )
}

function MicroBar({ label, logged, target, unit, isLimit }) {
  const pct = target > 0 ? Math.min(100, (logged / target) * 100) : 0
  const over = logged > target
  const barColor = isLimit
    ? over ? '#ef4444' : '#22c55e'
    : pct >= 100 ? '#22c55e' : '#E8C547'
  const textOver = isLimit && over
  return (
    <div className="grid items-center gap-2" style={{ gridTemplateColumns: '7rem 1fr 6rem' }}>
      <span className="truncate text-xs text-slate-500">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      <span className={`text-right text-xs tabular-nums ${textOver ? 'font-semibold text-rose-500' : 'text-slate-400'}`}>
        {logged} / {target}{unit}
      </span>
    </div>
  )
}
