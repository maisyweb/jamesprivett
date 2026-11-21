import React from 'react'

const nav = [
  ['Work', 'engineering'],
  ['Mentoring', 'mentoring'],
  ['Personal Development', 'personal-development'],
  ['Articles', 'articles'],
  ['Contact', 'contact'],
]

function isCurrentSection(href) {
  const path = window.location.pathname
  return path === `/${href}` || path.startsWith(`/${href}/`)
}

export default function Header({ compact = false }) {
  const [open, setOpen] = React.useState(false)
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#090b0f]/88 backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        {/* Colour sits on the span because the global `a` reset overrides
            text colour utilities on links. */}
        <span className="text-[#090b0f]">Skip to content</span>
      </a>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a
          href="/"
          className="group flex items-center gap-3 text-sm font-semibold tracking-[.28em]"
        >
          <span className="h-2 w-2 rounded-full bg-[var(--personalDevelopment)] shadow-[0_0_16px_rgba(255,191,63,.65)] transition group-hover:scale-125" />
          JAMES PRIVETT
        </a>
        <nav
          aria-label="Main"
          className="hidden items-center gap-7 text-sm text-slate-300 md:flex"
        >
          {nav.map(([label, href]) => (
            <a
              key={href}
              className="transition hover:text-white aria-[current=page]:text-white"
              href={href.startsWith('/') ? href : `/${href}`}
              aria-current={isCurrentSection(href) ? 'page' : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg md:hidden"
          aria-label="Navigation menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-xl" aria-hidden="true">
            {open ? '×' : '☰'}
          </span>
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Main"
          className="border-t border-white/10 bg-[#090b0f] px-5 py-4 md:hidden"
        >
          {nav.map(([label, href]) => (
            <a
              key={href}
              onClick={() => setOpen(false)}
              className="block py-3 text-slate-300 aria-[current=page]:text-white"
              href={href.startsWith('/') ? href : `/${href}`}
              aria-current={isCurrentSection(href) ? 'page' : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
