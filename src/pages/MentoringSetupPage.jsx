import React from 'react'
import { supabase } from '../lib/supabase'

export default function MentoringSetupPage() {
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState(null)
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [complete, setComplete] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let active = true

    async function loadSession() {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (!active) return

      setUser(data.session?.user ?? null)
      if (sessionError) setError(sessionError.message)
      setLoading(false)
    }

    loadSession()

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Choose a password with at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setSaving(false)
      setError(updateError.message)
      return
    }

    const { error: activationError } = await supabase.rpc(
      'complete_mentoring_invitation'
    )

    if (activationError) {
      console.error('Failed to activate mentoring invitation:', activationError)
      setSaving(false)
      setError(
        'Your password was saved, but we could not activate your mentoring account. Please try again or contact your mentor.'
      )
      return
    }

    setSaving(false)
    setComplete(true)
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-[#090b0f] px-5 py-16 text-[#f3f4f6]">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
      <div className="pointer-events-none absolute inset-0 hero-glow" />
      <section className="reveal relative mx-auto w-full max-w-lg">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--mentoring)]">
          Mentoring
        </p>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
          {complete ? 'You’re all set' : 'Set up your account'}
        </h1>

        {loading ? (
          <p className="mt-5 text-sm text-slate-400">
            Checking your invitation…
          </p>
        ) : complete ? (
          <div className="mt-6 border-l-2 border-[var(--mentoring)] pl-5">
            <p className="text-base text-slate-200">
              Your password has been set.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Your account is ready. Your mentor will be in touch with the next
              steps.
            </p>
            <a
              href="/mentoring/portal"
              className="mt-6 inline-flex rounded-lg bg-[var(--mentoring)] px-5 py-3 text-sm font-semibold text-[#090b0f] transition hover:opacity-90"
            >
              Open your mentoring portal
            </a>
          </div>
        ) : !user ? (
          <div className="mt-6 border-l-2 border-amber-400 pl-5">
            <p className="text-base text-slate-200">
              This invitation link is invalid or has expired.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Ask your mentor to send you a new invitation, then open the latest
              link from that email.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Choose a password for {user.email || 'your account'} to complete
              your invitation.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#10141a] px-4 py-3 text-sm text-white outline-none focus:border-[var(--mentoring)]"
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#10141a] px-4 py-3 text-sm text-white outline-none focus:border-[var(--mentoring)]"
                />
              </div>
              {error && (
                <p
                  role="alert"
                  className="border-l-2 border-red-400 pl-4 text-sm text-red-300"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-[var(--mentoring)] px-5 py-3 text-sm font-semibold text-[#090b0f] transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {saving ? 'Saving password…' : 'Complete account setup'}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  )
}
