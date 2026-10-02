import React from 'react'
import { formatDate } from '../../../lib/personalDevelopmentDashboard'

export default function ReflectionSection({ logs }) {
  const reflections = logs
    .filter((log) => log.went_well || log.could_improve || log.learned)
    .slice(-5)
    .reverse()
  return (
    <section className="border-t border-white/10 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-600">
            Reflection
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Recent notes</h2>
        </div>
        <a
          href="/admin/personal-development"
          className="text-sm text-[var(--personalDevelopment)] hover:text-white"
        >
          View journal
        </a>
      </div>
      {!reflections.length ? (
        <p className="mt-6 text-sm text-slate-500">
          No reflections recorded in this period.
        </p>
      ) : (
        <div className="mt-5 divide-y divide-white/[.07]">
          {reflections.map((log) => (
            <article
              key={log.id}
              className="grid gap-4 py-5 md:grid-cols-[130px_1fr_1fr_1fr]"
            >
              <time className="text-xs text-slate-600" dateTime={log.log_date}>
                {formatDate(log.log_date, { day: 'numeric', month: 'long' })}
              </time>
              {[
                ['Went well', log.went_well],
                ['Could improve', log.could_improve],
                ['Learned', log.learned],
              ].map(([label, value]) => (
                <div key={label}>
                  {value && (
                    <>
                      <h3 className="text-[10px] font-semibold uppercase tracking-[.12em] text-slate-500">
                        {label}
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                        {value}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
