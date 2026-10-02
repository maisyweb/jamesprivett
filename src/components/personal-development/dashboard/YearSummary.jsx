import React from 'react'
import { formatNumber } from '../../../lib/personalDevelopmentDashboard'

export default function YearSummary({ summary }) {
  return (
    <section className="border-t border-white/10 py-8">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-600">
        The journey
      </p>
      <h2 className="mt-2 text-2xl font-semibold">365 days in numbers</h2>
      <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        <Value label="Days tracked" value={formatNumber(summary.daysTracked)} />
        <Value label="Total steps" value={formatNumber(summary.totalSteps)} />
        <Value label="Workouts" value={formatNumber(summary.workouts)} />
        <Value
          label="Average sleep"
          value={
            summary.averageSleep === null
              ? '—'
              : `${formatNumber(summary.averageSleep, 1)} h`
          }
        />
        <Value
          label="Average mood"
          value={
            summary.averageMood === null
              ? '—'
              : `${formatNumber(summary.averageMood, 1)} / 10`
          }
        />
        <Value
          label="Development events"
          value={formatNumber(summary.events)}
        />
        <Value
          label="Most consistent habit"
          value={summary.mostConsistent ? summary.mostConsistent.name : '—'}
          detail={
            summary.mostConsistent
              ? `${Math.round(summary.mostConsistent.rate)}% of recorded checks`
              : 'No habit checks'
          }
        />
      </div>
    </section>
  )
}

function Value({ label, value, detail }) {
  return (
    <div className="border-t border-white/10 pt-3">
      <p className="text-[10px] font-semibold uppercase tracking-[.13em] text-slate-600">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-slate-100">{value}</p>
      {detail && <p className="mt-1 text-xs text-slate-600">{detail}</p>}
    </div>
  )
}
