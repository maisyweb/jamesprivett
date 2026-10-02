import React from 'react'
import TrendChart from './TrendChart'
import { calculateWeeklyAverages } from '../../../lib/personalDevelopmentDashboard'

const measures = [
  {
    field: 'mood',
    label: 'Mood',
    color: '#e3a071',
    low: 'Very low',
    middle: 'Okay',
    high: 'Very happy',
  },
  {
    field: 'energy',
    label: 'Energy',
    color: '#8eb47e',
    low: 'Exhausted',
    middle: 'Moderate',
    high: 'Very energized',
  },
  {
    field: 'stress',
    label: 'Stress',
    color: '#b28baa',
    low: 'Very calm',
    middle: 'Moderate',
    high: 'Very stressed',
  },
]

export default function WellbeingTrends({ logs, daily = false }) {
  const data = React.useMemo(
    () =>
      daily
        ? logs
        : calculateWeeklyAverages(
            logs,
            measures.map((measure) => measure.field)
          ),
    [daily, logs]
  )

  return (
    <section className="border-t border-white/10 pt-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-600">
            Wellbeing signals
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-200">
            Mood, energy and stress
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          {daily ? 'Daily scores' : 'Weekly averages'} · same 1–10 scale
        </p>
      </div>

      <div className="mt-5 grid gap-x-7 gap-y-7 lg:grid-cols-3">
        {measures.map((measure) => (
          <div key={measure.field}>
            <TrendChart
              title={measure.label}
              rows={data}
              domain={[1, 10]}
              axisTicks={[10, 5, 1]}
              series={[
                {
                  field: measure.field,
                  label: measure.label,
                  color: measure.color,
                },
              ]}
              emptyMessage={`No ${measure.label.toLowerCase()} scores recorded in this period.`}
            />
            <div className="mt-2 flex justify-between gap-2 text-[10px] text-slate-600">
              <span>1 · {measure.low}</span>
              <span>5 · {measure.middle}</span>
              <span>10 · {measure.high}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-600">
        Higher stress means more stress. Weekly averages summarize recorded
        scores only; missing days are not treated as zero.
      </p>
    </section>
  )
}
