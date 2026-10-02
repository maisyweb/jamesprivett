import React from 'react'

export default function RatingDistribution({ title, distribution }) {
  const maximum = Math.max(1, ...distribution.map((item) => item.count))
  const total = distribution.reduce((sum, item) => sum + item.count, 0)
  return (
    <section className="border-t border-white/10 pt-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-200">
          {title} distribution
        </h3>
        <span className="text-xs text-slate-600">{total} ratings</span>
      </div>
      {!total ? (
        <p className="grid h-28 place-items-center text-sm text-slate-600">
          No ratings recorded.
        </p>
      ) : (
        <div
          className="mt-5 flex h-32 items-end gap-1.5"
          role="img"
          aria-label={`${title} rating distribution from 1 to 10`}
        >
          {distribution.map((item) => (
            <div
              key={item.rating}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              title={`${item.rating}: ${item.count}`}
            >
              <span className="text-[9px] tabular-nums text-slate-600">
                {item.count || ''}
              </span>
              <div
                className="w-full bg-[var(--personalDevelopment)]/70"
                style={{
                  height: `${item.count ? Math.max(4, (item.count / maximum) * 72) : 2}px`,
                  opacity: item.count ? 1 : 0.2,
                }}
              />
              <span className="text-[10px] text-slate-600">{item.rating}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
