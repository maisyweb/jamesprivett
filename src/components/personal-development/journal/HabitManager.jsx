import React from 'react'
import { supabase } from '../../../lib/supabase'

const inputClass =
  'mt-2 w-full rounded-lg border border-white/10 bg-[#0e1218] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[var(--personalDevelopment)]/60'

function emptyHabitForm() {
  return {
    name: '',
    description: '',
    target_type: 'boolean',
    target_value: '',
    sort_order: 0,
    active: true,
  }
}

function numberOrNull(value) {
  return value === '' || value === null ? null : Number(value)
}

export default function HabitManager({ userId, selectedDate, dailyLogId }) {
  const [habits, setHabits] = React.useState([])
  const [dailyHabits, setDailyHabits] = React.useState({})
  const [form, setForm] = React.useState(emptyHabitForm)
  const [editingId, setEditingId] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [busyAction, setBusyAction] = React.useState('')
  const [error, setError] = React.useState(null)
  const [notice, setNotice] = React.useState(null)

  React.useEffect(() => {
    let active = true

    async function loadHabits() {
      setLoading(true)
      setError(null)
      setDailyHabits({})

      const habitsResult = await supabase
        .from('habit_definitions')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (habitsResult.error) {
        if (active) {
          setError(`Unable to load habits: ${habitsResult.error.message}`)
          setLoading(false)
        }
        return
      }

      let rows = []
      if (dailyLogId) {
        const dailyResult = await supabase
          .from('daily_habits')
          .select('*')
          .eq('daily_log_id', dailyLogId)

        if (dailyResult.error) {
          if (active) {
            setError(
              `Unable to load today's habits: ${dailyResult.error.message}`
            )
            setLoading(false)
          }
          return
        }
        rows = dailyResult.data || []
      }

      if (!active) return
      setHabits(habitsResult.data || [])
      setDailyHabits(
        Object.fromEntries(
          rows.map((row) => [
            row.habit_id,
            { ...row, draftValue: row.value ?? '' },
          ])
        )
      )
      setLoading(false)
    }

    loadHabits()
    return () => {
      active = false
    }
  }, [userId, selectedDate, dailyLogId])

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function editHabit(habit) {
    setEditingId(habit.id)
    setForm({
      name: habit.name,
      description: habit.description || '',
      target_type: habit.target_type || 'boolean',
      target_value: habit.target_value ?? '',
      sort_order: habit.sort_order ?? 0,
      active: habit.active ?? true,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyHabitForm())
  }

  async function saveDefinition(event) {
    event.preventDefault()
    setBusyAction(editingId || 'new-habit')
    setError(null)
    setNotice(null)

    const payload = {
      user_id: userId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      target_type: form.target_type,
      target_value:
        form.target_type === 'numeric' ? numberOrNull(form.target_value) : null,
      sort_order: Number(form.sort_order) || 0,
      active: form.active,
    }
    const query = editingId
      ? supabase
          .from('habit_definitions')
          .update(payload)
          .eq('id', editingId)
          .eq('user_id', userId)
      : supabase.from('habit_definitions').insert(payload)
    const { data, error: saveError } = await query.select('*').single()

    if (saveError) {
      setError(`Unable to save habit: ${saveError.message}`)
      setBusyAction('')
      return
    }

    setHabits((current) => {
      const next = editingId
        ? current.map((habit) => (habit.id === editingId ? data : habit))
        : [...current, data]
      return next.sort(
        (first, second) =>
          (first.sort_order || 0) - (second.sort_order || 0) ||
          new Date(first.created_at) - new Date(second.created_at)
      )
    })
    setNotice(editingId ? 'Habit updated.' : 'Habit added.')
    cancelEdit()
    setBusyAction('')
  }

  async function toggleActive(habit) {
    setBusyAction(habit.id)
    setError(null)
    const { data, error: updateError } = await supabase
      .from('habit_definitions')
      .update({ active: !habit.active })
      .eq('id', habit.id)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (updateError) {
      setError(`Unable to update habit: ${updateError.message}`)
      setBusyAction('')
      return
    }
    setHabits((current) =>
      current.map((item) => (item.id === habit.id ? data : item))
    )
    setBusyAction('')
  }

  async function saveDailyEntry(habit, completed, rawValue) {
    if (!dailyLogId) {
      setError('Save the daily log before recording habit completion.')
      return
    }

    const value = numberOrNull(rawValue)
    if (value !== null && (!Number.isFinite(value) || value < 0)) {
      setError('Habit value must be zero or greater.')
      return
    }

    setBusyAction(`daily-${habit.id}`)
    setError(null)
    const { data, error: saveError } = await supabase
      .from('daily_habits')
      .upsert(
        {
          daily_log_id: dailyLogId,
          habit_id: habit.id,
          completed,
          value: habit.target_type === 'numeric' ? value : null,
        },
        { onConflict: 'daily_log_id,habit_id' }
      )
      .select('*')
      .single()

    if (saveError) {
      setError(`Unable to save habit completion: ${saveError.message}`)
      setBusyAction('')
      return
    }
    setDailyHabits((current) => ({
      ...current,
      [habit.id]: { ...data, draftValue: data.value ?? '' },
    }))
    setNotice(`${habit.name} updated.`)
    setBusyAction('')
  }

  return (
    <section className="border-t border-white/10 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-600">
            Repeatable routines
          </p>
          <h3 className="mt-2 text-xl font-semibold">Habits</h3>
        </div>
        <p className="text-sm text-slate-500">
          {habits.filter((habit) => habit.active).length} active
        </p>
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
        onSubmit={saveDefinition}
        className="mt-5 grid gap-3 border-y border-white/[0.06] py-5 lg:grid-cols-[1.1fr_1.4fr_.8fr_.7fr_.5fr_auto] lg:items-end"
      >
        <label className="block text-xs font-semibold text-slate-400">
          Habit name
          <input
            required
            value={form.name}
            onChange={(event) => updateForm('name', event.target.value)}
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
        <label className="block text-xs font-semibold text-slate-400">
          Target type
          <select
            value={form.target_type}
            onChange={(event) => updateForm('target_type', event.target.value)}
            className={inputClass}
          >
            <option value="boolean">Done / not done</option>
            <option value="numeric">Numeric value</option>
          </select>
        </label>
        {form.target_type === 'numeric' ? (
          <label className="block text-xs font-semibold text-slate-400">
            Target value
            <input
              type="number"
              min="0"
              step="any"
              value={form.target_value}
              onChange={(event) =>
                updateForm('target_value', event.target.value)
              }
              className={inputClass}
            />
          </label>
        ) : (
          <div />
        )}
        <label className="block text-xs font-semibold text-slate-400">
          Order
          <input
            type="number"
            step="1"
            value={form.sort_order}
            onChange={(event) => updateForm('sort_order', event.target.value)}
            className={inputClass}
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busyAction === (editingId || 'new-habit')}
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#090b0f] disabled:opacity-50"
          >
            {editingId ? 'Update' : 'Add habit'}
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
        <label className="flex items-center gap-2 text-xs text-slate-400 lg:col-span-full">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => updateForm('active', event.target.checked)}
            className="h-4 w-4 accent-[var(--personalDevelopment)]"
          />
          Active habit
        </label>
      </form>

      {loading ? (
        <p className="py-6 text-sm text-slate-500">Loading habits...</p>
      ) : habits.length === 0 ? (
        <p className="py-6 text-sm text-slate-500">No habits yet.</p>
      ) : (
        <div className="divide-y divide-white/[0.06]">
          {habits.map((habit) => {
            const entry = dailyHabits[habit.id]
            const busy =
              busyAction === habit.id || busyAction === `daily-${habit.id}`
            return (
              <div
                key={habit.id}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 sm:flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium text-slate-200">{habit.name}</h4>
                    {!habit.active && (
                      <span className="text-xs text-slate-600">Inactive</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {habit.description ||
                      (habit.target_type === 'numeric'
                        ? `Target: ${habit.target_value ?? 'not set'}`
                        : 'Daily check-in')}
                  </p>
                </div>
                {habit.target_type === 'numeric' ? (
                  <form
                    className="flex items-end gap-2 sm:w-64"
                    onSubmit={(event) => {
                      event.preventDefault()
                      const value = entry?.draftValue ?? entry?.value ?? ''
                      const completed =
                        habit.target_value == null ||
                        Number(value) >= Number(habit.target_value)
                      saveDailyEntry(habit, completed, value)
                    }}
                  >
                    <label className="min-w-0 flex-1 text-xs text-slate-500">
                      Value
                      {habit.target_value != null
                        ? ` / ${habit.target_value}`
                        : ''}
                      <input
                        type="number"
                        min="0"
                        step="any"
                        disabled={!dailyLogId || !habit.active}
                        value={entry?.draftValue ?? entry?.value ?? ''}
                        onChange={(event) =>
                          setDailyHabits((current) => ({
                            ...current,
                            [habit.id]: {
                              ...(current[habit.id] || { completed: false }),
                              draftValue: event.target.value,
                            },
                          }))
                        }
                        className={`${inputClass} disabled:opacity-40`}
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={!dailyLogId || !habit.active || busy}
                      className="mb-px rounded-lg border border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:border-white/25 disabled:opacity-40"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={Boolean(entry?.completed)}
                      disabled={!dailyLogId || !habit.active || busy}
                      onChange={(event) =>
                        saveDailyEntry(habit, event.target.checked, null)
                      }
                      className="h-4 w-4 accent-[var(--personalDevelopment)] disabled:opacity-40"
                    />
                    Complete
                  </label>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <button
                    type="button"
                    onClick={() => editHabit(habit)}
                    className="text-slate-500 hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => toggleActive(habit)}
                    className="text-slate-500 hover:text-white disabled:opacity-40"
                  >
                    {habit.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {!dailyLogId && habits.length > 0 && (
        <p className="mt-2 text-xs text-amber-200/70">
          Create the daily log before recording habit completions.
        </p>
      )}
    </section>
  )
}
