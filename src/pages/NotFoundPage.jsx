import React from 'react'
import Header from '../components/Header'
import SiteFooter from '../components/SiteFooter'
import Arrow from '../components/Arrow'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#090b0f] text-[#f3f4f6]">
      <Header />
      <main className="relative isolate flex flex-1 items-center overflow-hidden pt-20">
        <div className="grid-bg absolute inset-0 -z-20" />
        <div className="hero-glow absolute inset-0 -z-10" />

        <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:gap-12">
          <div className="reveal">
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[.3em] text-slate-400">
              <span className="h-px w-8 bg-[var(--engineering)]" />
              Page not found
            </p>
            <p
              aria-hidden="true"
              className="mt-5 text-[8rem] font-semibold leading-[.85] tracking-[-.07em] text-[var(--engineering)] sm:text-[11rem]"
            >
              404
            </p>
          </div>

          <div className="reveal-delay max-w-xl">
            <h1 className="text-3xl font-semibold leading-tight tracking-[-.03em] sm:text-4xl">
              Looks like you've wandered off.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">
              The page you're looking for doesn't exist, or may have moved
              somewhere else.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                className="rounded-full bg-[var(--engineering)] px-5 py-3 text-sm font-semibold text-[#06111e] transition hover:-translate-y-0.5 hover:brightness-110"
                href="/"
              >
                Back to homepage <Arrow />
              </a>
              <a
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5"
                href="/articles"
              >
                Browse articles
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
