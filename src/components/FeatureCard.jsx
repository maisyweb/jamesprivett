import React from 'react'
import Arrow from './Arrow'

export default function FeatureCard({
  id,
  number,
  title,
  colour,
  icon,
  copy,
  body,
  link,
  href,
}) {
  return (
    <a
      id={id + '-card'}
      href={href || `#${id}`}
      className="card group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0e1218] p-6 sm:p-7"
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: colour }}
      />
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-bold tracking-[.25em]"
          style={{ color: colour }}
        >
          {number}
        </span>
        <span className="text-xl font-bold" style={{ color: colour }}>
          {icon}
        </span>
      </div>
      <h2 className="mt-8 text-2xl font-semibold uppercase tracking-wide">
        {title}
      </h2>
      <p className="mt-3 text-base font-medium text-slate-200">{copy}</p>
      <p className="mt-5 text-sm leading-6 text-slate-400">{body}</p>
      <span
        className="mt-7 inline-flex items-center gap-2 text-sm font-medium"
        style={{ color: colour }}
      >
        {link} <Arrow />
      </span>
    </a>
  )
}
