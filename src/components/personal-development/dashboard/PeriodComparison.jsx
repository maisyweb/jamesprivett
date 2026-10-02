import React from 'react'
import {
  formatDate,
  formatNumber,
} from '../../../lib/personalDevelopmentDashboard'

const directions = {
  'Average weight': 'neutral',
  'Average steps': 'higher',
  'Average sleep': 'higher',
  'Average mood': 'higher',
  'Average energy': 'higher',
  'Average stress': 'lower',
  'Average day rating': 'higher',
  Workouts: 'higher',
}

export default function PeriodComparison({
  comparisons,
  habitCurrent,
  habitPrevious,
  currentRange,
  previousRange,
}) {
  const rows = [...comparisons]
  if (habitCurrent !== null || habitPrevious !== null) {
    rows.push({
      label: 'Habit completion',
      current: habitCurrent,
      previous: habitPrevious,
      direction: 'higher',
      suffix: '%',
    })
  }
  return (
    <section className="border-t border-white/10 py-7">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-600">
        Period comparison
      </p>
      <h2 className="mt-2 text-xl font-semibold">
        Compared with the previous equivalent period
      </h2>
      {currentRange?.start && (
        <p className="mt-2 text-xs text-slate-500">
          Selected period:{' '}
          {formatDate(currentRange.start, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}{' '}
          –{' '}
          {formatDate(currentRange.end, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      )}
      {!rows.length ||
      rows.every(
        (row) => row.previous === null || row.previous === undefined
      ) ? (
        <p className="mt-4 text-sm text-slate-500">
          {previousRange?.start
            ? `No comparison data is available for ${formatDate(previousRange.start, { day: 'numeric', month: 'short', year: 'numeric' })} – ${formatDate(previousRange.end, { day: 'numeric', month: 'short', year: 'numeric' })}.`
            : 'An equivalent previous period is not available for all time.'}
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[540px] text-left">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-[.12em] text-slate-600">
                <th className="py-3 font-medium">Measure</th>
                <th className="py-3 font-medium">
                  <span className="block">Selected</span>
                  {currentRange?.start && (
                    <span className="mt-1 block normal-case tracking-normal text-slate-500">
                      {formatDate(currentRange.start)} –{' '}
                      {formatDate(currentRange.end)}
                    </span>
                  )}
                </th>
                <th className="py-3 font-medium">
                  <span className="block">Previous</span>
                  {previousRange?.start && (
                    <span className="mt-1 block normal-case tracking-normal text-slate-500">
                      {formatDate(previousRange.start)} –{' '}
                      {formatDate(previousRange.end)}
                    </span>
                  )}
                </th>
                <th className="py-3 font-medium">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[.05]">
              {rows.map((row) => {
                const difference =
                  row.current === null || row.previous === null
                    ? null
                    : row.current - row.previous
                const direction =
                  row.direction || directions[row.label] || 'neutral'
                const favorable =
                  direction === 'higher'
                    ? difference > 0
                    : direction === 'lower'
                      ? difference < 0
                      : false
                const tone =
                  difference === null ||
                  difference === 0 ||
                  direction === 'neutral'
                    ? 'text-slate-400'
                    : favorable
                      ? 'text-emerald-300'
                      : 'text-rose-300'
                const suffix = row.suffix || ''
                return (
                  <tr key={row.label}>
                    <th className="py-3 text-sm font-medium text-slate-300">
                      {row.label}
                    </th>
                    <td className="py-3 text-sm tabular-nums text-slate-200">
                      {formatNumber(row.current, 1)}
                      {suffix}
                    </td>
                    <td className="py-3 text-sm tabular-nums text-slate-500">
                      {formatNumber(row.previous, 1)}
                      {suffix}
                    </td>
                    <td className={`py-3 text-sm tabular-nums ${tone}`}>
                      {difference === null
                        ? '—'
                        : `${difference > 0 ? '↑' : difference < 0 ? '↓' : '→'} ${formatNumber(Math.abs(difference), 1)}${suffix}`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-slate-600">
        Weight changes are shown neutrally; a higher or lower value is not
        automatically better.
      </p>
    </section>
  )
}
