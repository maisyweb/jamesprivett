import React from 'react'
import { supabase } from '../lib/supabase'

const emptyIdea = {
  title: '',
  article_type: 'engineering',
  importance: 3,
  description: '',
}

export default function ArticleIdeaEditorPage({ ideaId }) {
  const isEditing = Boolean(ideaId)
  const [idea, setIdea] = React.useState(emptyIdea)
  const [loading, setLoading] = React.useState(isEditing)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    if (!ideaId) {
      return
    }

    async function loadIdea() {
      const { data, error } = await supabase
        .from('article_ideas')
        .select('id, title, article_type, importance, description')
        .eq('id', ideaId)
        .single()

      if (error) {
        console.error('Failed to load article idea:', error)
        setError(`Unable to load article idea: ${error.message}`)
        setLoading(false)
        return
      }

      setIdea({
        title: data.title || '',
        article_type: data.article_type || 'engineering',
        importance: data.importance ?? 3,
        description: data.description || '',
      })
      setLoading(false)
    }

    loadIdea()
  }, [ideaId])

  function handleChange(event) {
    const { name, value } = event.target
    setIdea((currentIdea) => ({ ...currentIdea, [name]: value }))
  }

  async function handleSave(event) {
    event.preventDefault()
    setError(null)

    if (!idea.title.trim()) {
      setError('Please enter a title.')
      return
    }

    setSaving(true)

    const values = {
      title: idea.title.trim(),
      article_type: idea.article_type,
      importance: Number(idea.importance),
      description: idea.description.trim() || null,
    }

    const query = isEditing
      ? supabase.from('article_ideas').update(values).eq('id', ideaId)
      : supabase.from('article_ideas').insert(values)

    const { error: saveError } = await query

    if (saveError) {
      console.error('Failed to save article idea:', saveError)
      setError(saveError.message || 'Unable to save article idea.')
      setSaving(false)
      return
    }

    window.location.href = '/admin/article-ideas'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
        <main className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8">
          <p className="text-sm text-slate-500">Loading article idea...</p>
        </main>
      </div>
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
            <h1 className="mt-2 text-2xl font-semibold">
              {isEditing ? 'Edit Article Idea' : 'New Article Idea'}
            </h1>
          </div>

          <a
            href="/admin/article-ideas"
            className="text-sm text-slate-500 transition hover:text-white"
          >
            ← Back to article ideas
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[.3em] text-slate-600">
            Content planning
          </p>
          <h2 className="mt-2 text-3xl font-semibold">
            {isEditing ? 'Update this idea' : 'Add a new idea'}
          </h2>
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-white/10 bg-[#0e1218] p-6"
        >
          <div className="grid gap-5">
            <div>
              <label
                htmlFor="idea-title"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Title
              </label>
              <input
                id="idea-title"
                name="title"
                value={idea.title}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--personalDevelopment)]/50"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="idea-article-type"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Article type
                </label>
                <select
                  id="idea-article-type"
                  name="article_type"
                  value={idea.article_type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--personalDevelopment)]/50"
                >
                  <option value="engineering">Engineering</option>
                  <option value="mentoring">Mentoring</option>
                  <option value="personal_development">
                    Personal development
                  </option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="idea-importance"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Importance
                </label>
                <input
                  id="idea-importance"
                  name="importance"
                  type="number"
                  min="1"
                  max="5"
                  step="1"
                  value={idea.importance}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--personalDevelopment)]/50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="idea-description"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Description
              </label>
              <textarea
                id="idea-description"
                name="description"
                value={idea.description}
                onChange={handleChange}
                rows="6"
                className="w-full resize-y rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--personalDevelopment)]/50"
              />
            </div>
          </div>

          {error && (
            <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[var(--personalDevelopment)] px-5 py-3 text-sm font-semibold text-[#090b0f] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Add idea'}
            </button>
            <a
              href="/admin/article-ideas"
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              Cancel
            </a>
          </div>
        </form>
      </main>
    </div>
  )
}
