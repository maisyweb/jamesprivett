import React from 'react'
import { formatNumber } from '../../../lib/personalDevelopmentDashboard'

function Comparison({
  current,
  previous,
  field,
  direction = 'neutral',
  digits = 1,
}) {
  const now = current[field]
  const before = previous[field]
  if (
    now === null ||
    now === undefined ||
    before === null ||
    before === undefined
  ) {
    return <span className="text-xs text-slate-600">No comparison data</span>
  }
  const difference = now - before
  const pct = before !== 0 ? (difference / Math.abs(before)) * 100 : null
  const arrow = difference > 0 ? '↑' : difference < 0 ? '↓' : '→'
  const positive =
    direction === 'higher'
      ? difference > 0
      : direction === 'lower'
        ? difference < 0
        : null
  const tone =
    positive === null || difference === 0
      ? 'text-slate-500'
      : positive
        ? 'text-emerald-300'
        : 'text-rose-300'
  const label =
    pct === null
      ? formatNumber(Math.abs(difference), digits)
      : `${Math.abs(pct).toFixed(1)}%`
  return (
    <span className={`text-xs tabular-nums ${tone}`}>
      {arrow} {label} vs previous period
    </span>
  )
}

function Stat({
  label,
  value,
  current,
  previous,
  field,
  direction,
  digits = 1,
  suffix = '',
}) {
  return (
    <div className="border-t border-white/10 pt-4">
      <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
        {value}
        {suffix}
      </p>
      <div className="mt-2 min-h-4">
        <Comparison
          current={current}
          previous={previous}
          field={field}
          direction={direction}
          digits={digits}
        />
      </div>
    </div>
  )
}

export default function DashboardOverview({
  current,
  previous,
  totalDays,
  daysLogged,
  habitRate,
}) {
  const loggingRate = totalDays
    ? Math.min(100, Math.round((daysLogged / totalDays) * 100))
    : 0
  const metrics = [
    {
      label: 'Average mood',
      field: 'averageMood',
      direction: 'higher',
      suffix: ' / 10',
    },
    {
      label: 'Average sleep',
      field: 'averageSleep',
      direction: 'higher',
      suffix: ' h',
    },
    {
      label: 'Average steps',
      field: 'averageSteps',
      direction: 'higher',
      digits: 0,
    },
    { label: 'Workouts', field: 'workouts', direction: 'higher', digits: 0 },
    {
      label: 'Average day rating',
      field: 'averageDayRating',
      direction: 'higher',
      suffix: ' / 10',
    },
  ]
  return (
    <section className="grid gap-9 border-b border-white/10 py-8 lg:grid-cols-[.8fr_2fr] lg:gap-12 lg:py-10">
      <div className="flex items-center gap-5 lg:block">
        <div
          className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full border border-white/10 sm:h-32 sm:w-32"
          style={{
            background: `conic-gradient(var(--personalDevelopment) ${loggingRate}%, rgba(255,255,255,.06) ${loggingRate}% 100%)`,
          }}
        >
          <div className="absolute inset-[5px] rounded-full bg-[#090b0f]" />
          <div className="relative text-center">
            <p className="text-3xl font-semibold tabular-nums text-white">
              {loggingRate}%
            </p>
            <p className="mt-1 text-[9px] uppercase tracking-[.12em] text-slate-500">
              of days logged
            </p>
          </div>
        </div>
        <div className="lg:mt-5">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--personalDevelopment)]">
            My consistency
          </p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
            A simple measure of days recorded in this period, not a health or
            performance score.
          </p>
          <p className="mt-2 text-xs text-slate-600">
            {daysLogged} logged · {totalDays} calendar days
          </p>
          {habitRate !== null && (
            <p className="mt-1 text-xs text-slate-600">
              Recorded habit completion: {Math.round(habitRate)}%
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-x-7 gap-y-5 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <Stat
            key={metric.field}
            {...metric}
            current={current}
            previous={previous}
            value={formatNumber(current[metric.field], metric.digits ?? 1)}
          />
        ))}
      </div>
    </section>
  )
}
