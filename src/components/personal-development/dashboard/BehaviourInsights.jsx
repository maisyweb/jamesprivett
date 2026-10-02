import React from 'react'
import {
  compareBehaviour,
  formatNumber,
} from '../../../lib/personalDevelopmentDashboard'

const comparisons = [
  {
    title: 'Workout days',
    outcome: 'mood',
    field: 'workout_completed',
    match: (value) => value === true,
    left: 'Workout logged',
    right: 'No workout logged',
    label: 'Average mood',
  },
  {
    title: 'Sleep',
    outcome: 'mood',
    field: 'sleep_hours',
    match: (value) => Number(value) >= 7,
    left: '7+ hours',
    right: 'Under 7 hours',
    label: 'Average mood',
  },
  {
    title: 'Reading',
    outcome: 'day_rating',
    field: 'reading_completed',
    match: (value) => value === true,
    left: 'Reading logged',
    right: 'No reading logged',
    label: 'Average day rating',
  },
  {
    title: 'Steps',
    outcome: 'energy',
    field: 'steps',
    match: (value) => Number(value) >= 10000,
    left: '10,000+ steps',
    right: 'Under 10,000 steps',
    label: 'Average energy',
  },
]

function CompareRow({ logs, item }) {
  const result = compareBehaviour(logs, item.outcome, item.field, item.match)
  const enough = result.withCount > 0 || result.withoutCount > 0
  const difference =
    result.withBehavior === null || result.withoutBehavior === null
      ? null
      : result.withBehavior - result.withoutBehavior
  return (
    <article className="grid gap-3 border-t border-white/[.07] py-4 sm:grid-cols-[.8fr_1fr_1fr_1fr] sm:items-center">
      <div>
        <h3 className="text-sm font-medium text-slate-200">{item.title}</h3>
        <p className="mt-1 text-[10px] uppercase tracking-[.1em] text-slate-600">
          {item.label}
        </p>
      </div>
      <div>
        <p className="text-[10px] text-slate-600">{item.left}</p>
        <p className="mt-1 text-lg tabular-nums text-slate-200">
          {formatNumber(result.withBehavior, 1)}
          <span className="text-xs text-slate-600"> / 10</span>
        </p>
        <p className="text-[10px] text-slate-600">
          {result.withCount} comparable days
        </p>
      </div>
      <div>
        <p className="text-[10px] text-slate-600">{item.right}</p>
        <p className="mt-1 text-lg tabular-nums text-slate-200">
          {formatNumber(result.withoutBehavior, 1)}
          <span className="text-xs text-slate-600"> / 10</span>
        </p>
        <p className="text-[10px] text-slate-600">
          {result.withoutCount} comparable days
        </p>
      </div>
      <p
        className={`text-sm tabular-nums ${difference === null || difference === 0 ? 'text-slate-500' : difference > 0 ? 'text-emerald-300' : 'text-rose-300'}`}
      >
        {difference === null
          ? 'Not enough data'
          : `${difference > 0 ? '+' : ''}${difference.toFixed(1)} point difference`}
      </p>
      {!enough && (
        <p className="sr-only">No observations for this comparison.</p>
      )}
    </article>
  )
}

export default function BehaviourInsights({ logs }) {
  const available = comparisons.filter((item) =>
    logs.some(
      (log) => log[item.field] !== null && log[item.field] !== undefined
    )
  )
  return (
    <section className="border-t border-white/10 py-8">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-600">
          Behaviour vs outcome
        </p>
        <h2 className="mt-2 text-2xl font-semibold">
          What seems to make a difference?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Personal-data comparisons, not proof of cause. Days with unrecorded
          behavior are excluded.
        </p>
      </div>
      {!available.length ? (
        <p className="mt-6 text-sm text-slate-500">
          More logged behaviors are needed for these comparisons.
        </p>
      ) : (
        <div className="mt-6">
          {available.map((item) => (
            <CompareRow key={item.title} logs={logs} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}
