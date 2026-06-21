import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export function AuthGate() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
        else setEmailSent(true)
      }
    } catch {
      setError('Could not connect. Check your internet connection.')
    }
    setLoading(false)
  }

  function switchMode(next) {
    setMode(next)
    setError('')
    setEmailSent(false)
  }

  return (
    <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Branding */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg">
              <CorpraIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Corpra</h1>
              <p className="text-xs text-slate-400">Track · Train · Improve</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {emailSent ? (
            <div className="text-center space-y-4 py-2">
              <div className="text-4xl">✉️</div>
              <div>
                <p className="font-semibold text-slate-800">Check your email</p>
                <p className="text-sm text-slate-500 mt-1">
                  We sent a confirmation link to <strong>{email}</strong>.
                  Click it, then come back and sign in.
                </p>
              </div>
              <button
                onClick={() => switchMode('signin')}
                className="text-sm font-semibold text-brand-700 hover:underline"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-800 mb-0.5">
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </h2>
              <p className="text-sm text-slate-400 mb-5">
                {mode === 'signin' ? 'Welcome back.' : 'Your data syncs across all your devices.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-slate-500">Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-xl px-3 py-2.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-brand-600 transition"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-slate-500">Password</span>
                  <input
                    type="password"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : ''}
                    className="mt-1 w-full rounded-xl px-3 py-2.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-brand-600 transition"
                  />
                </label>

                {error && (
                  <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition disabled:opacity-50"
                >
                  {loading ? '…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-slate-400">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="font-semibold text-brand-700 hover:underline"
                >
                  {mode === 'signin' ? 'Create one' : 'Sign in'}
                </button>
              </p>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Your data is private and encrypted. Only you can access it.
        </p>
      </div>
    </div>
  )
}

function CorpraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5.5" r="2.8" fill="white" />
      <path d="M7 22v-3a5 5 0 0 1 10 0v3" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 14h10" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.5 14l-1 8M14.5 14l1 8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
