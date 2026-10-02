import React from 'react'

export default function DashboardInsights({ insights }) {
  return (
    <section className="border-t border-white/10 py-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-600">
          Signals from your data
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Insights</h2>
      </div>
      {!insights.length ? (
        <p className="mt-5 text-sm text-slate-500">
          More consistently recorded data will make personal patterns clearer.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-white/[.06]">
          {insights.map((insight, index) => (
            <li key={index} className="flex gap-4 py-4">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--personalDevelopment)]" />
              <p className="max-w-3xl text-sm leading-6 text-slate-300">
                {insight}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
