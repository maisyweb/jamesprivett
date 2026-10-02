import React from 'react'

const metrics = [
  ['weight_lb', 'Weight', 'lb', '0.1'],
  ['steps', 'Steps', 'steps', '1'],
  ['calories_kcal', 'Calories', 'kcal', '1'],
  ['protein_grams', 'Protein', 'g', '1'],
  ['sleep_hours', 'Sleep', 'hours', '0.1'],
  ['water_litres', 'Water', 'litres', '0.1'],
  ['workout_minutes', 'Workout duration', 'min', '1'],
  ['alcohol_units', 'Alcohol', 'units', '0.1'],
]

export const numericDailyFields = metrics.map(([field]) => field)

export default function DailyMetrics({ log, onChange, inputClass }) {
  return (
    <section className="mt-6">
      <h4 className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">
        Measurements
      </h4>
      <div className="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([field, label, unit, step]) => (
          <label key={field} className="block text-sm text-slate-300">
            {label}
            <div className="relative">
              <input
                type="number"
                min="0"
                step={step}
                value={log[field] ?? ''}
                onChange={(event) => onChange(field, event.target.value)}
                className={`${inputClass} pr-14`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-xs text-slate-600">
                {unit}
              </span>
            </div>
          </label>
        ))}
      </div>
    </section>
  )
}
