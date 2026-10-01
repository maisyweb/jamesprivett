import React from 'react'
import { supabase } from '../lib/supabase'

const PAGE_SIZE = 10

function articlesPageUrl(page, searchTerm) {
  const params = new URLSearchParams()

  if (searchTerm) {
    params.set('q', searchTerm)
  }

  if (page > 1) {
    params.set('page', String(page))
  }

  const query = params.toString()
  return query ? `/admin/articles?${query}` : '/admin/articles'
}

export default function AdminArticlesPage() {
  const searchParams = new URLSearchParams(window.location.search)
  const searchTerm = (searchParams.get('q') || '').trim()
  const pageParam = searchParams.get('page')
  const parsedPage = Number(pageParam)
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const [articles, setArticles] = React.useState([])
  const [totalCount, setTotalCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    async function loadArticles() {
      const { data, error, count } = await supabase
        .from('articles')
        .select(
          `
          id,
          title,
          slug,
          category,
          status,
          reading_time,
          published_at,
          updated_at
        `,
          { count: 'exact' }
        )
        .ilike('title', `%${searchTerm}%`)
        .order('updated_at', { ascending: false })
        .order('id', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

      if (error) {
        console.error('Failed to load admin articles:', error)
        setError(`Unable to load articles: ${error.message}`)
        setLoading(false)
        return
      }

      const pageCount = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE))

      if (page > pageCount) {
        window.location.replace(articlesPageUrl(pageCount, searchTerm))
        return
      }

      setArticles(data || [])
      setTotalCount(count || 0)
      setLoading(false)
    }

    loadArticles()
  }, [page, searchTerm])

  async function handleDelete(article) {
    const confirmed = window.confirm(
      `Delete "${article.title}"?\n\nThis cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', article.id)

    if (error) {
      console.error('Failed to delete article:', error)
      window.alert('Unable to delete the article.')
      return
    }

    const nextPage = articles.length === 1 && page > 1 ? page - 1 : page
    window.location.href = articlesPageUrl(nextPage, searchTerm)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const firstArticle = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const lastArticle = Math.min(page * PAGE_SIZE, totalCount)

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--personalDevelopment)]">
              Admin
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Articles</h1>
          </div>

          <a
            href="/admin"
            className="text-sm text-slate-500 transition hover:text-white"
          >
            ← Back to dashboard
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-slate-600">
              Content
            </p>
            <h2 className="mt-2 text-3xl font-semibold">All articles</h2>
          </div>

          <a
            href="/admin/articles/new"
            className="self-start rounded-full bg-[var(--personalDevelopment)] px-5 py-3 text-sm font-semibold text-[#090b0f] transition hover:brightness-110 sm:self-auto"
          >
            + New article
          </a>
        </div>

        <form
          action="/admin/articles"
          method="get"
          className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <label className="sr-only" htmlFor="article-title-search">
            Search article titles
          </label>
          <input
            id="article-title-search"
            type="search"
            name="q"
            defaultValue={searchTerm}
            placeholder="Search article titles"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0e1218] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-white/25 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-[var(--personalDevelopment)] px-5 py-3 text-sm font-semibold text-[#090b0f] transition hover:brightness-110"
          >
            Search
          </button>
          {searchTerm && (
            <a
              href="/admin/articles"
              className="self-center px-2 py-2 text-sm text-slate-400 transition hover:text-white"
            >
              Clear
            </a>
          )}
        </form>

        <div className="mt-10">
          {loading && (
            <p className="text-sm text-slate-500">Loading articles...</p>
          )}

          {error && (
            <p className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {!loading && !error && articles.length === 0 && (
            <p className="text-sm text-slate-500">
              {searchTerm
                ? `No articles match "${searchTerm}".`
                : 'No articles found.'}
            </p>
          )}

          {!loading && !error && articles.length > 0 && (
            <div className="grid gap-4">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="rounded-2xl border border-white/10 bg-[#0e1218] p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-[.2em] text-[var(--personalDevelopment)]">
                          {article.category || 'Uncategorised'}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.15em] ${
                            article.status === 'published'
                              ? 'bg-emerald-400/10 text-emerald-300'
                              : 'bg-slate-400/10 text-slate-400'
                          }`}
                        >
                          {article.status}
                        </span>
                      </div>

                      <h3 className="mt-3 text-xl font-semibold">
                        {article.title}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        {article.reading_time
                          ? `${article.reading_time} min read`
                          : 'No reading time set'}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        href={`/admin/articles/edit/${article.id}`}
                        className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                      >
                        Edit
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(article)}
                        className="rounded-full border border-red-400/20 px-4 py-2 text-sm font-semibold text-red-400 transition hover:border-red-400/40 hover:bg-red-400/5"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && totalCount > 0 && (
            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
              <p className="text-sm text-slate-500">
                Showing {firstArticle}-{lastArticle} of {totalCount} articles
              </p>
              <nav
                aria-label="Article pages"
                className="flex items-center gap-2"
              >
                {page > 1 ? (
                  <a
                    href={articlesPageUrl(page - 1, searchTerm)}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                  >
                    Previous
                  </a>
                ) : (
                  <span className="rounded-full border border-white/5 px-4 py-2 text-sm font-semibold text-slate-700">
                    Previous
                  </span>
                )}
                <span className="px-2 text-sm text-slate-400">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <a
                    href={articlesPageUrl(page + 1, searchTerm)}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                  >
                    Next
                  </a>
                ) : (
                  <span className="rounded-full border border-white/5 px-4 py-2 text-sm font-semibold text-slate-700">
                    Next
                  </span>
                )}
              </nav>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
