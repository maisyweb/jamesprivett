import React from 'react'
import { supabase } from '../lib/supabase'

export default function AdminPage() {
  const [session, setSession] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (mounted) {
        setSession(session)
        setLoading(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
        <main className="mx-auto flex min-h-screen max-w-md items-center px-5">
          <p className="text-sm text-slate-500">Loading...</p>
        </main>
      </div>
    )
  }

  if (!session) {
    return <LoginForm />
  }

  return <AdminDashboard session={session} onSignOut={handleSignOut} />
}

function LoginForm() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  async function handleLogin(event) {
    event.preventDefault()

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <main className="mx-auto flex min-h-screen max-w-md items-center px-5 py-16 sm:px-8">
        <div className="w-full">
          <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--personalDevelopment)]">
            Admin
          </p>

          <h1 className="mt-5 text-4xl font-semibold tracking-[-.03em]">
            Welcome back
          </h1>

          <p className="mt-4 text-slate-400">Sign in to manage the site.</p>

          <form onSubmit={handleLogin} className="mt-10 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-[#0e1218] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--personalDevelopment)]/50"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-[#0e1218] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--personalDevelopment)]/50"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[var(--personalDevelopment)] px-4 py-3 text-sm font-semibold text-[#090b0f] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

function AdminDashboard({ session, onSignOut }) {
  const [articles, setArticles] = React.useState([])
  const [ideas, setIdeas] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    async function loadDashboardData() {
      const [articlesResult, ideasResult] = await Promise.all([
        supabase
          .from('articles')
          .select('id, title, status, section, featured, updated_at'),
        supabase
          .from('article_ideas')
          .select('id, title, article_type, importance, created_date'),
      ])

      if (articlesResult.error || ideasResult.error) {
        const dashboardError = articlesResult.error || ideasResult.error
        console.error('Failed to load dashboard data:', dashboardError)
        setError(`Unable to load dashboard data: ${dashboardError.message}`)
        setLoading(false)
        return
      }

      setArticles(articlesResult.data || [])
      setIdeas(ideasResult.data || [])
      setLoading(false)
    }

    loadDashboardData()
  }, [])

  const publishedArticles = articles.filter(
    (article) => article.status === 'published'
  )
  const draftArticles = articles.filter(
    (article) => article.status !== 'published'
  )
  const featuredArticles = articles.filter((article) => article.featured)
  const sortedIdeas = [...ideas].sort((first, second) => {
    if (first.importance !== second.importance) {
      return first.importance - second.importance
    }

    return new Date(second.created_date) - new Date(first.created_date)
  })
  const recentArticles = [...articles]
    .sort(
      (first, second) =>
        new Date(second.updated_at) - new Date(first.updated_at)
    )
    .slice(0, 5)
  const sections = ['Engineering', 'Mentoring', 'Personal Development', 'Other']
  const sectionCounts = sections.map((section) => ({
    label: section,
    count: publishedArticles.filter((article) => article.section === section)
      .length,
  }))
  const maxSectionCount = Math.max(
    ...sectionCounts.map((item) => item.count),
    1
  )

  function formatDate(value) {
    if (!value) {
      return 'No date'
    }

    return new Date(value).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--personalDevelopment)]">
              Admin
            </p>

            <h1 className="mt-2 text-2xl font-semibold">Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:block">
              {session.user.email}
            </span>

            <button
              onClick={onSignOut}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-400 transition hover:border-white/20 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-slate-600">
              Overview
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Content dashboard</h2>
            <p className="mt-3 text-slate-500">
              A quick view of your publishing pipeline and ideas backlog.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/admin/contact-emails"
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              Contact emails
            </a>
            <a
              href="/admin/articles/new"
              className="rounded-full bg-[var(--personalDevelopment)] px-5 py-3 text-sm font-semibold text-[#090b0f] transition hover:brightness-110"
            >
              + New article
            </a>
            <a
              href="/admin/article-ideas/new"
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              + New idea
            </a>
          </div>
        </div>

        {loading && (
          <p className="mt-10 text-sm text-slate-500">Loading dashboard...</p>
        )}

        {error && (
          <p className="mt-10 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Published', publishedArticles.length, 'text-emerald-300'],
                ['Drafts', draftArticles.length, 'text-slate-300'],
                ['Ideas', ideas.length, 'text-[var(--personalDevelopment)]'],
                ['Featured', featuredArticles.length, 'text-blue-300'],
              ].map(([label, value, colour]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-[#0e1218] p-6"
                >
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-600">
                    {label}
                  </p>
                  <p className={`mt-4 text-4xl font-semibold ${colour}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-white/10 bg-[#0e1218] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-600">
                      Publishing
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">
                      Articles by section
                    </h3>
                  </div>
                  <a
                    href="/admin/articles"
                    className="text-sm text-slate-500 hover:text-white"
                  >
                    View all
                  </a>
                </div>

                <div className="mt-7 space-y-5">
                  {sectionCounts.map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="text-slate-500">{item.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-[var(--personalDevelopment)] transition-all"
                          style={{
                            width: `${(item.count / maxSectionCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-[#0e1218] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-600">
                      Planning
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">
                      Priority ideas
                    </h3>
                  </div>
                  <a
                    href="/admin/article-ideas"
                    className="text-sm text-slate-500 hover:text-white"
                  >
                    View all
                  </a>
                </div>

                <div className="mt-5 divide-y divide-white/[0.06]">
                  {sortedIdeas.slice(0, 5).map((idea) => (
                    <a
                      key={idea.id}
                      href={`/admin/article-ideas/edit/${idea.id}`}
                      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-200">
                          {idea.title}
                        </p>
                        <p className="mt-1 text-xs capitalize text-slate-600">
                          {(idea.article_type || 'other').replace('_', ' ')}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-[var(--personalDevelopment)]">
                        P{idea.importance}
                      </span>
                    </a>
                  ))}
                  {sortedIdeas.length === 0 && (
                    <p className="py-4 text-sm text-slate-500">No ideas yet.</p>
                  )}
                </div>
              </section>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
              <section className="rounded-2xl border border-white/10 bg-[#0e1218] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-600">
                      Activity
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">
                      Recently updated
                    </h3>
                  </div>
                  <a
                    href="/admin/articles"
                    className="text-sm text-slate-500 hover:text-white"
                  >
                    View all
                  </a>
                </div>

                <div className="mt-5 divide-y divide-white/[0.06]">
                  {recentArticles.map((article) => (
                    <a
                      key={article.id}
                      href={`/admin/articles/edit/${article.id}`}
                      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-200">
                          {article.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          {article.section || 'Uncategorised'}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={`text-xs font-semibold capitalize ${
                            article.status === 'published'
                              ? 'text-emerald-300'
                              : 'text-slate-400'
                          }`}
                        >
                          {article.status}
                        </span>
                        <p className="mt-1 text-xs text-slate-600">
                          {formatDate(article.updated_at)}
                        </p>
                      </div>
                    </a>
                  ))}
                  {recentArticles.length === 0 && (
                    <p className="py-4 text-sm text-slate-500">
                      No articles yet.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-[#0e1218] p-6">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-600">
                  Attention
                </p>
                <h3 className="mt-2 text-xl font-semibold">Worth a look</h3>
                <div className="mt-5 space-y-3 text-sm">
                  {draftArticles.length > 0 && (
                    <a
                      href="/admin/articles"
                      className="block rounded-xl border border-white/10 p-4 text-slate-300 transition hover:border-white/20 hover:text-white"
                    >
                      {draftArticles.length} draft
                      {draftArticles.length === 1 ? '' : 's'} waiting to be
                      finished
                    </a>
                  )}
                  {sectionCounts
                    .filter((item) => item.count === 0)
                    .map((item) => (
                      <a
                        key={item.label}
                        href="/admin/articles/new"
                        className="block rounded-xl border border-white/10 p-4 text-slate-300 transition hover:border-white/20 hover:text-white"
                      >
                        No published {item.label.toLowerCase()} articles yet
                      </a>
                    ))}
                  {draftArticles.length === 0 &&
                    sectionCounts.every((item) => item.count > 0) && (
                      <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-emerald-300">
                        Nothing needs attention right now.
                      </p>
                    )}
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
