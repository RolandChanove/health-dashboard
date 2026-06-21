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
import { ProgramsTab } from './components/ProgramsTab.jsx'
import { AuthGate } from './components/AuthGate.jsx'
import { TodayWorkout } from './components/TodayWorkout.jsx'
import { SegmentedControl } from './components/ui/Field.jsx'

const TABS = [
  { id: 'overview',  label: 'Overview' },
  { id: 'tracking',  label: 'Tracking' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'strength',  label: 'Strength' },
  { id: 'workouts',  label: 'Workouts' },
  { id: 'programs',  label: 'Programs' },
]

export default function App() {
  const { profile, toggleUnits, resetData, exportData, importData, authUser, authLoading, signOut } = useProfile()
  const [tab, setTab] = useState('overview')
  const fileRef = useRef(null)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white mx-auto">
            <CorpusIcon />
          </div>
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (!authUser) return <AuthGate />

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
            {/* Desktop-only controls */}
            <button
              onClick={exportData}
              className="hidden sm:block rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              title="Download your data as JSON"
            >
              Export
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="hidden sm:block rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
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
              className="hidden sm:block rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600"
            >
              Reset
            </button>

            <div className="hidden sm:block ml-1 h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-xs text-slate-400 max-w-[140px] truncate">
                {authUser.email}
              </span>
              <button
                onClick={signOut}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Desktop tabs — hidden on mobile */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 hidden sm:block">
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

      {/* Content — extra bottom padding on mobile for the nav bar */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 pb-24 sm:pb-6">
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
        {tab === 'programs' && <ProgramsTab />}
      </main>

      <footer className="hidden sm:block mx-auto max-w-6xl px-4 pb-8 pt-2 text-center text-xs text-slate-400 sm:px-6">
        Estimates only — Mifflin–St Jeor / Katch–McArdle for energy needs. Not medical advice.
      </footer>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#0D0D0F]/95 backdrop-blur border-t border-slate-800 flex items-stretch pb-safe">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
              tab === t.id ? 'text-brand-400' : 'text-slate-500'
            }`}
          >
            <TabIcon id={t.id} active={tab === t.id} />
            <span className="text-[9px] font-medium leading-none">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function TabIcon({ id, active }) {
  const cls = `w-5 h-5 ${active ? 'stroke-brand-400' : 'stroke-slate-500'}`
  const props = { className: cls, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (id === 'overview')  return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
  if (id === 'tracking')  return <svg {...props}><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
  if (id === 'nutrition') return <svg {...props}><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
  if (id === 'strength')  return <svg {...props}><line x1="6" y1="12" x2="18" y2="12"/><line x1="2" y1="9" x2="6" y2="9"/><line x1="2" y1="15" x2="6" y2="15"/><line x1="18" y1="9" x2="22" y2="9"/><line x1="18" y1="15" x2="22" y2="15"/><line x1="2" y1="9" x2="2" y2="15"/><line x1="22" y1="9" x2="22" y2="15"/></svg>
  if (id === 'workouts')  return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  if (id === 'programs')  return <svg {...props}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor" className={active ? 'fill-brand-400' : 'fill-slate-500'}/><circle cx="3" cy="12" r="1" fill="currentColor" className={active ? 'fill-brand-400' : 'fill-slate-500'}/><circle cx="3" cy="18" r="1" fill="currentColor" className={active ? 'fill-brand-400' : 'fill-slate-500'}/></svg>
  return null
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
