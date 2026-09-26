import React from 'react'
import Header from '../components/Header'
import SectionHeading from '../components/SectionHeading'
import MiniStat from '../components/MiniStat'
import ArticleCard from '../components/ArticleCard'
import { supabase } from '../lib/supabase'

export default function EngineeringPage() {
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
          .eq('section', 'Engineering')
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
          .eq('section', 'Engineering')
          .order('published_at', { ascending: false })
          .limit(9),
      ])

      if (featuredResult.error || latestResult.error) {
        console.error(
          'Failed to load engineering articles:',
          featuredResult.error || latestResult.error
        )

        setArticlesError('Unable to load the engineering articles.')
        setLoadingArticles(false)
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
      setLoadingArticles(false)
    }

    loadArticles()
  }, [])

  return (
    <div className="min-h-screen bg-[#080b10] text-slate-100">
      <Header compact />

      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden border-b border-white/10 pt-28 sm:pt-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_35%,rgba(96,165,250,.12),transparent_32%)]" />

          <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20 lg:pb-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
              {/* Copy */}
              <div className="max-w-4xl">
                <p className="text-xs font-bold uppercase tracking-[.3em] text-blue-400">
                  Engineering
                </p>

                <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-.045em] sm:text-6xl lg:text-7xl">
                  Software engineer.
                  <br />
                  Engineering leader.
                  <br />
                  <span className="text-blue-400">Still building things.</span>
                </h1>

                <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-400 sm:text-xl">
                  I've spent my career building software, solving problems and
                  helping engineering teams become better at what they do. I
                  enjoy getting into the detail of the technology, but I care
                  just as much about the people building it.
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <a
                    href="/cv"
                    className="rounded-full bg-blue-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-blue-300"
                  >
                    View my CV
                  </a>

                  <a
                    href="/articles"
                    className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                  >
                    Read my articles
                  </a>
                </div>
              </div>

              {/* Engineering profile */}
              <div className="relative">
                <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-blue-400/10 blur-3xl" />

                <div className="rounded-[2rem] border border-blue-400/20 bg-blue-400/[0.04] p-7 sm:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[.28em] text-blue-400">
                    Currently
                  </p>

                  <h2 className="mt-4 text-2xl font-semibold">
                    Building the systems that make enterprise learning work.
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    I'm currently working on an enterprise, multi-tenant LMS and
                    compliance SaaS platform: a mature CFML/Lucee monolith with
                    JavaScript-driven interfaces, SQL Server persistence,
                    extensive enterprise integrations and Azure Kubernetes
                    deployment infrastructure.
                  </p>

                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <MiniStat value="CFML" label="Lucee monolith" />
                    <MiniStat value="JS" label="Interfaces" />
                    <MiniStat value="SQL" label="SQL Server" />
                    <MiniStat value="AKS" label="Azure Kubernetes" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What I build */}
        <section className="border-b border-white/10 bg-[#0c1015]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
            <SectionHeading
              eyebrow="What I build"
              colour="var(--engineering)"
              title="Technology is the tool. Solving problems is the job."
              text="I've worked across frontend, backend, APIs, databases and cloud infrastructure. I like understanding how the pieces fit together rather than treating any part of the stack as somebody else's problem."
            />

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <p className="text-sm font-semibold text-blue-400">Frontend</p>

                <h3 className="mt-3 text-xl font-semibold text-white">
                  Interfaces people actually use.
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  JavaScript, React, HTML and CSS, with a focus on building
                  interfaces that are useful rather than simply impressive.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <p className="text-sm font-semibold text-blue-400">Backend</p>

                <h3 className="mt-3 text-xl font-semibold text-white">
                  Systems behind the interface.
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  APIs, business logic, databases and the less visible work that
                  makes an application reliable.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <p className="text-sm font-semibold text-blue-400">
                  Problem solving
                </p>

                <h3 className="mt-3 text-xl font-semibold text-white">
                  Understand the problem first.
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  The interesting part of engineering isn't always writing the
                  code. Often it's figuring out what actually needs to be
                  solved.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <p className="text-sm font-semibold text-blue-400">
                  Leadership
                </p>

                <h3 className="mt-3 text-xl font-semibold text-white">
                  Build the people too.
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  I've built teams, mentored engineers, supported career
                  development and helped people grow into leadership roles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How I work */}
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.3em] text-blue-400">
                  How I work
                </p>

                <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Good engineering is about more than code.
                </h2>
              </div>

              <div className="max-w-2xl space-y-6 text-lg leading-8 text-slate-400">
                <p>
                  I like engineers who are curious about the problem they're
                  solving, not just the technology they're using.
                </p>

                <p>
                  I've also learned that the best technical solution isn't
                  necessarily the best solution for the team or the business.
                  Communication, context and knowing when to keep things simple
                  matter just as much.
                </p>

                <p>
                  As my career has progressed, leadership has become an
                  increasingly important part of engineering for me. I still
                  enjoy writing software, but I also enjoy helping other
                  engineers become more confident, capable and independent.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Career */}
        <section className="border-b border-white/10 bg-[#0c1015]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[.3em] text-blue-400">
                  Career
                </p>

                <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Still an engineer. Just with a few more responsibilities.
                </h2>

                <p className="mt-6 text-lg leading-8 text-slate-400">
                  I've gone from writing software as a developer to leading
                  engineering teams, building new teams and helping people
                  develop their careers. The common thread has always been
                  building things and solving problems.
                </p>
              </div>

              <a
                href="/cv"
                className="inline-flex w-fit rounded-full border border-blue-400/30 bg-blue-400/5 px-5 py-3 text-sm font-semibold text-blue-400 transition hover:border-blue-400/50 hover:bg-blue-400/10"
              >
                View the full CV →
              </a>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <MiniStat value="15+" label="Years building software" />
              <MiniStat value="3" label="Teams built" />
              <MiniStat value="∞" label="Things still to build" />
            </div>
          </div>
        </section>

        {/* Articles */}
        <section>
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Articles"
                colour="var(--engineering)"
                title="Things I've learned along the way."
                text="Thoughts on engineering, leadership, software and the problems that come with building things."
              />

              <a
                href="/articles?section=Engineering"
                className="w-fit text-sm font-semibold text-slate-500 transition hover:text-white"
              >
                View all Engineering articles →
              </a>
            </div>

            {loadingArticles && (
              <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-slate-500">
                Loading engineering articles...
              </div>
            )}

            {articlesError && (
              <div className="mt-12 rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center text-sm text-red-300">
                {articlesError}
              </div>
            )}

            {!loadingArticles && !articlesError && (
              <>
                {featuredArticles.length > 0 && (
                  <div className="mt-12">
                    <div className="mb-5">
                      <p className="text-xs font-bold uppercase tracking-[.25em] text-blue-400">
                        Featured
                      </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {featuredArticles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          colour="var(--engineering)"
                        />
                      ))}
                    </div>
                  </div>
                )}

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
                          colour="var(--engineering)"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {featuredArticles.length === 0 &&
                  latestArticles.length === 0 && (
                    <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-slate-500">
                      No engineering articles published yet.
                    </div>
                  )}
              </>
            )}
          </div>
        </section>
      </main>

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
    </div>
  )
}
