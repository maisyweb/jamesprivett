import React from 'react'

export default function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e1218] p-6">
      <div className="text-3xl font-semibold tracking-tight text-[var(--engineering)]">
        {value}
      </div>
      <div className="mt-2 text-sm leading-5 text-slate-500">{label}</div>
    </div>
  )
}
