import React from 'react'
import { supabase } from '../lib/supabase'

export default function ArticleIdeasPage() {
  const [ideas, setIdeas] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    async function loadIdeas() {
      const { data, error } = await supabase
        .from('article_ideas')
        .select(
          'id, title, article_type, importance, description, created_date'
        )
        .order('importance', { ascending: true })

      if (error) {
        console.error('Failed to load article ideas:', error)
        setError(`Unable to load article ideas: ${error.message}`)
        setLoading(false)
        return
      }

      setIdeas(data || [])
      setLoading(false)
    }

    loadIdeas()
  }, [])

  async function handleDelete(idea) {
    const confirmed = window.confirm(
      `Delete "${idea.title}"?\n\nThis cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    const { error: deleteError } = await supabase
      .from('article_ideas')
      .delete()
      .eq('id', idea.id)

    if (deleteError) {
      console.error('Failed to delete article idea:', deleteError)
      window.alert('Unable to delete the article idea.')
      return
    }

    setIdeas((currentIdeas) =>
      currentIdeas.filter((currentIdea) => currentIdea.id !== idea.id)
    )
  }

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--personalDevelopment)]">
              Admin
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Article Ideas</h1>
          </div>

          <a
            href="/admin"
            className="text-sm text-slate-500 transition hover:text-white"
          >
            ← Back to dashboard
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-slate-600">
              Content planning
            </p>
            <h2 className="mt-2 text-3xl font-semibold">All article ideas</h2>
            <p className="mt-3 max-w-2xl text-slate-500">
              Keep a running list of topics to develop into future articles.
            </p>
          </div>

          <a
            href="/admin/article-ideas/new"
            className="self-start rounded-full bg-[var(--personalDevelopment)] px-5 py-3 text-sm font-semibold text-[#090b0f] transition hover:brightness-110 sm:self-auto"
          >
            + New idea
          </a>
        </div>

        <div className="mt-10">
          {loading && (
            <p className="text-sm text-slate-500">Loading ideas...</p>
          )}

          {error && (
            <p className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {!loading && !error && ideas.length === 0 && (
            <p className="text-sm text-slate-500">No article ideas found.</p>
          )}

          {!loading && !error && ideas.length > 0 && (
            <div className="grid gap-4">
              {ideas.map((idea) => (
                <article
                  key={idea.id}
                  className="rounded-2xl border border-white/10 bg-[#0e1218] p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-[.2em] text-[var(--personalDevelopment)]">
                          {(idea.article_type || 'other').replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-500">
                          Importance {idea.importance}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-semibold">
                        {idea.title}
                      </h3>
                      {idea.description && (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">
                          {idea.description}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        href={`/admin/article-ideas/edit/${idea.id}`}
                        className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                      >
                        Edit
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(idea)}
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
        </div>
      </main>
    </div>
  )
}
