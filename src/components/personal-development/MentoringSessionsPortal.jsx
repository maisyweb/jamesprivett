import React from 'react'
import { supabase } from '../../lib/supabase'
import { formatLondonDateTime } from '../../lib/mentoringDates'

const fieldClass =
  'w-full rounded-lg border border-white/10 bg-[#090b0f] px-4 py-3 text-sm text-white outline-none focus:border-[var(--mentoring)]/60'

export default function MentoringSessionsPortal({ clientId }) {
  const [sessions, setSessions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')
  const [forms, setForms] = React.useState({})
  const [savingId, setSavingId] = React.useState(null)
  const [activeReflectionSession, setActiveReflectionSession] =
    React.useState(null)

  async function loadSessions() {
    setLoading(true)
    setError('')

    const { data: sessionRows, error: sessionError } = await supabase
      .from('mentoring_sessions')
      .select('id, starts_at, ends_at, status, shared_summary')
      .eq('client_id', clientId)
      .neq('status', 'cancelled')
      .order('starts_at', { ascending: false })

    if (sessionError) {
      console.error('Failed to load client sessions:', sessionError)
      setError('Your sessions could not be loaded. Please try again later.')
      setLoading(false)
      return
    }

    if (!sessionRows?.length) {
      setSessions([])
      setLoading(false)
      return
    }

    const { data: reflectionRows, error: reflectionError } = await supabase
      .from('mentoring_reflections')
      .select('session_id, progress_rating, reflection, submitted_at')
      .in(
        'session_id',
        sessionRows.map((item) => item.id)
      )

    if (reflectionError) {
      console.error('Failed to load client reflections:', reflectionError)
      setError('Sessions loaded, but reflections could not be loaded.')
    }

    const reflectionBySession = Object.fromEntries(
      (reflectionRows || []).map((item) => [item.session_id, item])
    )
    const loadedSessions = sessionRows.map((item) => ({
      ...item,
      reflection: reflectionBySession[item.id] || null,
    }))
    setSessions(loadedSessions)
    setForms(
      Object.fromEntries(
        loadedSessions.map((item) => [
          item.id,
          {
            progress_rating: String(item.reflection?.progress_rating || 3),
            reflection: item.reflection?.reflection || '',
          },
        ])
      )
    )
    setLoading(false)
  }

  React.useEffect(() => {
    loadSessions()
  }, [clientId])

  React.useEffect(() => {
    if (!activeReflectionSession) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape' && savingId !== activeReflectionSession.id) {
        setActiveReflectionSession(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeReflectionSession, savingId])

  function updateForm(sessionId, field, value) {
    setForms((current) => ({
      ...current,
      [sessionId]: { ...current[sessionId], [field]: value },
    }))
  }

  async function handleSubmit(event, item) {
    event.preventDefault()
    const form = forms[item.id] || {}
    setSavingId(item.id)
    setError('')
    setSuccess('')

    const { error: submitError } = await supabase.rpc(
      'submit_mentoring_reflection',
      {
        p_session_id: item.id,
        p_progress_rating: Number(form.progress_rating),
        p_reflection: form.reflection?.trim() || '',
      }
    )

    if (submitError) {
      console.error('Failed to submit client reflection:', submitError)
      setError('We could not save your reflection. Please try again.')
      setSavingId(null)
      return
    }

    setSuccess('Your reflection has been saved.')
    await loadSessions()
    setSavingId(null)
    setActiveReflectionSession(null)
  }

  return (
    <section className="min-w-0 border-t border-white/10 py-7 lg:border-l lg:border-t-0 lg:pl-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--mentoring)]">
          Sessions
        </p>
        <h2 className="mt-1 text-xl font-semibold">Your sessions</h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          UK time · Changes are managed by your mentor
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 border-l-2 border-red-400 pl-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          className="mt-4 border-l-2 border-emerald-400 pl-3 text-sm text-emerald-300"
        >
          {success}
        </p>
      )}

      {loading ? (
        <p className="mt-5 text-sm text-slate-500">Loading sessions…</p>
      ) : sessions.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">
          No sessions have been scheduled yet.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-white/10">
          {sessions.map((item) => (
            <article key={item.id} className="py-5 first:pt-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold leading-5 text-slate-100">
                    {formatLondonDateTime(item.starts_at)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Until {formatLondonDateTime(item.ends_at)}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold uppercase tracking-[.15em] ${item.status === 'completed' ? 'text-emerald-300' : 'text-[var(--mentoring)]'}`}
                >
                  {item.status}
                </span>
              </div>

              {item.status === 'completed' && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                  {item.reflection ? (
                    <p className="text-xs text-slate-500">
                      Reflection saved · Progress{' '}
                      {item.reflection.progress_rating}/5
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Share a reflection with your mentor
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveReflectionSession(item)}
                    className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-[var(--mentoring)]/50 hover:text-white"
                  >
                    {item.reflection ? 'Edit reflection' : 'Reflect on session'}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {activeReflectionSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingId) {
              setActiveReflectionSession(null)
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="mentoring-reflection-title"
            className="my-auto max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border border-white/10 bg-[#10141a] p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--mentoring)]">
                  Session reflection
                </p>
                <h3
                  id="mentoring-reflection-title"
                  className="mt-2 text-lg font-semibold text-slate-100"
                >
                  {formatLondonDateTime(activeReflectionSession.starts_at)}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Until {formatLondonDateTime(activeReflectionSession.ends_at)}{' '}
                  · UK time
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveReflectionSession(null)}
                disabled={savingId === activeReflectionSession.id}
                aria-label="Close reflection form"
                className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-400 hover:border-white/30 hover:text-white disabled:opacity-50"
              >
                Close
              </button>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[.15em] text-slate-500">
                Session status
              </p>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-emerald-300">
                {activeReflectionSession.status}
              </span>
            </div>
            <div className="mt-4 border-l-2 border-[var(--mentoring)]/60 pl-4">
              <p className="text-xs font-semibold uppercase tracking-[.15em] text-slate-400">
                Session summary
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                {activeReflectionSession.shared_summary ||
                  'Your mentor has not added a session summary.'}
              </p>
            </div>
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[.15em] text-slate-400">
                Your reflection
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Shared with your mentor
              </p>
            </div>
            <ReflectionForm
              item={activeReflectionSession}
              form={forms[activeReflectionSession.id]}
              updateForm={updateForm}
              onSubmit={handleSubmit}
              saving={savingId === activeReflectionSession.id}
            />
          </section>
        </div>
      )}
    </section>
  )
}

function ReflectionForm({ item, form = {}, updateForm, onSubmit, saving }) {
  return (
    <form
      onSubmit={(event) => onSubmit(event, item)}
      className="mt-5 grid gap-4"
    >
      <label className="text-sm text-slate-400">
        Progress rating
        <select
          required
          value={form.progress_rating || '3'}
          onChange={(event) =>
            updateForm(item.id, 'progress_rating', event.target.value)
          }
          className={`${fieldClass} mt-2`}
        >
          <option value="1">1 · Not yet</option>
          <option value="2">2 · A little</option>
          <option value="3">3 · Some progress</option>
          <option value="4">4 · Good progress</option>
          <option value="5">5 · Strong progress</option>
        </select>
      </label>
      <label className="text-sm text-slate-400">
        Reflection
        <textarea
          rows={3}
          maxLength={5000}
          value={form.reflection || ''}
          onChange={(event) =>
            updateForm(item.id, 'reflection', event.target.value)
          }
          placeholder="What stood out? What will you take forward?"
          className={`${fieldClass} mt-2`}
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-[var(--mentoring)] px-4 py-2.5 text-sm font-semibold text-[#090b0f] disabled:opacity-60 sm:w-fit"
      >
        {saving ? 'Saving…' : 'Save reflection'}
      </button>
    </form>
  )
}
