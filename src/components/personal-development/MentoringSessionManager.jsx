import React from 'react'
import { supabase } from '../../lib/supabase'
import {
  dateTimeLocalToLondonIso,
  formatLondonDateTime,
  isoToLondonDateTimeLocal,
} from '../../lib/mentoringDates'

const fieldClass =
  'w-full rounded-lg border border-white/10 bg-[#090b0f] px-4 py-3 text-sm text-white outline-none focus:border-[var(--mentoring)]/60'

const emptyForm = {
  id: null,
  starts_at: '',
  ends_at: '',
  status: 'scheduled',
  shared_summary: '',
  private_notes: '',
}

export default function MentoringSessionManager({ clientId }) {
  const [sessions, setSessions] = React.useState([])
  const [form, setForm] = React.useState(emptyForm)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')

  async function loadSessions() {
    setLoading(true)
    setError('')

    const { data: sessionRows, error: sessionError } = await supabase
      .from('mentoring_sessions')
      .select('*')
      .eq('client_id', clientId)
      .order('starts_at', { ascending: false })

    if (sessionError) {
      console.error('Failed to load mentoring sessions:', sessionError)
      setError('Unable to load mentoring sessions.')
      setLoading(false)
      return
    }

    if (!sessionRows?.length) {
      setSessions([])
      setLoading(false)
      return
    }

    const sessionIds = sessionRows.map((item) => item.id)
    const [notesResult, reflectionResult] = await Promise.all([
      supabase
        .from('mentoring_session_notes')
        .select('session_id, private_notes')
        .in('session_id', sessionIds),
      supabase
        .from('mentoring_reflections')
        .select('session_id, progress_rating, reflection, submitted_at')
        .in('session_id', sessionIds),
    ])

    if (notesResult.error || reflectionResult.error) {
      console.error(
        'Failed to load session details:',
        notesResult.error || reflectionResult.error
      )
      setError(
        'Sessions loaded, but some notes or reflections could not be loaded.'
      )
    }

    const notesBySession = Object.fromEntries(
      (notesResult.data || []).map((item) => [
        item.session_id,
        item.private_notes,
      ])
    )
    const reflectionsBySession = Object.fromEntries(
      (reflectionResult.data || []).map((item) => [item.session_id, item])
    )
    setSessions(
      sessionRows.map((item) => ({
        ...item,
        private_notes: notesBySession[item.id] || '',
        reflection_response: reflectionsBySession[item.id] || null,
      }))
    )
    setLoading(false)
  }

  React.useEffect(() => {
    loadSessions()
  }, [clientId])

  function startEdit(item) {
    setSuccess('')
    setError('')
    setForm({
      id: item.id,
      starts_at: isoToLondonDateTimeLocal(item.starts_at),
      ends_at: isoToLondonDateTimeLocal(item.ends_at),
      status: item.status,
      shared_summary: item.shared_summary || '',
      private_notes: item.private_notes || '',
    })
  }

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const startsAt = dateTimeLocalToLondonIso(form.starts_at)
    const endsAt = dateTimeLocalToLondonIso(form.ends_at)
    if (!startsAt || !endsAt) {
      setError(
        'Enter valid UK local dates and times. That time may not exist because of the daylight-saving change.'
      )
      setSaving(false)
      return
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      setError('The session end time must be after the start time.')
      setSaving(false)
      return
    }

    const payload = {
      client_id: clientId,
      starts_at: startsAt,
      ends_at: endsAt,
      status: form.status,
      shared_summary: form.shared_summary.trim(),
    }

    let sessionId = form.id
    let saveError
    if (sessionId) {
      const result = await supabase
        .from('mentoring_sessions')
        .update(payload)
        .eq('id', sessionId)
      saveError = result.error
    } else {
      const result = await supabase
        .from('mentoring_sessions')
        .insert(payload)
        .select('id')
        .single()
      saveError = result.error
      sessionId = result.data?.id
    }

    if (!saveError && sessionId) {
      const { error: notesError } = await supabase
        .from('mentoring_session_notes')
        .upsert(
          { session_id: sessionId, private_notes: form.private_notes.trim() },
          { onConflict: 'session_id' }
        )
      saveError = notesError
    }

    if (saveError) {
      console.error('Failed to save mentoring session:', saveError)
      setError(
        'Unable to save the session. Check the database migration has been applied.'
      )
      setSaving(false)
      return
    }

    setForm(emptyForm)
    setSuccess('Session saved.')
    await loadSessions()
    setSaving(false)
  }

  async function handleDelete(item) {
    if (
      !window.confirm(
        'Delete this session and its notes and reflection? This cannot be undone.'
      )
    )
      return

    const { error: deleteError } = await supabase
      .from('mentoring_sessions')
      .delete()
      .eq('id', item.id)

    if (deleteError) {
      console.error('Failed to delete mentoring session:', deleteError)
      setError('Unable to delete the session.')
      return
    }

    if (form.id === item.id) setForm(emptyForm)
    await loadSessions()
  }

  async function handleUpdateReflection(item) {
    if (!item.reflection_response) return
    const rating = window.prompt(
      'Update progress rating from 1 to 5:',
      String(item.reflection_response.progress_rating)
    )
    if (rating === null) return
    const parsedRating = Number(rating)
    if (
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      setError('Progress rating must be a number from 1 to 5.')
      return
    }

    const { error: updateError } = await supabase
      .from('mentoring_reflections')
      .update({ progress_rating: parsedRating })
      .eq('session_id', item.id)

    if (updateError) {
      console.error('Failed to update reflection rating:', updateError)
      setError('Unable to update the reflection.')
      return
    }
    await loadSessions()
  }

  return (
    <section className="mt-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.25em] text-[var(--mentoring)]">
            Sessions
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Schedule and notes</h2>
        </div>
        <p className="text-sm text-slate-500">Times are entered in UK time</p>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 border-l-2 border-red-400 pl-4 text-sm text-red-300"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          className="mt-5 border-l-2 border-emerald-400 pl-4 text-sm text-emerald-300"
        >
          {success}
        </p>
      )}

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <form
          onSubmit={handleSave}
          className="grid gap-4 rounded-xl border border-white/10 bg-[#0e1218] p-5 sm:p-6"
        >
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              {form.id ? 'Edit session' : 'Schedule a session'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Choose the time and add notes for this session.
            </p>
          </div>
          <label className="block text-sm text-slate-400">
            Starts
            <input
              type="datetime-local"
              required
              value={form.starts_at}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  starts_at: event.target.value,
                }))
              }
              className={`${fieldClass} mt-2`}
            />
          </label>
          <label className="block text-sm text-slate-400">
            Ends
            <input
              type="datetime-local"
              required
              value={form.ends_at}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  ends_at: event.target.value,
                }))
              }
              className={`${fieldClass} mt-2`}
            />
          </label>
          <label className="block text-sm text-slate-400">
            Status
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              className={`${fieldClass} mt-2`}
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="block text-sm text-slate-400">
            Client-visible summary
            <textarea
              rows={3}
              value={form.shared_summary}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  shared_summary: event.target.value,
                }))
              }
              className={`${fieldClass} mt-2`}
              placeholder="Topics, decisions or agreed next steps"
            />
          </label>
          <label className="block text-sm text-slate-400">
            Private mentor notes
            <textarea
              rows={4}
              value={form.private_notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  private_notes: event.target.value,
                }))
              }
              className={`${fieldClass} mt-2`}
              placeholder="Only visible to admins"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--mentoring)] px-4 py-2.5 text-sm font-semibold text-[#090b0f] disabled:opacity-60"
            >
              {saving
                ? 'Saving…'
                : form.id
                  ? 'Save session'
                  : 'Schedule session'}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm(emptyForm)}
                className="rounded-lg border border-white/15 px-4 py-2.5 text-sm text-slate-300 hover:border-white/30"
              >
                Cancel editing
              </button>
            )}
          </div>
        </form>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-200">
              Session history
            </h3>
            {!loading && (
              <span className="text-xs text-slate-500">{sessions.length}</span>
            )}
          </div>
          {loading ? (
            <p className="py-8 text-sm text-slate-500">Loading sessions…</p>
          ) : sessions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 px-5 py-8 text-sm text-slate-500">
              No sessions scheduled yet.
            </p>
          ) : (
            <div className="divide-y divide-white/10 rounded-xl border border-white/10 bg-[#0e1218] px-5">
              {sessions.map((item) => (
                <article key={item.id} className="py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {formatLondonDateTime(item.starts_at)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Until {formatLondonDateTime(item.ends_at)}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[.15em] text-slate-500">
                        {item.status}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="text-slate-400 hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="text-slate-500 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {item.shared_summary && (
                    <p className="mt-4 whitespace-pre-wrap border-l border-[var(--mentoring)]/50 pl-4 text-sm leading-6 text-slate-300">
                      {item.shared_summary}
                    </p>
                  )}
                  {item.private_notes && (
                    <details className="mt-4 text-sm text-slate-400">
                      <summary className="cursor-pointer">
                        Private mentor notes
                      </summary>
                      <p className="mt-3 whitespace-pre-wrap leading-6">
                        {item.private_notes}
                      </p>
                    </details>
                  )}
                  {item.reflection_response && (
                    <div className="mt-5 border-t border-white/10 pt-4">
                      <p className="text-xs font-bold uppercase tracking-[.15em] text-slate-500">
                        Client reflection · Progress{' '}
                        {item.reflection_response.progress_rating}/5
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                        {item.reflection_response.reflection ||
                          'No written reflection provided.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleUpdateReflection(item)}
                        className="mt-2 text-xs text-slate-500 hover:text-white"
                      >
                        Correct rating
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
