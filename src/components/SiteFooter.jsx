import React from 'react'

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <span className="font-medium text-slate-300">JAMES PRIVETT</span>
          <span className="mx-2">·</span>
          Build things. Help people. Keep improving.
        </div>

        <div className="flex items-center gap-4">
          <a href="/">Home</a>
          <a href="/cv">CV</a>
        </div>
      </div>
    </footer>
  )
}
