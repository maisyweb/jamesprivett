import React from 'react'
import { supabase } from '../../../lib/supabase'

const eventTypes = [
  'achievement',
  'fitness',
  'learning',
  'career',
  'personal',
  'milestone',
  'other',
]
const inputClass =
  'mt-2 w-full rounded-lg border border-white/10 bg-[#0e1218] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[var(--personalDevelopment)]/60'

function emptyEvent(date) {
  return {
    event_date: date,
    event_type: 'personal',
    title: '',
    description: '',
  }
}

export default function DevelopmentEventManager({ userId, selectedDate }) {
  const [events, setEvents] = React.useState([])
  const [form, setForm] = React.useState(emptyEvent(selectedDate))
  const [editingId, setEditingId] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [busyAction, setBusyAction] = React.useState('')
  const [error, setError] = React.useState(null)
  const [notice, setNotice] = React.useState(null)

  React.useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    setNotice(null)
    setEvents([])
    setForm(emptyEvent(selectedDate))
    setEditingId(null)

    async function loadEvents() {
      const { data, error: loadError } = await supabase
        .from('development_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_date', selectedDate)
        .order('created_at', { ascending: false })

      if (!active) return
      if (loadError) {
        setError(`Unable to load events: ${loadError.message}`)
      } else {
        setEvents(data || [])
      }
      setLoading(false)
    }

    loadEvents()
    return () => {
      active = false
    }
  }, [userId, selectedDate])

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function editEvent(item) {
    setEditingId(item.id)
    setForm({
      event_date: item.event_date,
      event_type: item.event_type,
      title: item.title,
      description: item.description || '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyEvent(selectedDate))
  }

  async function saveEvent(event) {
    event.preventDefault()
    setBusyAction(editingId || 'new-event')
    setError(null)
    setNotice(null)
    const payload = {
      user_id: userId,
      event_date: form.event_date,
      event_type: form.event_type,
      title: form.title.trim(),
      description: form.description.trim() || null,
    }
    const query = editingId
      ? supabase
          .from('development_events')
          .update(payload)
          .eq('id', editingId)
          .eq('user_id', userId)
      : supabase.from('development_events').insert(payload)
    const { data, error: saveError } = await query.select('*').single()

    if (saveError) {
      setError(`Unable to save event: ${saveError.message}`)
      setBusyAction('')
      return
    }
    if (data.event_date === selectedDate) {
      setEvents((current) => {
        const next = editingId
          ? current.map((item) => (item.id === data.id ? data : item))
          : [data, ...current]
        return next.sort(
          (first, second) =>
            new Date(second.created_at) - new Date(first.created_at)
        )
      })
    } else {
      setEvents((current) => current.filter((item) => item.id !== data.id))
    }
    setNotice(editingId ? 'Event updated.' : 'Event added.')
    cancelEdit()
    setBusyAction('')
  }

  async function deleteEvent(item) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`))
      return
    setBusyAction(item.id)
    setError(null)
    const { error: deleteError } = await supabase
      .from('development_events')
      .delete()
      .eq('id', item.id)
      .eq('user_id', userId)
    if (deleteError) {
      setError(`Unable to delete event: ${deleteError.message}`)
      setBusyAction('')
      return
    }
    setEvents((current) =>
      current.filter((eventItem) => eventItem.id !== item.id)
    )
    if (editingId === item.id) cancelEdit()
    setNotice('Event deleted.')
    setBusyAction('')
  }

  return (
    <section className="border-t border-white/10 py-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-600">
          Milestones and moments
        </p>
        <h3 className="mt-2 text-xl font-semibold">Development events</h3>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {error}
        </p>
      )}
      {notice && !error && (
        <p role="status" className="mt-4 text-sm text-emerald-300">
          {notice}
        </p>
      )}
      <form
        onSubmit={saveEvent}
        className="mt-5 grid gap-3 border-y border-white/[0.06] py-5 lg:grid-cols-[1fr_1fr_1.2fr_1.5fr_auto] lg:items-end"
      >
        <label className="block text-xs font-semibold text-slate-400">
          Date
          <input
            required
            type="date"
            value={form.event_date}
            onChange={(event) => updateForm('event_date', event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-xs font-semibold text-slate-400">
          Type
          <select
            value={form.event_type}
            onChange={(event) => updateForm('event_type', event.target.value)}
            className={inputClass}
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold text-slate-400">
          Title
          <input
            required
            value={form.title}
            onChange={(event) => updateForm('title', event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-xs font-semibold text-slate-400">
          Description
          <input
            value={form.description}
            onChange={(event) => updateForm('description', event.target.value)}
            className={inputClass}
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busyAction === (editingId || 'new-event')}
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#090b0f] disabled:opacity-50"
          >
            {editingId ? 'Update' : 'Add event'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-2 text-sm text-slate-500 hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      {loading ? (
        <p className="py-6 text-sm text-slate-500">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="py-6 text-sm text-slate-500">
          No events recorded for this date.
        </p>
      ) : (
        <div className="divide-y divide-white/[0.06]">
          {events.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[.15em] text-[var(--personalDevelopment)]">
                  {item.event_type} · {item.event_date}
                </p>
                <h4 className="mt-1 font-medium text-slate-200">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-500">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => editEvent(item)}
                  className="text-slate-500 hover:text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={busyAction === item.id}
                  onClick={() => deleteEvent(item)}
                  className="text-red-300/70 hover:text-red-200 disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
