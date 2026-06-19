export function StatCard({ label, value, unit, hint, accent = 'text-slate-900' }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-900/5">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className={`mt-1 flex items-baseline gap-1 ${accent}`}>
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  )
}
