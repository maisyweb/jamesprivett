import React from 'react'

export default function SectionTitle({ eyebrow, title, detail, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-600">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-100">{title}</h2>
        {detail && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {detail}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
