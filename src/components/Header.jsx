import React from 'react'

const nav = [
  ['Work', 'engineering'],
  ['Mentoring', 'mentoring'],
  ['Personal Development', 'personal-development'],
  ['Articles', 'articles'],
  ['Contact', 'contact'],
]

export default function Header({ compact = false }) {
  const [open, setOpen] = React.useState(false)
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#090b0f]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a
          href="/"
          className="group flex items-center gap-3 text-sm font-semibold tracking-[.28em]"
        >
          <span className="h-2 w-2 rounded-full bg-[var(--personalDevelopment)] shadow-[0_0_16px_rgba(255,191,63,.65)] transition group-hover:scale-125" />
          JAMES PRIVETT
        </a>
        <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          {nav.map(([label, href]) => (
            <a
              key={href}
              className="transition hover:text-white"
              href={href.startsWith('/') ? href : `/${href}`}
            >
              {label}
            </a>
          ))}
        </nav>
        <button
          className="md:hidden"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-xl">{open ? '×' : '☰'}</span>
        </button>
      </div>
      {open && (
        <nav className="border-t border-white/10 bg-[#090b0f] px-5 py-4 md:hidden">
          {nav.map(([label, href]) => (
            <a
              key={href}
              onClick={() => setOpen(false)}
              className="block py-3 text-slate-300"
              href={href.startsWith('/') ? href : `/${href}`}
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
