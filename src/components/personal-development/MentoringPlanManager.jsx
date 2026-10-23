import React from 'react'
import { supabase } from '../../lib/supabase'

function formatDate(value) {
  if (!value) return 'No due date'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const inputClassName =
  'w-full rounded-lg border border-white/10 bg-[#090b0f] px-4 py-3 text-sm text-white outline-none focus:border-[var(--mentoring)]/60'

export default function MentoringPlanManager({ clientId }) {
  const [goals, setGoals] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [goalTitle, setGoalTitle] = React.useState('')
  const [goalDescription, setGoalDescription] = React.useState('')
  const [savingGoal, setSavingGoal] = React.useState(false)
  const [savingActionFor, setSavingActionFor] = React.useState(null)
  const [actionForms, setActionForms] = React.useState({})

  async function loadPlan() {
    setLoading(true)
    setError('')

    const { data: goalRows, error: goalError } = await supabase
      .from('mentoring_goals')
      .select('*')
      .eq('client_id', clientId)
      .order('position')
      .order('created_at')

    if (goalError) {
      console.error('Failed to load mentoring goals:', goalError)
      setError('Unable to load the mentoring plan.')
      setLoading(false)
      return
    }

    if (!goalRows?.length) {
      setGoals([])
      setLoading(false)
      return
    }

    const { data: actionRows, error: actionError } = await supabase
      .from('mentoring_actions')
      .select('*')
      .in('goal_id', goalRows.map((goal) => goal.id))
      .order('position')
      .order('created_at')

    if (actionError) {
      console.error('Failed to load mentoring action items:', actionError)
      setError('Unable to load the mentoring action items.')
      setLoading(false)
      return
    }

    const actionsByGoal = (actionRows || []).reduce((grouped, action) => {
      grouped[action.goal_id] ||= []
      grouped[action.goal_id].push(action)
      return grouped
    }, {})

    setGoals(goalRows.map((goal) => ({ ...goal, actions: actionsByGoal[goal.id] || [] })))
    setLoading(false)
  }

  React.useEffect(() => {
    loadPlan()
  }, [clientId])

  async function handleAddGoal(event) {
    event.preventDefault()
    if (!goalTitle.trim()) return

    setSavingGoal(true)
    setError('')
    const { error: insertError } = await supabase.from('mentoring_goals').insert({
      client_id: clientId,
      title: goalTitle.trim(),
      description: goalDescription.trim(),
      position: goals.length,
    })

    if (insertError) {
      console.error('Failed to add mentoring goal:', insertError)
      setError('Unable to add this goal.')
    } else {
      setGoalTitle('')
      setGoalDescription('')
      await loadPlan()
    }
    setSavingGoal(false)
  }

  function updateActionForm(goalId, field, value) {
    setActionForms((current) => ({
      ...current,
      [goalId]: { ...current[goalId], [field]: value },
    }))
  }

  async function handleAddAction(event, goal) {
    event.preventDefault()
    const actionForm = actionForms[goal.id] || {}
    if (!actionForm.title?.trim()) return

    setSavingActionFor(goal.id)
    setError('')
    const { error: insertError } = await supabase.from('mentoring_actions').insert({
      goal_id: goal.id,
      title: actionForm.title.trim(),
      description: actionForm.description?.trim() || '',
      due_date: actionForm.due_date || null,
      position: goal.actions.length,
    })

    if (insertError) {
      console.error('Failed to add mentoring action:', insertError)
      setError('Unable to add this action item.')
    } else {
      setActionForms((current) => ({ ...current, [goal.id]: {} }))
      await loadPlan()
    }
    setSavingActionFor(null)
  }

  async function handleDelete(table, id, description) {
    if (!window.confirm(`Delete ${description}? This cannot be undone.`)) return

    setError('')
    const { error: deleteError } = await supabase.from(table).delete().eq('id', id)
    if (deleteError) {
      console.error(`Failed to delete ${description}:`, deleteError)
      setError(`Unable to delete ${description}.`)
      return
    }
    await loadPlan()
  }

  async function handleToggleAction(action) {
    setError('')
    const { error: updateError } = await supabase
      .from('mentoring_actions')
      .update({ completed_at: action.completed_at ? null : new Date().toISOString() })
      .eq('id', action.id)

    if (updateError) {
      console.error('Failed to update action item:', updateError)
      setError('Unable to update this action item.')
      return
    }
    await loadPlan()
  }

  return (
    <section className="mt-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.25em] text-[var(--mentoring)]">
            Client plan
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Goals and actions</h2>
        </div>
        <p className="text-sm text-slate-500">Visible in the client portal</p>
      </div>

      {error && <p role="alert" className="mt-5 border-l-2 border-red-400 pl-4 text-sm text-red-300">{error}</p>}

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <form onSubmit={handleAddGoal} className="grid gap-4 rounded-xl border border-white/10 bg-[#0e1218] p-5 sm:p-6">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Add a goal</h3>
            <p className="mt-1 text-sm text-slate-500">Set a focus area for this client.</p>
          </div>
          <input
            aria-label="Goal title"
            maxLength={160}
            placeholder="Goal title"
            required
            value={goalTitle}
            onChange={(event) => setGoalTitle(event.target.value)}
            className={inputClassName}
          />
          <textarea
            aria-label="Goal description"
            rows={4}
            placeholder="Description (optional)"
            value={goalDescription}
            onChange={(event) => setGoalDescription(event.target.value)}
            className={inputClassName}
          />
          <button type="submit" disabled={savingGoal} className="w-fit rounded-lg bg-[var(--mentoring)] px-4 py-2.5 text-sm font-semibold text-[#090b0f] disabled:opacity-60">
            {savingGoal ? 'Adding…' : 'Add goal'}
          </button>
        </form>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-200">Current goals</h3>
            {!loading && <span className="text-xs text-slate-500">{goals.length}</span>}
          </div>
          {loading ? (
            <p className="py-8 text-sm text-slate-500">Loading plan…</p>
          ) : goals.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 px-5 py-8 text-sm text-slate-500">No goals added yet.</p>
          ) : (
            <div className="divide-y divide-white/10 rounded-xl border border-white/10 bg-[#0e1218] px-5">
          {goals.map((goal, goalIndex) => (
            <article key={goal.id} className="py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">Goal {goalIndex + 1}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-100">{goal.title}</h3>
                  {goal.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">{goal.description}</p>}
                </div>
                <button type="button" onClick={() => handleDelete('mentoring_goals', goal.id, 'this goal')} className="shrink-0 text-sm text-slate-500 hover:text-red-300">
                  Delete
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {goal.actions.map((action) => (
                  <div key={action.id} className="flex flex-wrap items-start justify-between gap-3 border-l border-white/10 pl-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        aria-label={`Mark ${action.title} complete`}
                        checked={Boolean(action.completed_at)}
                        onChange={() => handleToggleAction(action)}
                        className="mt-1 size-4 accent-[var(--mentoring)]"
                      />
                      <div>
                        <p className={`text-sm font-medium ${action.completed_at ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{action.title}</p>
                        {action.description && <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-500">{action.description}</p>}
                        <p className="mt-1 text-xs text-slate-600">Due {formatDate(action.due_date)}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => handleDelete('mentoring_actions', action.id, 'this action item')} className="text-sm text-slate-600 hover:text-red-300">
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={(event) => handleAddAction(event, goal)} className="mt-4 grid gap-3 sm:grid-cols-[1fr_150px]">
                <input
                  aria-label={`Action item for ${goal.title}`}
                  maxLength={160}
                  placeholder="Add an action item"
                  required
                  value={actionForms[goal.id]?.title || ''}
                  onChange={(event) => updateActionForm(goal.id, 'title', event.target.value)}
                  className={inputClassName}
                />
                <input
                  aria-label="Action due date"
                  type="date"
                  value={actionForms[goal.id]?.due_date || ''}
                  onChange={(event) => updateActionForm(goal.id, 'due_date', event.target.value)}
                  className={inputClassName}
                />
                <textarea
                  aria-label="Action item description"
                  rows={2}
                  placeholder="Description (optional)"
                  value={actionForms[goal.id]?.description || ''}
                  onChange={(event) => updateActionForm(goal.id, 'description', event.target.value)}
                  className={`${inputClassName} sm:col-span-2`}
                />
                <button type="submit" disabled={savingActionFor === goal.id} className="w-fit rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-white/30 hover:text-white disabled:opacity-60">
                  {savingActionFor === goal.id ? 'Adding…' : 'Add action'}
                </button>
              </form>
            </article>
          ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
