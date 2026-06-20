import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useProfile } from '../context/ProfileContext.jsx'
import { Card } from './ui/Card.jsx'
import { computeCalorieTarget, computeMacros } from '../lib/health.js'
import { searchFoodDb } from '../lib/foodDb.js'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function num(v) {
  return Number(v) || 0
}

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
const ALL_KEYS = [...MACRO_KEYS, ...MICRO_KEYS]

// Scale a food object by servings multiplier.
// For per100g foods, servings = grams / 100.
function scaleFood(food, servings) {
  const s = Math.max(0, servings)
  return {
    calories:  Math.round(num(food.calories)  * s),
    protein:   Math.round(num(food.protein)   * s * 10) / 10,
    carbs:     Math.round(num(food.carbs)     * s * 10) / 10,
    fat:       Math.round(num(food.fat)       * s * 10) / 10,
    fiber:     Math.round(num(food.fiber)     * s * 10) / 10,
    sugar:     Math.round(num(food.sugar)     * s * 10) / 10,
    sodium:    Math.round(num(food.sodium)    * s),
    potassium: Math.round(num(food.potassium) * s),
    calcium:   Math.round(num(food.calcium)   * s),
    iron:      Math.round(num(food.iron)      * s * 10) / 10,
    vitaminC:  Math.round(num(food.vitaminC)  * s * 10) / 10,
    vitaminD:  Math.round(num(food.vitaminD)  * s * 10) / 10,
    magnesium: Math.round(num(food.magnesium) * s),
  }
}

function blankCustom() {
  return {
    name: '', servingLabel: '',
    calories: '', protein: '', carbs: '', fat: '',
    fiber: '', sugar: '', sodium: '', potassium: '',
    calcium: '', iron: '', vitaminC: '', vitaminD: '', magnesium: '',
  }
}

// ─── Add-food flow ────────────────────────────────────────────────────────────

function AddFoodPanel({ date, onClose, addFoodEntry, addFoodTemplate, deleteFoodTemplate, foodTemplates }) {
  const [tab, setTab] = useState('search')
  // 'search' | 'templates' | 'custom'

  // Selected food for adjust step
  const [selected, setSelected] = useState(null)
  // null → still picking; food object → adjust servings

  const handleSelect = useCallback((food) => {
    setSelected(food)
  }, [])

  const handleLog = useCallback((food, servingLabel) => {
    addFoodEntry({
      id: crypto.randomUUID(),
      date,
      name: food.name,
      servingSize: servingLabel,
      ...Object.fromEntries(ALL_KEYS.map((k) => [k, num(food[k])])),
    })
    onClose()
  }, [date, addFoodEntry, onClose])

  if (selected) {
    return (
      <AdjustPanel
        food={selected}
        onLog={handleLog}
        onBack={() => setSelected(null)}
        addFoodTemplate={addFoodTemplate}
        foodTemplates={foodTemplates}
      />
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Add food</p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {[
          { id: 'search',    label: 'Search' },
          { id: 'templates', label: 'My Foods' },
          { id: 'custom',    label: 'Custom' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
              tab === t.id
                ? 'bg-brand-600 text-white'
                : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'search'    && <SearchTab    onSelect={handleSelect} />}
      {tab === 'templates' && <TemplatesTab onSelect={handleSelect} foodTemplates={foodTemplates} deleteFoodTemplate={deleteFoodTemplate} addFoodEntry={addFoodEntry} date={date} onClose={onClose} />}
      {tab === 'custom'    && <CustomTab    onSelect={handleSelect} addFoodTemplate={addFoodTemplate} />}
    </div>
  )
}

// ─── Search tab ───────────────────────────────────────────────────────────────

function SearchTab({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const timerRef = useRef(null)

  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!query.trim()) { setResults([]); return }
    timerRef.current = setTimeout(() => {
      setResults(searchFoodDb(query))
    }, 200)
    return () => clearTimeout(timerRef.current)
  }, [query])

  return (
    <div className="space-y-2">
      <input
        autoFocus
        type="text"
        placeholder="Search foods… (e.g. chicken, Big Mac, broccoli)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
      />
      {query.trim() && results.length === 0 && (
        <p className="py-2 text-center text-xs text-slate-400">No results. Try "Custom" to add manually.</p>
      )}
      <div className="space-y-1 max-h-52 overflow-y-auto">
        {results.map((food) => (
          <FoodResultRow key={food.id} food={food} onSelect={onSelect} />
        ))}
      </div>
      {!query.trim() && (
        <p className="text-xs text-slate-400 text-center pt-1">
          Search 90+ whole foods, McDonald's, Burger King, Chipotle, Chick-fil-A &amp; more.
        </p>
      )}
    </div>
  )
}

function FoodResultRow({ food, onSelect }) {
  return (
    <button
      onClick={() => onSelect(food)}
      className="w-full flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-left hover:bg-slate-100 transition ring-1 ring-slate-100"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{food.name}</p>
        <p className="text-xs text-slate-400">
          {food.brand && <span className="text-brand-700">{food.brand} · </span>}
          {food.servingLabel}
        </p>
      </div>
      <div className="ml-3 shrink-0 text-right">
        <p className="text-sm font-semibold text-slate-700">{food.calories} kcal</p>
        <p className="text-[10px] text-slate-400">P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
      </div>
    </button>
  )
}

// ─── Templates tab ────────────────────────────────────────────────────────────

function TemplatesTab({ onSelect, foodTemplates, deleteFoodTemplate }) {
  const [showNew, setShowNew] = useState(false)

  if (showNew) {
    return <CustomTab onSelect={onSelect} onCancel={() => setShowNew(false)} isTemplate />
  }

  return (
    <div className="space-y-2">
      {foodTemplates.length === 0 && (
        <p className="py-2 text-center text-xs text-slate-400">
          No saved foods yet. Create one below or save any custom entry.
        </p>
      )}
      <div className="space-y-1 max-h-52 overflow-y-auto">
        {foodTemplates.map((t) => (
          <div key={t.id} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 ring-1 ring-slate-100">
            <button
              onClick={() => onSelect(t)}
              className="flex-1 min-w-0 text-left"
            >
              <p className="text-sm font-medium text-slate-800 truncate">{t.name}</p>
              <p className="text-xs text-slate-400">
                {t.servingLabel} · {t.calories} kcal · P:{t.protein}g C:{t.carbs}g F:{t.fat}g
              </p>
            </button>
            <button
              onClick={() => { if (confirm(`Delete "${t.name}"?`)) deleteFoodTemplate(t.id) }}
              className="text-slate-300 hover:text-rose-500 transition text-base leading-none shrink-0"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => setShowNew(true)}
        className="w-full rounded-lg border border-dashed border-slate-200 py-2 text-xs font-medium text-slate-400 hover:border-brand-600 hover:text-brand-700 transition"
      >
        + Create new saved food
      </button>
    </div>
  )
}

// ─── Custom / new template tab ────────────────────────────────────────────────

function CustomTab({ onSelect, addFoodTemplate, onCancel, isTemplate = false }) {
  const [form, setForm] = useState(blankCustom)
  const [showMicros, setShowMicros] = useState(false)
  const [saveAsTemplate, setSaveAsTemplate] = useState(isTemplate)

  function handleProceed() {
    if (!form.name.trim()) return
    const food = {
      id: 'custom-' + crypto.randomUUID(),
      name: form.name.trim(),
      servingLabel: form.servingLabel.trim() || '1 serving',
      per100g: false,
      ...Object.fromEntries(ALL_KEYS.map((k) => [k, num(form[k])])),
    }
    if (saveAsTemplate && addFoodTemplate) {
      addFoodTemplate({ ...food, id: crypto.randomUUID() })
    }
    onSelect(food)
  }

  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <input
          autoFocus
          type="text"
          placeholder="Food name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="flex-1 rounded-lg px-3 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
        />
        <input
          type="text"
          placeholder="Serving (e.g. 100g)"
          value={form.servingLabel}
          onChange={(e) => setForm((f) => ({ ...f, servingLabel: e.target.value }))}
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
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200">
          {MICRO_DEFS.map((m) => (
            <label key={m.key}>
              <span className="mb-0.5 block text-[10px] text-slate-400">{m.label} ({m.unit})</span>
              <input
                type="number" min={0} value={form[m.key]}
                onChange={(e) => setForm((f) => ({ ...f, [m.key]: e.target.value }))}
                className="w-full rounded-lg px-2 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
              />
            </label>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 pt-0.5">
        <input
          type="checkbox"
          checked={saveAsTemplate}
          onChange={(e) => setSaveAsTemplate(e.target.checked)}
          className="rounded accent-brand-600"
        />
        <span className="text-xs text-slate-500">Save to My Foods (reuse later)</span>
      </label>

      <div className="flex gap-2 pt-1 border-t border-slate-200">
        <button
          onClick={handleProceed}
          disabled={!form.name.trim()}
          className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 transition disabled:opacity-40"
        >
          Next →
        </button>
        {onCancel && (
          <button onClick={onCancel} className="rounded-lg px-4 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Adjust serving + preview ─────────────────────────────────────────────────

function AdjustPanel({ food, onLog, onBack, addFoodTemplate, foodTemplates }) {
  const [servings, setServings] = useState(1)
  const [grams, setGrams]       = useState(food.per100g ? 100 : null)
  // per100g foods expose a grams input; others use a servings multiplier
  const effectiveServings = food.per100g ? (grams || 0) / 100 : servings

  const preview = useMemo(() => scaleFood(food, effectiveServings), [food, effectiveServings])

  const alreadySaved = (foodTemplates ?? []).some((t) => t.name === food.name)

  function handleSaveTemplate() {
    if (alreadySaved) return
    addFoodTemplate({
      id: crypto.randomUUID(),
      name: food.name,
      servingLabel: food.servingLabel,
      per100g: food.per100g,
      ...Object.fromEntries(ALL_KEYS.map((k) => [k, num(food[k])])),
    })
  }

  function handleLog() {
    const label = food.per100g
      ? `${grams}g`
      : servings === 1
        ? food.servingLabel
        : `${servings} × ${food.servingLabel}`
    onLog(preview, label)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">{food.name}</p>
          {food.brand && <p className="text-xs text-brand-700">{food.brand}</p>}
          <p className="text-xs text-slate-400">{food.servingLabel}</p>
        </div>
        <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-600 shrink-0 mt-0.5">
          ← Back
        </button>
      </div>

      {/* Serving input */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-600 shrink-0">
          {food.per100g ? 'Grams:' : 'Servings:'}
        </label>
        {food.per100g ? (
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} step={10}
              value={grams ?? ''}
              onChange={(e) => setGrams(num(e.target.value))}
              className="w-24 rounded-lg px-2 py-1.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-brand-600"
            />
            <span className="text-sm text-slate-400">g</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setServings((s) => Math.max(0.25, +(s - 0.25).toFixed(2)))}
              className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold transition"
            >−</button>
            <input
              type="number" min={0.25} step={0.25}
              value={servings}
              onChange={(e) => setServings(Math.max(0, num(e.target.value)))}
              className="w-20 rounded-lg px-2 py-1.5 text-sm text-center ring-1 ring-slate-200 outline-none focus:ring-brand-600"
            />
            <button
              onClick={() => setServings((s) => +(s + 0.25).toFixed(2))}
              className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold transition"
            >+</button>
          </div>
        )}
      </div>

      {/* Macro preview */}
      <div className="rounded-xl bg-white ring-1 ring-slate-100 p-3 space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">You're adding</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label:'Calories', val: preview.calories, unit:'kcal', color:'#9C3848' },
            { label:'Protein',  val: preview.protein,  unit:'g',    color:'#5D707F' },
            { label:'Carbs',    val: preview.carbs,    unit:'g',    color:'#4A8A5F' },
            { label:'Fat',      val: preview.fat,      unit:'g',    color:'#E8C547' },
          ].map(({ label, val, unit, color }) => (
            <div key={label}>
              <p className="text-lg font-bold" style={{ color }}>{val}</p>
              <p className="text-[10px] text-slate-400">{label}</p>
              <p className="text-[10px] text-slate-300">{unit}</p>
            </div>
          ))}
        </div>

        {/* Micro preview (only non-zero values) */}
        {MICRO_DEFS.filter((m) => preview[m.key] > 0).length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-3 gap-x-3 gap-y-0.5">
            {MICRO_DEFS.filter((m) => preview[m.key] > 0).map((m) => (
              <div key={m.key} className="flex justify-between text-[10px]">
                <span className="text-slate-400">{m.label}</span>
                <span className="tabular-nums text-slate-500">{preview[m.key]}{m.unit}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 items-center">
        <button
          onClick={handleLog}
          className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition"
        >
          Log Food
        </button>
        {addFoodTemplate && !alreadySaved && (
          <button
            onClick={handleSaveTemplate}
            className="rounded-lg px-3 py-2 text-xs text-slate-500 hover:bg-slate-200 transition"
          >
            💾 Save to My Foods
          </button>
        )}
        {alreadySaved && (
          <span className="text-xs text-slate-400">✓ Saved to My Foods</span>
        )}
      </div>
    </div>
  )
}

// ─── Main FoodLog component ───────────────────────────────────────────────────

export function FoodLog() {
  const {
    profile, calc, logs,
    addFoodEntry, removeFoodEntry,
    addFoodTemplate, updateFoodTemplate, deleteFoodTemplate,
  } = useProfile()

  const foodTemplates = logs.foodTemplates ?? []

  const [date, setDate] = useState(todayIso)
  const [adding, setAdding] = useState(false)

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
    const acc = Object.fromEntries(ALL_KEYS.map((k) => [k, 0]))
    for (const e of entries) {
      for (const k of ALL_KEYS) acc[k] += num(e[k])
    }
    return acc
  }, [entries])

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
        {entries.length === 0 && !adding && (
          <p className="py-3 text-center text-sm text-slate-400">Nothing logged yet for this day.</p>
        )}
        {entries.map((e) => (
          <div key={e.id} className="flex items-start justify-between rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
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

      {/* Add panel or button */}
      {adding ? (
        <div className="mb-4">
          <AddFoodPanel
            date={date}
            onClose={() => setAdding(false)}
            addFoodEntry={addFoodEntry}
            addFoodTemplate={addFoodTemplate}
            deleteFoodTemplate={deleteFoodTemplate}
            foodTemplates={foodTemplates}
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mb-4 w-full rounded-xl border border-dashed border-slate-200 py-2.5 text-sm font-medium text-slate-400 hover:border-brand-600 hover:text-brand-700 transition"
        >
          + Log food
        </button>
      )}

      {/* Day total */}
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
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Micronutrients</p>
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
          Targets are RDA/DRI guidance values.
          Sodium shows an upper limit — green = under, red = over.
        </p>
      </div>
    </Card>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

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
