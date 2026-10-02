import React from 'react'

const reflections = [
  ['went_well', 'What went well'],
  ['could_improve', 'What could improve'],
  ['learned', 'What I learned'],
]

export default function DailyReflection({ log, onChange, inputClass }) {
  return (
    <section className="mt-8 border-t border-white/[0.06] pt-7">
      <h4 className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">
        Reflection
      </h4>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {reflections.map(([field, label]) => (
          <label key={field} className="block text-sm text-slate-300">
            {label}
            <textarea
              rows="4"
              value={log[field] || ''}
              onChange={(event) => onChange(field, event.target.value)}
              className={inputClass}
            />
          </label>
        ))}
      </div>
    </section>
  )
}
