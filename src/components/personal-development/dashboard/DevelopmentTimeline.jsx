import React from 'react'
import { formatDate } from '../../../lib/personalDevelopmentDashboard'

const eventTone = {
  achievement: 'border-emerald-300 text-emerald-300',
  fitness: 'border-sky-300 text-sky-300',
  learning:
    'border-[var(--personalDevelopment)] text-[var(--personalDevelopment)]',
  career: 'border-blue-300 text-blue-300',
  personal: 'border-rose-300 text-rose-300',
  milestone: 'border-white text-white',
  other: 'border-slate-500 text-slate-400',
}

export default function DevelopmentTimeline({ events }) {
  const [expanded, setExpanded] = React.useState(false)
  const visible = expanded ? events : events.slice(0, 8)
  return (
    <section className="border-t border-white/10 py-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-600">
          Personal development timeline
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Moments that mattered</h2>
      </div>
      {!events.length ? (
        <p className="mt-6 text-sm text-slate-500">
          No events recorded in this period.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-white/[.06]">
          {visible.map((event) => (
            <article
              key={event.id}
              className="grid gap-3 py-4 sm:grid-cols-[100px_110px_1fr] sm:gap-5"
            >
              <time
                dateTime={event.event_date}
                className="text-xs tabular-nums text-slate-600"
              >
                {formatDate(event.event_date, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </time>
              <span
                className={`h-fit w-fit border-l-2 pl-2 text-[10px] font-semibold uppercase tracking-[.12em] ${eventTone[event.event_type] || eventTone.other}`}
              >
                {event.event_type}
              </span>
              <div>
                <h3 className="text-sm font-medium text-slate-200">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-500">
                    {event.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {events.length > 8 && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-4 text-sm text-[var(--personalDevelopment)] hover:text-white"
        >
          {expanded ? 'Show fewer events' : `Show all ${events.length} events`}
        </button>
      )}
    </section>
  )
}
