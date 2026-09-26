import React from 'react'

export default function SectionHeading({ eyebrow, colour, title, text }) {
  return (
    <div className="max-w-3xl">
      <p
        className="text-xs font-bold uppercase tracking-[.3em]"
        style={{ color: colour }}
      >
        {eyebrow}
      </p>
      <h2 className="mt-4 text-4xl font-semibold tracking-[-.03em] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
        {text}
      </p>
    </div>
  )
}
