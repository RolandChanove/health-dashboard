import { useRef, useState } from 'react'
import { useProfile } from './context/ProfileContext.jsx'
import { ProfilePanel } from './components/ProfilePanel.jsx'
import { StatsSummary } from './components/StatsSummary.jsx'
import { WeightChart } from './components/WeightChart.jsx'
import { WaterChart } from './components/WaterChart.jsx'
import { CalorieCalculator } from './components/CalorieCalculator.jsx'
import { FoodLog } from './components/FoodLog.jsx'
import { StrengthRatios } from './components/StrengthRatios.jsx'
import { MeasurementsPanel } from './components/MeasurementsPanel.jsx'
import { PRPanel } from './components/PRPanel.jsx'
import { WorkoutsTab } from './components/WorkoutsTab.jsx'
import { TodayWorkout } from './components/TodayWorkout.jsx'
import { SegmentedControl } from './components/ui/Field.jsx'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'tracking', label: 'Tracking' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'strength', label: 'Strength' },
  { id: 'workouts', label: 'Workouts' },
]

export default function App() {
  const { profile, toggleUnits, resetData, exportData, importData } = useProfile()
  const [tab, setTab] = useState('overview')
  const fileRef = useRef(null)

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-[#0D0D0F]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
              <CorpusIcon />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none text-slate-800">Corpra</h1>
              <p className="text-xs text-slate-400">Track · Train · Improve</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <SegmentedControl
              value={profile.units}
              onChange={() => toggleUnits()}
              options={[
                { value: 'imperial', label: 'lb/ft' },
                { value: 'metric', label: 'kg/cm' },
              ]}
            />
            <button
              onClick={exportData}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              title="Download your data as JSON"
            >
              Export
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              title="Import data from JSON"
            >
              Import
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) importData(f).catch(() => alert('Could not read that file.'))
                e.target.value = ''
              }}
            />
            <button
              onClick={() => {
                if (confirm('Reset all data to sample values? This cannot be undone.')) resetData()
              }}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex gap-1 pb-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  tab === t.id
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {tab === 'overview' && (
          <div className="space-y-5">
            <ProfilePanel />
            <StatsSummary />
            <TodayWorkout onGoToWorkouts={() => setTab('workouts')} />
          </div>
        )}

        {tab === 'tracking' && (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <WeightChart />
            </div>
            <div className="lg:col-span-2">
              <WaterChart />
            </div>
            <div className="lg:col-span-2">
              <MeasurementsPanel />
            </div>
          </div>
        )}

        {tab === 'nutrition' && (
          <div className="space-y-5">
            <CalorieCalculator />
            <FoodLog />
          </div>
        )}

        {tab === 'strength' && (
          <div className="grid gap-5">
            <StrengthRatios />
            <PRPanel />
          </div>
        )}

        {tab === 'workouts' && <WorkoutsTab />}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 pt-2 text-center text-xs text-slate-400 sm:px-6">
        Estimates only — Mifflin–St Jeor / Katch–McArdle for energy needs. Not medical advice.
      </footer>
    </div>
  )
}

function CorpusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5.5" r="2.8" fill="white" />
      <path
        d="M7 22v-3a5 5 0 0 1 10 0v3"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 14h10"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9.5 14l-1 8M14.5 14l1 8"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}
