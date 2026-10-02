import React from 'react'
import { formatDate } from '../../../lib/personalDevelopmentDashboard'

const periods = [
  ['7', '7 days'],
  ['30', '30 days'],
  ['90', '90 days'],
  ['365', '365 days'],
  ['all', 'All time'],
]

export default function DashboardHeader({ range, onRangeChange, dateRange }) {
  const selectedPeriod = periods.find(([value]) => value === range)?.[1]

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.24em] text-[var(--personalDevelopment)]">
            Personal development
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            How am I doing?
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            A year of data showing the habits, behaviours and choices shaping my
            progress.
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <div
            role="group"
            aria-label="Dashboard time period"
            className="inline-flex max-w-full overflow-x-auto border-b border-white/10"
          >
            {periods.map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={range === value}
                onClick={() => onRangeChange(value)}
                className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition sm:px-4 ${range === value ? 'border-[var(--personalDevelopment)] text-white' : 'border-transparent text-slate-500 hover:text-slate-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div
            className="text-xs tabular-nums text-slate-500"
            aria-live="polite"
          >
            <p className="font-medium text-slate-300">
              Viewing {selectedPeriod?.toLowerCase() || 'selected period'}
            </p>
            <p className="mt-1 text-slate-600">
              {dateRange.start
                ? `${formatDate(dateRange.start, { day: 'numeric', month: 'long', year: 'numeric' })} – ${formatDate(dateRange.end, { day: 'numeric', month: 'long', year: 'numeric' })}`
                : `All recorded dates through ${formatDate(dateRange.end, { day: 'numeric', month: 'long', year: 'numeric' })}`}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
