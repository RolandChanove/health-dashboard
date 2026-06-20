import { useState } from 'react'
import { TodayWorkout } from './TodayWorkout.jsx'
import { WorkoutBuilder } from './WorkoutBuilder.jsx'
import { WorkoutHistory } from './WorkoutHistory.jsx'

const SUB_TABS = [
  { id: 'today', label: 'Today' },
  { id: 'programs', label: 'Programs' },
  { id: 'history', label: 'History' },
]

export function WorkoutsTab() {
  const [sub, setSub] = useState('today')

  return (
    <div>
      <div className="flex gap-1 mb-5">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              sub === t.id
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'today' && (
        <TodayWorkout onGoToWorkouts={() => setSub('programs')} />
      )}
      {sub === 'programs' && <WorkoutBuilder />}
      {sub === 'history' && <WorkoutHistory />}
    </div>
  )
}
