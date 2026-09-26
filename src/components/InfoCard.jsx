import React from 'react'

export default function InfoCard({ colour, label, title, text }) {
  return (
    <article className="card rounded-2xl border border-white/10 bg-[#0e1218] p-6 sm:p-7">
      <p
        className="text-[10px] font-bold tracking-[.25em]"
        style={{ color: colour }}
      >
        {label}
      </p>
      <h3 className="mt-10 text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
    </article>
  )
}
