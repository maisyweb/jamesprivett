import React from 'react'
import Header from '../components/Header'
import SiteFooter from '../components/SiteFooter'
import Arrow from '../components/Arrow'

// Shown for sign-in areas (admin, mentoring portal) while the site runs in
// static data mode and Supabase is paused.
export default function TemporarilyUnavailablePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#090b0f] text-[#f3f4f6]">
      <Header />
      <main
        id="main-content"
        className="relative isolate flex flex-1 items-center overflow-hidden pt-20"
      >
        <div className="grid-bg absolute inset-0 -z-20" />
        <div className="hero-glow absolute inset-0 -z-10" />

        <section className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[.3em] text-slate-400">
            <span className="h-px w-8 bg-[var(--engineering)]" />
            Temporarily unavailable
          </p>
          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-[-.03em] sm:text-4xl">
            This area is taking a short break.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">
            Signing in is switched off for a few weeks while I make some changes
            behind the scenes. Everything else on the site is working as normal.
            If you need anything in the meantime, email me at{' '}
            <a
              href="mailto:hello@jamesprivett.co.uk"
              className="text-[var(--engineering)] underline-offset-4 hover:underline"
            >
              hello@jamesprivett.co.uk
            </a>
            .
          </p>
          <div className="mt-8">
            <a
              className="rounded-full bg-[var(--engineering)] px-5 py-3 text-sm font-semibold text-[#06111e] transition hover:-translate-y-0.5 hover:brightness-110"
              href="/"
            >
              Back to homepage <Arrow />
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
