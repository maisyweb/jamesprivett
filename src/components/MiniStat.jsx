import React from 'react'

export default function MiniStat({ value, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3">
      <div className="text-lg font-semibold text-[var(--personalDevelopment)]">
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[.15em] text-slate-500">
        {label}
      </div>
    </div>
  )
}
