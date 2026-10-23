import React from 'react'
import { supabase } from '../lib/supabase'
import MentoringSessionsPortal from '../components/personal-development/MentoringSessionsPortal'

function formatDate(value) {
  if (!value) return 'Not available'

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function PortalMessage({ title, children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090b0f] px-5 py-16 text-[#f3f4f6]">
      <section className="w-full max-w-lg border-l-2 border-[var(--mentoring)] pl-6">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--mentoring)]">
          Mentoring
        </p>
        <h1 className="mt-4 text-3xl font-semibold">{title}</h1>
        <div className="mt-4 text-sm leading-7 text-slate-400">{children}</div>
      </section>
    </main>
  )
}

function ClientLogin({ onSignedIn }) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email: email.trim(),
        password,
      }
    )

    setSubmitting(false)
    if (signInError) {
      setError(
        'We could not sign you in. Check your email and password, then try again.'
      )
      return
    }

    onSignedIn(data.session)
  }

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-[#090b0f] px-5 py-16 text-[#f3f4f6]">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
      <div className="pointer-events-none absolute inset-0 hero-glow" />
      <section className="reveal relative mx-auto w-full max-w-md">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--mentoring)]">
          Mentoring portal
        </p>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Sign in</h1>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          Use the email address you received your mentoring invitation at.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="portal-email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email
            </label>
            <input
              id="portal-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#10141a] px-4 py-3 text-sm text-white outline-none focus:border-[var(--mentoring)]"
            />
          </div>
          <div>
            <label
              htmlFor="portal-password"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Password
            </label>
            <input
              id="portal-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#10141a] px-4 py-3 text-sm text-white outline-none focus:border-[var(--mentoring)]"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--mentoring)] px-5 py-3 text-sm font-semibold text-[#090b0f] transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in to your portal'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default function MentoringPortalPage() {
  const [loading, setLoading] = React.useState(true)
  const [session, setSession] = React.useState(null)
  const [client, setClient] = React.useState(null)
  const [goals, setGoals] = React.useState([])
  const [planError, setPlanError] = React.useState('')
  const [updatingAction, setUpdatingAction] = React.useState(null)
  const [loadError, setLoadError] = React.useState('')

  React.useEffect(() => {
    let active = true

    async function loadClient(currentSession) {
      if (!currentSession?.user?.id) {
        if (active) {
          setSession(null)
          setClient(null)
          setLoading(false)
        }
        return
      }

      if (active) {
        setSession(currentSession)
        setLoading(true)
        setLoadError('')
      }

      const { data, error } = await supabase
        .from('mentoring_clients')
        .select(
          'id, first_name, last_name, email, status, invitation_status, activated_at'
        )
        .eq('user_id', currentSession.user.id)
        .maybeSingle()

      if (!active) return

      if (error) {
        console.error('Failed to load client portal:', error)
        setLoadError(
          'We could not load your mentoring account. Please try again later.'
        )
        setClient(null)
      } else {
        setClient(data)
        setLoadError('')

        const { data: goalRows, error: goalError } = await supabase
          .from('mentoring_goals')
          .select('*')
          .order('position')
          .order('created_at')

        if (!active) return
        if (goalError) {
          console.error('Failed to load mentoring goals:', goalError)
          setPlanError(
            'Your plan could not be loaded. Please try refreshing the page.'
          )
          setGoals([])
        } else if (!goalRows?.length) {
          setGoals([])
          setPlanError('')
        } else {
          const { data: actionRows, error: actionError } = await supabase
            .from('mentoring_actions')
            .select('*')
            .in(
              'goal_id',
              goalRows.map((goal) => goal.id)
            )
            .order('position')
            .order('created_at')

          if (!active) return
          if (actionError) {
            console.error('Failed to load mentoring actions:', actionError)
            setPlanError(
              'Your action items could not be loaded. Please try refreshing the page.'
            )
            setGoals([])
          } else {
            const actionsByGoal = (actionRows || []).reduce(
              (grouped, action) => {
                grouped[action.goal_id] ||= []
                grouped[action.goal_id].push(action)
                return grouped
              },
              {}
            )
            setGoals(
              goalRows.map((goal) => ({
                ...goal,
                actions: actionsByGoal[goal.id] || [],
              }))
            )
            setPlanError('')
          }
        }
      }
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        if (active) {
          setLoadError(
            'We could not check your sign-in. Please refresh and try again.'
          )
          setLoading(false)
        }
        return
      }
      loadClient(data.session)
    })

    const { data } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        loadClient(currentSession)
      }
    )

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  async function handleToggleAction(action) {
    setUpdatingAction(action.id)
    setPlanError('')
    const { error } = await supabase.rpc('set_mentoring_action_complete', {
      p_action_id: action.id,
      p_completed: !action.completed_at,
    })

    if (error) {
      console.error('Failed to update mentoring action:', error)
      setPlanError('We could not update that action item. Please try again.')
      setUpdatingAction(null)
      return
    }

    const completedAt = action.completed_at ? null : new Date().toISOString()
    setGoals((currentGoals) =>
      currentGoals.map((goal) => ({
        ...goal,
        actions: goal.actions.map((item) =>
          item.id === action.id ? { ...item, completed_at: completedAt } : item
        ),
      }))
    )
    setUpdatingAction(null)
  }

  if (loading) {
    return (
      <PortalMessage title="Opening your portal…">
        Checking your account.
      </PortalMessage>
    )
  }

  if (!session) {
    return (
      <ClientLogin
        onSignedIn={(nextSession) => {
          setSession(nextSession)
          setLoading(true)
        }}
      />
    )
  }

  if (loadError) {
    return (
      <PortalMessage title="Portal unavailable">
        <p>{loadError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30"
        >
          Try again
        </button>
      </PortalMessage>
    )
  }

  if (!client) {
    return (
      <PortalMessage title="No mentoring account found">
        <p>
          This sign-in is not linked to a mentoring client record. Contact your
          mentor for help.
        </p>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="mt-5 rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30"
        >
          Sign out
        </button>
      </PortalMessage>
    )
  }

  return (
    <main className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--mentoring)]">
              Mentoring
            </p>
          </div>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-300 hover:border-white/30 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-9">
        <section className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs text-slate-500">Your mentoring space</p>
            <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
              Welcome, {client.first_name}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs capitalize text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-300" />
              {client.status}
            </span>
            {client.activated_at && (
              <span className="text-xs text-slate-600">
                Since {formatDate(client.activated_at)}
              </span>
            )}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.8fr)] lg:gap-12">
          <section className="min-w-0 py-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--mentoring)]">
                  Your development
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  Goals and actions
                </h2>
              </div>
              <p className="text-xs text-slate-500">Shared with your mentor</p>
            </div>

            {planError && (
              <p
                role="alert"
                className="mt-4 border-l-2 border-red-400 pl-4 text-sm text-red-300"
              >
                {planError}
              </p>
            )}
            {goals.length === 0 ? (
              <p className="mt-5 text-sm text-slate-500">
                Your mentor has not added any goals yet.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-white/10">
                {goals.map((goal, index) => {
                  const completedCount = goal.actions.filter(
                    (action) => action.completed_at
                  ).length
                  return (
                    <article key={goal.id} className="py-5 first:pt-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">
                            Goal {index + 1}
                          </p>
                          <h3 className="mt-1 text-base font-semibold text-slate-100">
                            {goal.title}
                          </h3>
                        </div>
                        {goal.actions.length > 0 && (
                          <p className="text-xs text-slate-500">
                            {completedCount} of {goal.actions.length} actions
                            complete
                          </p>
                        )}
                      </div>
                      {goal.description && (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-slate-400">
                          {goal.description}
                        </p>
                      )}

                      {goal.actions.length > 0 ? (
                        <ul className="mt-4 space-y-3">
                          {goal.actions.map((action) => (
                            <li
                              key={action.id}
                              className="flex items-start gap-3 border-l border-white/10 pl-3"
                            >
                              <input
                                type="checkbox"
                                aria-label={`Mark ${action.title} complete`}
                                checked={Boolean(action.completed_at)}
                                disabled={updatingAction === action.id}
                                onChange={() => handleToggleAction(action)}
                                className="mt-1 size-4 accent-[var(--mentoring)] disabled:opacity-50"
                              />
                              <div>
                                <p
                                  className={`text-sm font-medium ${action.completed_at ? 'text-slate-500 line-through' : 'text-slate-200'}`}
                                >
                                  {action.title}
                                </p>
                                {action.description && (
                                  <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-slate-400">
                                    {action.description}
                                  </p>
                                )}
                                {action.due_date && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    Due{' '}
                                    {new Date(
                                      `${action.due_date}T00:00:00`
                                    ).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-slate-500">
                          No action items for this goal yet.
                        </p>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          <MentoringSessionsPortal clientId={client.id} />
        </div>

        <section className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-slate-500">
          <p>
            For questions about your mentoring plan or sessions, contact your
            mentor directly.
          </p>
          <p>Mentoring portal</p>
        </section>
      </div>
    </main>
  )
}
