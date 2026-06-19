// Small labeled form controls used across panels.

export function NumberInput({ label, value, onChange, unit, step = 1, min, max, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      )}
      <div className="flex items-center rounded-lg ring-1 ring-slate-300 focus-within:ring-2 focus-within:ring-brand-500">
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg bg-transparent px-3 py-2 text-sm outline-none"
        />
        {unit && <span className="px-3 text-sm text-slate-400">{unit}</span>}
      </div>
    </label>
  )
}

export function SelectInput({ label, value, onChange, options, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-brand-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function SegmentedControl({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            value === o.value
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
