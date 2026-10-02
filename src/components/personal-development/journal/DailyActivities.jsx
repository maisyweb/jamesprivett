import React from 'react'

const activities = [
  ['workout_completed', 'Workout completed'],
  ['reading_completed', 'Reading completed'],
  ['learning_completed', 'Learning completed'],
  ['family_time', 'Family time'],
  ['outdoors', 'Spent time outdoors'],
]

export default function DailyActivities({ log, onChange }) {
  return (
    <section className="mt-8 border-t border-white/[0.06] pt-7">
      <h4 className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">
        Daily activities
      </h4>
      <div className="mt-4 flex flex-wrap gap-x-7 gap-y-4">
        {activities.map(([field, label]) => (
          <label
            key={field}
            className="flex items-center gap-2.5 text-sm text-slate-300"
          >
            <input
              type="checkbox"
              checked={Boolean(log[field])}
              onChange={(event) => onChange(field, event.target.checked)}
              className="h-4 w-4 accent-[var(--personalDevelopment)]"
            />
            {label}
          </label>
        ))}
      </div>
    </section>
  )
}
