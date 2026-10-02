import React from 'react'

const scores = [
  ['mood', 'Mood', 'Very low', 'Okay', 'Very happy'],
  ['energy', 'Energy', 'Exhausted', 'Moderate', 'Very energized'],
  ['stress', 'Stress', 'Very calm', 'Moderate', 'Very stressed'],
  ['day_rating', 'Day rating', 'Very poor', 'Okay', 'Excellent'],
]

export const scoreFields = scores.map(([field]) => field)

export default function DailyWellbeing({ log, onChange, inputClass }) {
  return (
    <section className="mt-8 border-t border-white/[0.06] pt-7">
      <h4 className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">
        Wellbeing
      </h4>
      <div className="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        {scores.map(([field, label, low, middle, high]) => (
          <label key={field} className="block text-sm text-slate-300">
            {label} <span className="text-slate-600">/ 10</span>
            <input
              type="number"
              min="1"
              max="10"
              step="1"
              value={log[field] ?? ''}
              onChange={(event) => onChange(field, event.target.value)}
              className={inputClass}
            />
            <span className="mt-1.5 flex justify-between gap-2 text-[10px] text-slate-600">
              <span>1 · {low}</span>
              <span>5 · {middle}</span>
              <span>10 · {high}</span>
            </span>
          </label>
        ))}
      </div>
    </section>
  )
}
