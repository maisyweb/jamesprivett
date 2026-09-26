import React from 'react'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import SectionHeading from '../components/SectionHeading'
import Arrow from '../components/Arrow'
import ArticleCard from '../components/ArticleCard'

export default function MentoringPage() {
  const [featuredArticles, setFeaturedArticles] = React.useState([])
  const [latestArticles, setLatestArticles] = React.useState([])
  const [loadingArticles, setLoadingArticles] = React.useState(true)
  const [articlesError, setArticlesError] = React.useState(null)

  React.useEffect(() => {
    async function loadArticles() {
      setLoadingArticles(true)
      setArticlesError(null)

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
          .eq('section', 'Mentoring')
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
          .eq('section', 'Mentoring')
          .order('published_at', { ascending: false })
          .limit(9),
      ])

      if (featuredResult.error || latestResult.error) {
        console.error(
          'Failed to load Mentoring articles:',
          featuredResult.error || latestResult.error
        )

        setArticlesError('Unable to load the Mentoring articles.')
        setLoadingArticles(false)
        return
      }

      function formatArticles(data) {
        return (data || []).map((article) => ({
          ...article,
          read: article.reading_time ? `${article.reading_time} min read` : '',
          tags:
            article.article_tags
              ?.map((relation) => relation.tags?.name)
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
      setLoadingArticles(false)
    }

    loadArticles()
  }, [])

  const totalArticles = featuredArticles.length + latestArticles.length

  const situations = [
    [
      '01',
      'Starting out',
      'Finding your voice, understanding the unwritten rules and building confidence at work.',
    ],
    [
      '02',
      'Stepping up',
      'Moving from individual contributor to leader without losing yourself in the role.',
    ],
    [
      '03',
      'Feeling stuck',
      'Making sense of uncertainty, competing options and the decision you keep postponing.',
    ],
    [
      '04',
      'A difficult conversation',
      'Preparing to say the useful thing clearly, respectfully and without hiding behind comfort.',
    ],
  ]

  const process = [
    [
      '01',
      'Understand the situation',
      'Get beneath the first version of the problem and make the real question visible.',
    ],
    [
      '02',
      'Challenge the assumptions',
      'Look at the story you are telling yourself and test whether it is helping.',
    ],
    [
      '03',
      'Explore the options',
      'Make space for alternatives before rushing towards the most familiar answer.',
    ],
    [
      '04',
      'Choose what to try',
      'Turn a useful conversation into one practical next step.',
    ],
    [
      '05',
      'Reflect and adjust',
      'Come back to what happened, learn from it and decide what changes next.',
    ],
  ]

  const questions = [
    'What are you avoiding because it feels uncomfortable?',
    "What would you do if you didn't need everyone else's approval?",
    'Are you solving the right problem?',
    'What does good enough look like here?',
  ]

  return (
    <div className="min-h-screen bg-[#080b10] text-slate-100">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/10">
          {/* Compass artwork */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/mentoring-compass.png')",
            }}
          />

          {/* Darken the left side so the text stays readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#080b10] via-[#080b10]/85 to-[#080b10]/20" />

          {/* Subtle overall dark overlay */}
          <div className="absolute inset-0 bg-[#080b10]/10" />

          <div className="relative mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28 lg:py-32">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
                Mentoring
              </p>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                A good mentor helps you{' '}
                <span className="text-[var(--mentoring)]">
                  become better at being you.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
                Mentoring isn&apos;t just about teaching. It&apos;s about
                providing perspective, creating a safe place to think, and
                helping someone navigate their next challenge.
              </p>
            </div>
          </div>
        </section>

        {/* Who this is for */}
        <section>
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
              <SectionHeading
                eyebrow="01 · Who this is for"
                title="The conversation depends on the situation."
                text="There is no single mentoring script. The useful starting point is usually the thing that feels difficult, unclear or important right now."
                colour="var(--mentoring)"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {situations.map(([number, title, text]) => (
                  <article
                    key={number}
                    className="group rounded-2xl border border-white/10 bg-[#0e1218] p-6 transition hover:-translate-y-1 hover:border-[var(--mentoring)]/40"
                  >
                    <span className="text-xs font-bold tracking-[.25em] text-[var(--mentoring)]">
                      {number}
                    </span>
                    <h3 className="mt-7 text-xl font-semibold text-white group-hover:text-[var(--mentoring)]">
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {text}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How I work */}
        <section className="border-y border-white/10 bg-white/[0.015]">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
            <SectionHeading
              eyebrow="02 · How I work"
              title="A mentoring conversation should move somewhere."
              text="The aim is not to create dependence on the mentor. It is to help someone see clearly, choose deliberately and leave with more ownership than they arrived with."
              colour="var(--mentoring)"
            />

            <div className="mt-14 grid gap-0 md:grid-cols-5">
              {process.map(([number, title, text], index) => (
                <div
                  key={number}
                  className="relative border-l border-[var(--mentoring)]/30 pb-8 pl-6 last:pb-0 md:border-l-0 md:border-t md:pb-0 md:pl-0 md:pt-7 md:pr-5"
                >
                  <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-[var(--mentoring)] md:left-0 md:top-[-5px]" />
                  <p className="text-xs font-bold tracking-[.25em] text-[var(--mentoring)]">
                    {number}
                  </p>
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {text}
                  </p>
                  {index < process.length - 1 && (
                    <span className="absolute bottom-3 left-[-1px] text-[var(--mentoring)] md:right-4 md:left-auto md:top-[-13px]">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stories and questions */}
        <section>
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
              <SectionHeading
                eyebrow="03 · Real situations"
                title="The useful moment is usually more specific than the job title."
                text="These are the kinds of moments where perspective can help. The details change; the underlying questions tend to rhyme."
                colour="var(--mentoring)"
              />

              <div className="space-y-4">
                {[
                  [
                    'The engineer waiting to feel ready',
                    'What would change if confidence came after taking the step, rather than before it?',
                  ],
                  [
                    'The new manager still solving every problem',
                    'What could the team learn if you created more space for them to solve it?',
                  ],
                  [
                    'The high performer who has lost direction',
                    'Is the next step actually more responsibility, or is it a better understanding of what matters?',
                  ],
                ].map(([title, text], index) => (
                  <article
                    key={title}
                    className="rounded-2xl border border-white/10 bg-[#0e1218] p-6 sm:p-7"
                  >
                    <div className="flex gap-5">
                      <span className="pt-1 text-xs font-bold tracking-[.25em] text-[var(--mentoring)]">
                        0{index + 1}
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {title}
                        </h3>
                        <p className="mt-3 text-base leading-7 text-slate-400">
                          {text}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#0d1018]">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
            <div className="mx-auto max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[var(--mentoring)]">
                04 · Questions worth asking
              </p>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                Good questions create room to move.
              </h2>
              <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
                {questions.map((question) => (
                  <div
                    key={question}
                    className="bg-[#0e1218] p-7 text-xl leading-8 text-slate-200 transition hover:bg-[var(--mentoring)]/10 hover:text-white sm:p-9"
                  >
                    “{question}”
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Articles */}
        <section className="border-y border-white/10 bg-white/[0.015]">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
                  06 · Articles
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Things I&apos;ve learned about helping people grow.
                </h2>

                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
                  Thoughts on mentoring, leadership, managing people and the
                  things I&apos;ve learned from helping others develop.
                </p>
              </div>

              <a
                href="/articles?section=Mentoring"
                className="w-fit text-sm font-semibold text-slate-500 transition hover:text-white"
              >
                View all Mentoring articles →
              </a>
            </div>

            {/* Loading */}
            {loadingArticles && (
              <div className="mt-12 py-16 text-center text-sm text-slate-500">
                Loading articles...
              </div>
            )}

            {/* Error */}
            {!loadingArticles && articlesError && (
              <div className="mt-12 py-16 text-center">
                <p className="text-sm text-red-400">{articlesError}</p>
              </div>
            )}

            {/* Empty */}
            {!loadingArticles && !articlesError && totalArticles === 0 && (
              <div className="mt-12 rounded-3xl border border-white/10 bg-[#0e1218] p-10 text-center">
                <p className="text-slate-500">
                  No published Mentoring articles yet.
                </p>

                <a
                  href="/articles?section=Mentoring"
                  className="mt-4 inline-block text-sm font-semibold text-[var(--mentoring)] transition hover:text-white"
                >
                  Browse Mentoring articles →
                </a>
              </div>
            )}

            {/* Featured */}
            {!loadingArticles &&
              !articlesError &&
              featuredArticles.length > 0 && (
                <div className="mt-12">
                  <div className="mb-5 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      Featured
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    {featuredArticles.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        colour="var(--mentoring)"
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* Latest */}
            {!loadingArticles &&
              !articlesError &&
              latestArticles.length > 0 && (
                <div className="mt-16">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        Latest
                      </p>

                      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                        More things I&apos;ve written
                      </h3>
                    </div>

                    <span className="hidden text-sm text-slate-600 sm:block">
                      {totalArticles}{' '}
                      {totalArticles === 1 ? 'article' : 'articles'}
                    </span>
                  </div>

                  <div className="mt-8 grid gap-6 md:grid-cols-3">
                    {latestArticles.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        colour="var(--mentoring)"
                      />
                    ))}
                  </div>
                </div>
              )}

            {!loadingArticles && !articlesError && totalArticles > 0 && (
              <div className="mt-8 text-sm text-slate-600 sm:hidden">
                Showing {totalArticles}{' '}
                {totalArticles === 1 ? 'article' : 'articles'}
              </div>
            )}
          </div>
        </section>

        {/* What success looks like */}
        <section>
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
                07 · What success looks like
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                The goal is independence.
              </h2>

              <div className="mt-8 space-y-6 text-lg leading-8 text-slate-400">
                <p>
                  The best mentoring relationship shouldn&apos;t create
                  dependence on the mentor.
                </p>

                <p>
                  It should leave someone with better judgement, more confidence
                  and the ability to handle the next challenge without needing
                  someone else to tell them what to do.
                </p>

                <p>
                  Ultimately, I think a mentor measures their success by how
                  much the mentee grows — and by how naturally they become
                  capable of navigating things on their own.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
            <a
              href="/"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-white"
            >
              Back to the main site
              <Arrow />
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
