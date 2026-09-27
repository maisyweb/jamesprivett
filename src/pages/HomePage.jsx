import React from 'react'
import Header from '../components/Header'
import SectionHeading from '../components/SectionHeading'
import FeatureCard from '../components/FeatureCard'
import InfoCard from '../components/InfoCard'
import StatCard from '../components/StatCard'
import Arrow from '../components/Arrow'
import SiteFooter from '../components/SiteFooter'

export default function HomePage() {
  const developmentAreas = [
    [
      '01',
      'Mindset & self-awareness',
      'How do I think? What holds me back? What beliefs or behaviours keep repeating?',
    ],
    [
      '02',
      'Physical health',
      'Am I strong, fit, energetic and taking care of my body?',
    ],
    [
      '03',
      'Learning & skills',
      'What do I want to become genuinely better at? What knowledge would change my life?',
    ],
    [
      '04',
      'Career & work',
      'Where am I going professionally? What skills, responsibilities or experiences do I want next?',
    ],
    [
      '05',
      'Relationships',
      'Am I investing in the people who matter? Am I a good partner, parent, friend and colleague?',
    ],
    [
      '06',
      'Financial wellbeing',
      'Am I managing money deliberately? What would financial progress look like for me?',
    ],
    [
      '07',
      'Purpose & direction',
      'What actually matters to me? What do I want the next chapter of my life to be about?',
    ],
    [
      '08',
      'Growth & experiences',
      'What challenges, experiences or habits would make me more capable and fulfilled?',
    ],
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#090b0f] text-[#f3f4f6]">
      <Header />
      <main id="top">
        <section className="relative isolate flex min-h-[760px] items-center overflow-hidden border-b border-white/10 pt-20">
          <div className="grid-bg absolute inset-0 -z-20" />
          <div className="hero-glow absolute inset-0 -z-10" />
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:py-24">
            <div className="reveal relative z-10">
              <div className="mb-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[.35em] text-slate-400">
                <span className="h-px w-8 bg-[var(--engineering)]" />
                Software Engineer
              </div>
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.03] tracking-[-.045em] sm:text-6xl lg:text-[clamp(4rem,6.2vw,6.5rem)]">
                I build software,
                <br />
                <span className="text-[var(--engineering)]">
                  help people grow,
                </span>
                <br />
                and I'm learning to
                <br />
                <span className="text-[var(--personalDevelopment)]">
                  build myself too.
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
                Software engineer and engineering team leader. I build useful
                software, help engineers develop, and keep experimenting with
                what comes next.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  className="rounded-full bg-[var(--engineering)] px-5 py-3 text-sm font-semibold text-[#06111e] transition hover:-translate-y-0.5 hover:brightness-110"
                  href="#engineering"
                >
                  Explore engineering <Arrow />
                </a>
                <a
                  className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5"
                  href="/cv"
                >
                  View my CV <Arrow />
                </a>
              </div>
            </div>

            <div className="reveal-delay relative mx-auto w-full max-w-xl lg:justify-self-end">
              <div className="absolute -inset-8 -z-10 bg-[radial-gradient(circle,rgba(77,163,255,.18),transparent_58%)]" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-[#11161c] shadow-2xl shadow-black/40 sm:aspect-[5/6]">
                <img
                  src="/james-glow.png"
                  alt="James Privett"
                  className="portrait h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#090b0f] via-[#090b0f]/45 to-transparent" />
                <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.22em] text-slate-300 backdrop-blur-md">
                  Currently building
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[.3em] text-slate-400">
                      Engineering · Mentoring · Learning
                    </p>
                    <p className="mt-2 text-xl font-medium">
                      Build things. Help people. Keep improving.
                    </p>
                  </div>
                  <span className="hidden h-2 w-2 rounded-full bg-[var(--personalDevelopment)] shadow-[0_0_18px_rgba(255,191,63,.8)] sm:block" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto grid max-w-7xl gap-4 px-5 py-16 sm:px-8 lg:grid-cols-3 lg:py-20">
          <div className="absolute -top-px left-5 right-5 h-px bg-gradient-to-r from-[var(--engineering)] via-[var(--mentoring)] to-[var(--personalDevelopment)] opacity-30 sm:left-8 sm:right-8" />
          <FeatureCard
            id="engineering"
            number="01"
            title="Engineering"
            colour="var(--engineering)"
            icon="</>"
            copy="Building software that solves real problems."
            body="Full-stack engineering, architecture, delivery and the people side of building healthy engineering teams."
            link="View my work"
          />
          <FeatureCard
            id="mentoring"
            number="02"
            title="Mentoring"
            colour="var(--mentoring)"
            icon="↗"
            copy="Helping people grow into the next version of themselves."
            body="My approach changes depending on where someone is in their career — from finding their feet at work to finding their feet as a leader."
            link="My approach"
            href="/mentoring"
          />
          <FeatureCard
            id="personalDevelopment"
            number="03"
            title="Personal Development"
            colour="var(--personalDevelopment)"
            icon="+"
            copy="A personal experiment in consistency, strength and self-improvement."
            body="A long-term project to track the work, learn what works and keep improving."
            link="Follow the journey"
            href="/personalDevelopment"
          />
        </section>

        <section
          id="engineering"
          className="border-y border-white/10 bg-[#0c1015]"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
              <div>
                <SectionHeading
                  eyebrow="01 / Engineering"
                  colour="var(--engineering)"
                  title="Software engineer. Engineering leader. Still building things."
                  text="I've spent 15+ years building software, from early-stage products and APIs to large, data-heavy platforms. These days I work across frontend and backend development while also helping engineers and teams do their best work."
                />
              </div>
              <div className="rounded-2xl border border-[var(--engineering)]/20 bg-[var(--engineering)]/5 p-7 sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[var(--engineering)]">
                  Currently building
                </p>
                <h3 className="mt-4 text-2xl font-semibold">
                  A large compliance application
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Working across frontend and backend development, with
                  JavaScript and a ColdFusion backend.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['Frontend', 'Backend', 'JavaScript', 'ColdFusion'].map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-xs text-slate-300"
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              <InfoCard
                colour="var(--engineering)"
                label="01 / BUILDING SOFTWARE"
                title="From concept to production"
                text="I've built products across payroll, secure transportation, data aggregation, search, APIs and reporting. I enjoy moving between the technical detail and the bigger product problem."
              />
              <InfoCard
                colour="var(--engineering)"
                label="02 / SOLVING PROBLEMS"
                title="Useful beats clever"
                text="Some of the most interesting work I've done has been about making complex systems simpler: connecting more than 30 APIs, searching 3M+ records and getting search speeds below 0.5 seconds."
              />
              <InfoCard
                colour="var(--engineering)"
                label="03 / LEADING ENGINEERS"
                title="Building the environment too"
                text="I've built and led engineering teams, supported career development, hired and onboarded engineers, and worked with product, design and business stakeholders to keep teams moving."
              />
            </div>

            <div className="mt-12 rounded-2xl border border-white/10 bg-[#0e1218] p-7 sm:p-9">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[var(--engineering)]">
                    A little more detail
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">
                    Want the long version?
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    My engineering experience covers hands-on development,
                    architecture, delivery and team leadership. The full CV has
                    the timeline, projects, technologies and selected career
                    highlights.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--engineering)] px-5 py-3 text-sm font-semibold text-[#06111e] hover:brightness-110"
                    href="/cv"
                  >
                    View my experience <Arrow />
                  </a>
                  <a
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-white/30 hover:bg-white/5"
                    href="/James-Privett-CV.pdf"
                    download="James-Privett-CV.pdf"
                  >
                    Download my CV ↓
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="mentoring" className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
              <SectionHeading
                eyebrow="02 / Mentoring"
                colour="var(--mentoring)"
                title="Helping people grow."
                text="I don't see mentoring as simply teaching someone what I know. It's about helping people understand themselves, make better decisions and become more confident in doing things for themselves."
              />
              <div className="rounded-2xl border border-[var(--mentoring)]/20 bg-[var(--mentoring)]/5 p-7">
                <p className="text-xs font-bold uppercase tracking-[.28em] text-[var(--mentoring)]">
                  My approach
                </p>
                <p className="mt-4 text-lg leading-8 text-slate-200">
                  The goal isn't to create a copy of the mentor. It's to help
                  someone develop their own judgement, confidence and leadership
                  style.
                </p>
              </div>
            </div>
            <div className="mt-10 flex justify-start">
              <a
                className="inline-flex items-center gap-2 rounded-full border border-[var(--mentoring)]/30 px-5 py-3 text-sm font-semibold text-[var(--mentoring)] transition hover:bg-[var(--mentoring)]/10"
                href="/mentoring"
              >
                Read my approach to mentoring <Arrow />
              </a>
            </div>
          </div>
        </section>

        <section
          id="personalDevelopment"
          className="border-b border-white/10 bg-[#0c1015]"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
              <SectionHeading
                eyebrow="03 / Personal Development"
                colour="var(--personalDevelopment)"
                title="Becoming the sort of person I want to be."
                text="Personal development isn't about endlessly fixing yourself or becoming better at everything. It's about deciding what kind of life you want, then choosing the areas that support it."
              />
              <div className="rounded-2xl border border-[var(--personalDevelopment)]/20 bg-[var(--personalDevelopment)]/5 p-7 sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[var(--personalDevelopment)]">
                  The question at the centre
                </p>
                <p className="mt-4 text-lg leading-8 text-slate-200">
                  What do I want my life to look like at the end of this period
                  that it doesn't look like today?
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {developmentAreas.map(([number, title, text]) => (
                <article
                  key={number}
                  className="card rounded-2xl border border-white/10 bg-[#0e1218] p-6 sm:p-7"
                >
                  <span className="text-xs font-bold tracking-[.25em] text-[var(--personalDevelopment)]">
                    {number}
                  </span>
                  <h3 className="mt-7 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {text}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-white/10 bg-[#0e1218] p-7 sm:p-9">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[var(--personalDevelopment)]">
                    The eighth area is different
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">
                    Character is not just another goal.
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Do I keep promises to myself? Do I handle setbacks better?
                    Do I take responsibility when things go wrong? Am I becoming
                    someone I respect?
                  </p>
                </div>
                <a
                  href="/personal-development"
                  className="inline-flex w-fit rounded-full border border-[var(--personalDevelopment)]/25 px-5 py-3 text-sm font-semibold text-[var(--personalDevelopment)] transition hover:bg-[var(--personalDevelopment)]/10"
                >
                  Explore personal development <Arrow />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="relative mx-auto max-w-7xl overflow-hidden px-5 py-20 sm:px-8 lg:py-28"
        >
          <div className="pointer-events-none absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[var(--mentoring)]/5 blur-3xl" />
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--personalDevelopment)]">
                About me
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Still building.
              </h2>
            </div>
            <div className="max-w-2xl text-lg leading-8 text-slate-400">
              <p>
                I'm sarcastic, generous and reasonably bright. I can hold my own
                in a battle of wits, worry constantly and hold a grudge with
                impressive commitment. I'm working on the last two.
              </p>
              <p className="mt-6">
                I'm also a software engineer and engineering team leader based
                in the UK, interested in building useful things, helping other
                engineers grow and continuously learning.
              </p>
              <p className="mt-6">
                This site is part portfolio, part notebook and part personal
                experiment. It will evolve as I do.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
