import React from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminHeader({
  title,
  eyebrow = 'Admin',
  actions,
  onSignOut,
  showDashboardLink = true,
}) {
  async function handleSignOut() {
    if (onSignOut) {
      await onSignOut()
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Failed to sign out:', error)
    }
  }

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--personalDevelopment)]">
            {eyebrow}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
            {title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {actions}
          {showDashboardLink && (
            <a
              href="/admin"
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 transition hover:border-white/20 hover:text-white"
            >
              Dashboard
            </a>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 transition hover:border-white/20 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
