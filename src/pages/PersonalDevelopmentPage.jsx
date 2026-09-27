import React from 'react'
import { supabase } from '../lib/supabase'
import ArticleCard from '../components/ArticleCard'
import Header from '../components/Header'
import SectionHeading from '../components/SectionHeading'
import MiniStat from '../components/MiniStat'
import SiteFooter from '../components/SiteFooter'

export default function PersonalDevelopmentPage() {
  const [featuredArticles, setFeaturedArticles] = React.useState([])
  const [latestArticles, setLatestArticles] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [metrics, setMetrics] = React.useState([])
  const [metricsLoading, setMetricsLoading] = React.useState(true)
  const [metricsError, setMetricsError] = React.useState(null)
  const [moodEntries, setMoodEntries] = React.useState([])
  const [moodLoading, setMoodLoading] = React.useState(true)
  const [moodError, setMoodError] = React.useState(null)

  React.useEffect(() => {
    async function loadArticles() {
      setLoading(true)
      setError(null)

      const [featuredResult, latestResult] = await Promise.all([
        supabase
          .from('articles')
          .select(
            `
          id,
          title,
          slug,
          section,
          category,
          excerpt,
          reading_time,
          published_at,
          cover_image,
          article_tags (
            tags (
              id,
              name,
              slug
            )
          )
        `
          )
          .eq('status', 'published')
          .eq('section', 'Personal Development')
          .eq('featured', true)
          .order('published_at', { ascending: false })
          .limit(3),

        supabase
          .from('articles')
          .select(
            `
          id,
          title,
          slug,
          section,
          category,
          excerpt,
          reading_time,
          published_at,
          cover_image,
          article_tags (
            tags (
              id,
              name,
              slug
            )
          )
        `
          )
          .eq('status', 'published')
          .eq('section', 'Personal Development')
          .order('published_at', { ascending: false })
          .limit(9),
      ])

      if (featuredResult.error || latestResult.error) {
        console.error(
          'Failed to load personal development articles:',
          featuredResult.error || latestResult.error
        )

        setError('Unable to load the personal development journal.')
        setLoading(false)
        return
      }

      function formatArticles(data) {
        return (data || []).map((article) => ({
          ...article,
          read: article.reading_time ? `${article.reading_time} min read` : '',
          tags:
            article.article_tags
              ?.map((item) => item.tags?.name)
              .filter(Boolean) || [],
        }))
      }

      const formattedFeatured = formatArticles(featuredResult.data)
      const formattedLatest = formatArticles(latestResult.data)

      const featuredIds = new Set(
        formattedFeatured.map((article) => article.id)
      )

      const filteredLatest = formattedLatest.filter(
        (article) => !featuredIds.has(article.id)
      )

      setFeaturedArticles(formattedFeatured)
      setLatestArticles(filteredLatest)
      setLoading(false)
    }

    loadArticles()
  }, [])

  React.useEffect(() => {
    async function loadMetrics() {
      const { data, error } = await supabase
        .from('personal_metrics')
        .select(
          `
          id,
          name,
          slug,
          category,
          unit,
          value,
          starting_value,
          target,
          frequency
        `
        )
        .eq('active', true)

      if (error) {
        console.error('Failed to load personal metrics:', error)
        setMetricsError(`Unable to load progress metrics: ${error.message}`)
        setMetricsLoading(false)
        return
      }

      setMetrics(data || [])
      setMetricsLoading(false)
    }

    loadMetrics()
  }, [])

  React.useEffect(() => {
    async function loadMood() {
      const { data, error } = await supabase
        .from('personal_mood')
        .select('year, month, score, note')
        .eq('year', new Date().getFullYear())
        .order('month', { ascending: true })

      if (error) {
        console.error('Failed to load mood entries:', error)
        setMoodError(`Unable to load mood data: ${error.message}`)
        setMoodLoading(false)
        return
      }

      setMoodEntries(data || [])
      setMoodLoading(false)
    }

    loadMood()
  }, [])

  const totalArticles = featuredArticles.length + latestArticles.length

  function getMetric(slug) {
    return metrics.find((metric) => metric.slug === slug)
  }

  function formatMetricValue(value) {
    if (value === null || value === undefined) {
      return 'Not logged yet'
    }

    return Number.isInteger(Number(value))
      ? Number(value).toLocaleString('en-GB')
      : Number(value).toFixed(1)
  }

  function getMetricValue(slug) {
    const metric = getMetric(slug)
    return metric?.value ?? null
  }

  const metricCards = [
    ['body-weight', 'Body weight', 'lb', 'Physical health'],
    ['books-read', 'Books read', 'this year', 'Knowledge'],
    ['workouts', 'Workouts', 'per week', 'Physical health'],
    ['sleep', 'Average sleep', 'hours', 'Recovery'],
  ]

  const moodByMonth = new Map(
    moodEntries.map((entry) => [Number(entry.month), entry])
  )
  const monthLabels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const moodScale = [
    [7, 'Excellent'],
    [6, 'Very good'],
    [5, 'Good'],
    [4, 'Neutral'],
    [3, 'Slightly low'],
    [2, 'Bad'],
    [1, 'Very bad'],
  ]

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <Header compact />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/10">
          {/* Personal development artwork */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/personal-development-graphic.png')",
            }}
          />

          {/* Darken the left side so the text stays readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#090b0f] via-[#090b0f]/90 to-[#090b0f]/25" />

          {/* Subtle overall dark overlay */}
          <div className="absolute inset-0 bg-[#090b0f]/10" />

          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--personalDevelopment)]">
                Personal Development
              </p>

              <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-.045em] sm:text-6xl lg:text-7xl">
                Learning to build{' '}
                <span className="text-[var(--personalDevelopment)]">
                  myself too.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
                I'm not an expert in self-improvement. I'm just someone who
                decided it was time to start looking after himself, becoming
                more intentional about how he lives, and seeing what happens
                when he sticks with it.
              </p>

              <div className="mt-10 max-w-2xl rounded-2xl border border-[var(--personalDevelopment)]/20 bg-[var(--personalDevelopment)]/5 p-6 sm:p-7">
                <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[var(--personalDevelopment)]">
                  The approach
                </p>

                <h2 className="mt-3 text-2xl font-semibold">
                  Share the useful stuff. Don't preach.
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  There is enough self-improvement advice on the internet
                  already. I'm not trying to tell anyone how they should live.
                  I'm documenting the things I'm trying, the lessons I'm
                  learning and the habits that seem to make a difference, in the
                  hope that something here might help someone else.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Progress ledger */}
        <section className="relative overflow-hidden border-b border-white/10 bg-[#0c1015]">
          <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-[var(--personalDevelopment)]/10 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="The progress ledger"
                colour="var(--personalDevelopment)"
                title="Pay attention to what is changing."
                text="A small set of useful measures makes the journey visible. The aim is not to optimise every part of life, but to notice patterns, keep promises and make better decisions."
              />

              <span className="w-fit rounded-full border border-[var(--personalDevelopment)]/25 bg-[var(--personalDevelopment)]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] text-[var(--personalDevelopment)]">
                {metricsLoading
                  ? 'Loading metrics'
                  : `${metrics.length} metrics tracked`}
              </span>
            </div>

            {metricsError && (
              <p className="mt-8 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                {metricsError}
              </p>
            )}

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metricCards.map(([slug, label, unit, category]) => {
                const metric = getMetric(slug)
                const value = getMetricValue(slug)

                return (
                  <article
                    key={slug}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#10161c] p-6 transition hover:-translate-y-1 hover:border-[var(--personalDevelopment)]/35"
                  >
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[var(--personalDevelopment)]/0 via-[var(--personalDevelopment)]/60 to-[var(--personalDevelopment)]/0 opacity-60" />
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">
                        {label}
                      </p>
                      <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] uppercase tracking-[.12em] text-slate-600">
                        {category}
                      </span>
                    </div>
                    <p className="mt-8 text-2xl font-semibold text-slate-300">
                      {slug === 'body-weight' && metric?.starting_value
                        ? `${formatMetricValue(metric.starting_value)} → ${formatMetricValue(value)}`
                        : metric?.target
                          ? `${formatMetricValue(value)} / ${formatMetricValue(metric.target)}`
                          : formatMetricValue(value)}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                      <span>{metric?.unit || unit}</span>
                      <span>
                        {metric?.target
                          ? 'Current / target'
                          : metric
                            ? 'Current figure'
                            : 'Not configured'}
                      </span>
                    </div>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-[var(--personalDevelopment)]/60"
                        style={{
                          width: `${
                            slug === 'body-weight' &&
                            metric?.starting_value &&
                            value
                              ? Math.min(
                                  (1 -
                                    (Number(value) -
                                      Number(metric.target || value)) /
                                      (Number(metric.starting_value) -
                                        Number(metric.target || value))) *
                                    100,
                                  100
                                )
                              : metric?.target && value
                                ? Math.min(
                                    (Number(value) / Number(metric.target)) *
                                      100,
                                    100
                                  )
                                : value
                                  ? '100%'
                                  : '0%'
                          }`,
                        }}
                      />
                    </div>
                  </article>
                )
              })}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
              <div className="rounded-2xl border border-white/10 bg-[#10161c] p-6 sm:p-7">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-600">
                      Long view
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">
                      The shape of the year so far
                    </h3>
                  </div>
                  <span className="text-xs text-slate-600">
                    {moodLoading
                      ? 'Loading mood'
                      : `${moodEntries.length} months logged`}
                  </span>
                </div>

                {moodError && (
                  <p className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                    {moodError}
                  </p>
                )}

                <div className="mt-8 grid grid-cols-[auto_1fr] gap-4">
                  <div className="flex h-56 flex-col justify-between text-[10px] text-slate-600">
                    {[7, 6, 5, 4, 3, 2, 1].map((score) => (
                      <span key={score}>{score}</span>
                    ))}
                  </div>

                  <div className="relative h-56">
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[7, 6, 5, 4, 3, 2, 1].map((score) => (
                        <div
                          key={score}
                          className="border-t border-dashed border-white/[0.08]"
                        />
                      ))}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-between gap-1 sm:gap-2">
                      {monthLabels.map((month, index) => {
                        const mood = moodByMonth.get(index + 1)
                        const score = mood ? Number(mood.score) : null
                        const moodLabel = moodScale.find(
                          ([scaleScore]) => scaleScore === score
                        )?.[1]

                        return (
                          <div
                            key={month}
                            className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
                          >
                            <div className="flex h-full w-full items-end justify-center">
                              {score && (
                                <div
                                  className="w-full max-w-8 rounded-t-md bg-[var(--personalDevelopment)]/70 transition group-hover:bg-[var(--personalDevelopment)]"
                                  style={{ height: `${(score / 7) * 100}%` }}
                                />
                              )}
                            </div>
                            {mood && (
                              <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 w-44 -translate-x-1/2 translate-y-2 rounded-xl border border-[var(--personalDevelopment)]/30 bg-[#17150f] p-3 text-left opacity-0 shadow-xl shadow-black/30 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--personalDevelopment)]">
                                  {month} · {score}/7
                                </p>
                                <p className="mt-1 text-xs font-semibold text-slate-200">
                                  {moodLabel}
                                </p>
                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                  {mood.note ||
                                    'No note recorded for this month.'}
                                </p>
                              </div>
                            )}
                            <span className="text-[10px] text-slate-600">
                              {month}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                  {moodScale.map(([score, label]) => (
                    <span key={score}>
                      <strong className="font-semibold text-[var(--personalDevelopment)]">
                        {score}
                      </strong>{' '}
                      {label}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-500">
                  One monthly score, from 1 to 7. It is a deliberately simple
                  check-in rather than a diagnosis or a demand to feel good all
                  the time.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--personalDevelopment)]/20 bg-[var(--personalDevelopment)]/5 p-6 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--personalDevelopment)]">
                  Worth tracking
                </p>
                <h3 className="mt-2 text-xl font-semibold">
                  A useful signal, not another job
                </h3>
                <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
                  <li className="border-b border-[var(--personalDevelopment)]/15 pb-4">
                    <strong className="font-semibold text-white">Mind:</strong>{' '}
                    journaling, mood, confidence and difficult decisions made.
                  </li>
                  <li className="border-b border-[var(--personalDevelopment)]/15 pb-4">
                    <strong className="font-semibold text-white">Work:</strong>{' '}
                    meaningful projects, skills developed and feedback received.
                  </li>
                  <li className="border-b border-[var(--personalDevelopment)]/15 pb-4">
                    <strong className="font-semibold text-white">
                      People:
                    </strong>{' '}
                    time invested in relationships and conversations that
                    matter.
                  </li>
                  <li>
                    <strong className="font-semibold text-white">Money:</strong>{' '}
                    savings rate, intentional spending and financial runway.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
            <SectionHeading
              eyebrow="Principles"
              colour="var(--personalDevelopment)"
              title="Simple rules for making progress last."
              text="These are not goals to complete. They are ideas I want to return to when deciding what to try, what to keep and what to let go of."
            />

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {[
                [
                  '01',
                  'Keep it simple',
                  "If something requires a complicated system to maintain, I'm probably not going to stick with it.",
                ],
                [
                  '02',
                  'Consistency beats intensity',
                  'Doing something reasonably well for months is usually more useful than doing it perfectly for two weeks.',
                ],
                [
                  '03',
                  'Build habits, not motivation',
                  'Motivation is useful for getting started. Habits are what keep things going when motivation disappears.',
                ],
                [
                  '04',
                  'Look after the basics',
                  "Sleep, movement, food, water and strength training aren't particularly exciting. They are, however, remarkably useful.",
                ],
              ].map(([number, title, text]) => (
                <article
                  key={number}
                  className="card rounded-2xl border border-white/10 bg-[#0e1218] p-7 sm:p-8"
                >
                  <span className="text-xs font-bold tracking-[.25em] text-[var(--personalDevelopment)]">
                    {number}
                  </span>
                  <h3 className="mt-8 text-2xl font-semibold">{title}</h3>
                  <blockquote className="mt-4 border-l-2 border-[var(--personalDevelopment)]/40 pl-4 text-base leading-7 text-slate-400">
                    {text}
                  </blockquote>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Journal */}
        <section className="border-b border-white/10 bg-[#0c1015]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Journal"
                colour="var(--personalDevelopment)"
                title="What I'm learning along the way."
                text="Notes on the areas I'm working on, the experiments I'm running and the things I'm learning about becoming more capable."
              />

              <a
                href="/articles"
                className="w-fit text-sm font-semibold text-slate-500 transition hover:text-white"
              >
                View all articles →
              </a>
            </div>

            {loading && (
              <div className="mt-12 rounded-2xl border border-white/10 bg-[#0e1218] p-10 text-center text-sm text-slate-500">
                Loading the journal...
              </div>
            )}

            {!loading && error && (
              <div className="mt-12 rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center text-sm text-red-300">
                {error}
              </div>
            )}

            {!loading && !error && totalArticles === 0 && (
              <div className="mt-12 rounded-2xl border border-white/10 bg-[#0e1218] p-10 text-center text-sm text-slate-500">
                No published articles in this section yet.
              </div>
            )}

            {!loading && !error && totalArticles > 0 && (
              <>
                {/* Featured */}
                {featuredArticles.length > 0 && (
                  <div className="mt-12">
                    <div className="mb-5">
                      <p className="text-xs font-bold uppercase tracking-[.25em] text-[var(--personalDevelopment)]">
                        Featured
                      </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {featuredArticles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          colour="var(--personalDevelopment)"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Latest */}
                {latestArticles.length > 0 && (
                  <div
                    className={featuredArticles.length > 0 ? 'mt-16' : 'mt-12'}
                  >
                    <div className="mb-5">
                      <p className="text-xs font-bold uppercase tracking-[.25em] text-slate-500">
                        Latest
                      </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {latestArticles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          colour="var(--personalDevelopment)"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <p className="text-xs text-slate-600">
                    Showing {totalArticles} articles
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Physical health */}
        <section className="border-b border-white/10 bg-[#0c1015]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
              <SectionHeading
                eyebrow="Physical health"
                colour="var(--personalDevelopment)"
                title="Take care of the body carrying everything else."
                text="Fitness is one part of a much bigger picture, but it is a useful place to practise consistency. The basics matter more than finding a perfect plan."
              />

              <div className="max-w-2xl text-lg leading-8 text-slate-400">
                <p>
                  Move more. Lift some weights. Eat reasonably well. Get enough
                  protein. Sleep properly. Drink more water. Be consistent. Give
                  it time.
                </p>
                <p className="mt-5">
                  This is not a fitness programme or expert advice. It is a
                  record of what I am trying, what I am learning and what seems
                  to help.
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  '01',
                  'Move more',
                  'Build more movement into everyday life and make activity part of the routine.',
                ],
                [
                  '02',
                  'Lift some weights',
                  'Train consistently and learn how to get stronger without making it unnecessarily complicated.',
                ],
                [
                  '03',
                  'Eat reasonably well',
                  'Focus on the basics rather than searching for the perfect diet or the latest hack.',
                ],
                [
                  '04',
                  'Get enough protein',
                  'Make protein a deliberate part of the diet, particularly when training and trying to lose weight.',
                ],
                [
                  '05',
                  'Sleep properly',
                  'Treat recovery as part of training rather than something that happens when everything else is done.',
                ],
                [
                  '06',
                  'Drink more water',
                  'A simple habit that is easy to overlook when focusing on calories, training and everything else.',
                ],
                [
                  '07',
                  'Be consistent',
                  'The plan only really matters if you can keep doing it week after week.',
                ],
                [
                  '08',
                  'Give it time',
                  'There is no shortcut. Small things done consistently eventually become noticeable results.',
                ],
              ].map(([number, title, text]) => (
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
          </div>
        </section>

        {/* The experiment */}
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--personalDevelopment)]">
                  The experiment
                </p>

                <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Treating self-improvement a bit like engineering.
                </h2>
              </div>

              <div className="max-w-2xl text-lg leading-8 text-slate-400">
                <p>
                  Try something. Track it. See what happens. Keep what works.
                  Change what doesn't.
                </p>

                <p className="mt-5">
                  I'm interested in the practical stuff. The small changes that
                  actually stick, the habits that make a difference and the
                  lessons that only seem obvious after you've learned them the
                  hard way.
                </p>

                <p className="mt-5">
                  Eventually this journal will connect to the numbers too —
                  workouts, weight, steps, nutrition, measurements and progress
                  — alongside the thoughts and lessons that sit behind them.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
