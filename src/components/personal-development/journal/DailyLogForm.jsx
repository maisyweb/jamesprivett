import React from 'react'
import DailyActivities from './DailyActivities'
import DailyMetrics, { numericDailyFields } from './DailyMetrics'
import DailyReflection from './DailyReflection'
import DailyWellbeing, { scoreFields } from './DailyWellbeing'

export { numericDailyFields, scoreFields }

export default function DailyLogForm({ log, saving, onChange, onSubmit }) {
  const inputClass =
    'mt-2 w-full rounded-lg border border-white/10 bg-[#0e1218] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[var(--personalDevelopment)]/60'

  return (
    <form onSubmit={onSubmit} className="border-t border-white/10 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-600">
            Daily record
          </p>
          <h3 className="mt-2 text-xl font-semibold">Measurements and notes</h3>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[var(--personalDevelopment)] px-4 py-2.5 text-sm font-semibold text-[#090b0f] transition hover:brightness-110 disabled:opacity-50"
        >
          {saving
            ? 'Saving...'
            : log.id
              ? 'Save daily log'
              : 'Create daily log'}
        </button>
      </div>

      <DailyMetrics log={log} onChange={onChange} inputClass={inputClass} />
      <DailyWellbeing log={log} onChange={onChange} inputClass={inputClass} />
      <DailyActivities log={log} onChange={onChange} />
      <DailyReflection log={log} onChange={onChange} inputClass={inputClass} />
    </form>
  )
}
