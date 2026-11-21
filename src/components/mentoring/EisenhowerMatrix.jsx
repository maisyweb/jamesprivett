import React from 'react'

const quadrants = [
  {
    id: 'do',
    title: 'Do first',
    axes: 'Urgent + important',
    action: 'Give this your attention now.',
    color: '#fb7185',
    surface: 'bg-rose-400/[.045]',
  },
  {
    id: 'schedule',
    title: 'Schedule',
    axes: 'Not urgent + important',
    action: 'Choose a time before the week fills up.',
    color: '#2dd4bf',
    surface: 'bg-teal-300/[.045]',
  },
  {
    id: 'delegate',
    title: 'Delegate or renegotiate',
    axes: 'Urgent + less important',
    action: 'Ask who else could own this, or reset expectations.',
    color: '#fbbf24',
    surface: 'bg-amber-300/[.045]',
  },
  {
    id: 'eliminate',
    title: 'Reduce or remove',
    axes: 'Not urgent + less important',
    action: 'Consider whether this needs your time at all.',
    color: '#818cf8',
    surface: 'bg-indigo-300/[.045]',
  },
]

function classifyTask(urgent, important) {
  if (urgent && important) return 'do'
  if (important) return 'schedule'
  if (urgent) return 'delegate'
  return 'eliminate'
}

const inputClass =
  'w-full rounded-lg border border-white/10 bg-[#090b0f] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[var(--mentoring)]/60'

export default function EisenhowerMatrix() {
  const [tasks, setTasks] = React.useState([])
  const [title, setTitle] = React.useState('')
  const [detail, setDetail] = React.useState('')
  const [urgent, setUrgent] = React.useState(false)
  const [important, setImportant] = React.useState(false)
  const [protectedPriority, setProtectedPriority] = React.useState('')

  const counts = quadrants.reduce((result, quadrant) => {
    result[quadrant.id] = tasks.filter((task) => task.quadrant === quadrant.id).length
    return result
  }, {})
  const scheduleCount = counts.schedule
  const scheduleShare = tasks.length ? Math.round((scheduleCount / tasks.length) * 100) : 0

  function addTask(event) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) return

    setTasks((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: cleanTitle,
        detail: detail.trim(),
        quadrant: classifyTask(urgent, important),
      },
    ])
    setTitle('')
    setDetail('')
    setUrgent(false)
    setImportant(false)
  }

  function moveTask(taskId, quadrant) {
    setTasks((current) => current.map((task) => (
      task.id === taskId ? { ...task, quadrant } : task
    )))
  }

  function removeTask(taskId) {
    setTasks((current) => current.filter((task) => task.id !== taskId))
  }

  function resetMatrix() {
    setTasks([])
    setTitle('')
    setDetail('')
    setUrgent(false)
    setImportant(false)
    setProtectedPriority('')
  }

  return (
    <section aria-labelledby="eisenhower-title" className="py-5 sm:py-7">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--mentoring)]">
            Focus and priorities
          </p>
          <h2 id="eisenhower-title" className="mt-1 text-2xl font-semibold text-white">
            Eisenhower Matrix
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-400">
            Sort what is on your mind by how soon it needs attention and how much it matters to your longer-term priorities.
          </p>
        </div>
        <button
          type="button"
          onClick={resetMatrix}
          className="rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-400 transition hover:border-white/30 hover:text-white"
        >
          Clear matrix
        </button>
      </div>

      <form onSubmit={addTask} className="mt-6 rounded-xl border border-white/10 bg-[#0e1218] p-4 sm:p-5">
        <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto]">
          <label className="block text-sm text-slate-300">
            Task or open loop
            <input
              type="text"
              maxLength={120}
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What is taking up your attention?"
              className={`${inputClass} mt-2`}
            />
          </label>
          <label className="block text-sm text-slate-300">
            Context (optional)
            <input
              type="text"
              maxLength={180}
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="A deadline, next step, or useful detail"
              className={`${inputClass} mt-2`}
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-[var(--mentoring)] px-5 py-3 text-sm font-semibold text-[#090b0f] transition hover:opacity-90"
          >
            Add task
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-4">
          <label className="flex items-center gap-2.5 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={urgent}
              onChange={(event) => setUrgent(event.target.checked)}
              className="size-4 accent-rose-400"
            />
            Needs attention soon
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={important}
              onChange={(event) => setImportant(event.target.checked)}
              className="size-4 accent-teal-300"
            />
            Matters to my priorities
          </label>
          <p className="ml-auto text-xs text-slate-500">
            Goes to: <span className="text-slate-300">{quadrants.find((item) => item.id === classifyTask(urgent, important)).title}</span>
          </p>
        </div>
      </form>

      <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {quadrants.map((quadrant) => {
          const quadrantTasks = tasks.filter((task) => task.quadrant === quadrant.id)
          return (
            <section
              key={quadrant.id}
              aria-labelledby={`quadrant-${quadrant.id}`}
              className={`min-h-[220px] rounded-xl border border-white/10 ${quadrant.surface} p-4 sm:p-5`}
            >
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[.16em]" style={{ color: quadrant.color }}>
                    {quadrant.axes}
                  </p>
                  <h3 id={`quadrant-${quadrant.id}`} className="mt-1 text-base font-semibold text-white">
                    {quadrant.title}
                  </h3>
                </div>
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/10 text-xs tabular-nums text-slate-300">
                  {quadrantTasks.length}
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">{quadrant.action}</p>

              {quadrantTasks.length ? (
                <ul className="mt-3 space-y-2">
                  {quadrantTasks.map((task) => (
                    <li key={task.id} className="rounded-lg border border-white/[.08] bg-[#090b0f]/55 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-medium text-slate-100">{task.title}</p>
                          {task.detail && <p className="mt-1 break-words text-xs leading-5 text-slate-400">{task.detail}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTask(task.id)}
                          aria-label={`Remove ${task.title}`}
                          className="shrink-0 rounded px-1.5 text-sm text-slate-600 hover:text-rose-300"
                        >
                          Remove
                        </button>
                      </div>
                      <label className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                        Move to
                        <select
                          aria-label={`Move ${task.title} to another quadrant`}
                          value={task.quadrant}
                          onChange={(event) => moveTask(task.id, event.target.value)}
                          className="min-w-0 rounded-md border border-white/10 bg-[#090b0f] px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-white/25"
                        >
                          {quadrants.map((option) => (
                            <option key={option.id} value={option.id}>{option.title}</option>
                          ))}
                        </select>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-xs text-slate-600">Nothing here yet.</p>
              )}
            </section>
          )
        })}
      </div>

      <section className="mt-6 grid gap-5 border-t border-white/10 pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.7fr)] lg:items-end">
        <label className="block text-sm text-slate-300">
          Which important task will you protect time for?
          <textarea
            rows={2}
            maxLength={300}
            value={protectedPriority}
            onChange={(event) => setProtectedPriority(event.target.value)}
            placeholder="Choose one priority and when you will make space for it."
            className={`${inputClass} mt-2 resize-y leading-6`}
          />
        </label>
        <p className="text-xs leading-5 text-slate-500">
          {scheduleShare}% of your listed tasks are in Schedule.
          {tasks.length > 0 && scheduleCount === 0
            ? ' Is there something important that could use protected time?'
            : ' A small protected block can keep important work from becoming urgent.'}
        </p>
      </section>

      <p className="mt-5 text-center text-[11px] text-slate-600">
        Prototype only · Tasks and notes are temporary and reset when you leave or refresh.
      </p>
    </section>
  )
}
