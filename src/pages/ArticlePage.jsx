import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import SiteFooter from '../components/SiteFooter'

export default function ArticlePage({ slug }) {
  const [article, setArticle] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    async function loadArticle() {
      setLoading(true)
      setError(null)

      const { data, error: articleError } = await supabase
        .from('articles')
        .select(
          `
          id,
          title,
          slug,
          section,
          category,
          excerpt,
          content,
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
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (articleError) {
        console.error('Failed to load article:', articleError)
        setError('Unable to find this article.')
        setLoading(false)
        return
      }

      setArticle(data)
      setLoading(false)
    }

    loadArticle()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b10] text-slate-100">
        <Header />

        <main className="mx-auto max-w-4xl px-6 py-24 text-center sm:px-8">
          <p className="text-slate-500">Loading article...</p>
        </main>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#080b10] text-slate-100">
        <Header />

        <main className="mx-auto max-w-4xl px-6 py-24 text-center sm:px-8">
          <p className="text-red-400">
            {error || 'Unable to find this article.'}
          </p>

          <a
            href="/articles"
            className="mt-6 inline-block text-sm font-semibold text-slate-400 underline underline-offset-4 transition hover:text-white"
          >
            ← Back to articles
          </a>
        </main>
      </div>
    )
  }

  const tags = (article.article_tags || [])
    .map((relation) => relation.tags)
    .filter(Boolean)

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const sectionClass =
    article.section === 'Engineering'
      ? 'text-blue-400'
      : article.section === 'Mentoring'
        ? 'text-purple-400'
        : article.section === 'Personal Development'
          ? 'text-amber-400'
          : 'text-slate-500'

  return (
    <div className="min-h-screen bg-[#080b10] text-slate-100">
      <Header />

      <main>
        <article>
          {/* Introduction */}
          <header className="mx-auto max-w-5xl px-6 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-24">
            <div className="max-w-4xl">
              {article.section && (
                <p
                  className={`text-sm font-semibold uppercase tracking-[0.22em] ${sectionClass}`}
                >
                  {article.section}
                </p>
              )}

              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="mt-7 max-w-2xl text-xl leading-8 text-slate-400 sm:text-2xl sm:leading-9">
                  {article.excerpt}
                </p>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-600">
                {article.category && <span>{article.category}</span>}

                {article.category && article.reading_time && <span>·</span>}

                {article.reading_time && (
                  <span>{article.reading_time} min read</span>
                )}

                {article.reading_time && publishedDate && <span>·</span>}

                {publishedDate && <span>{publishedDate}</span>}
              </div>
            </div>
          </header>

          {/* Cover image */}
          {article.cover_image && (
            <div className="mx-auto max-w-6xl px-6 sm:px-8">
              <div className="overflow-hidden rounded-[2rem]">
                <img
                  src={article.cover_image}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Article */}
          <div className="mx-auto max-w-5xl px-6 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20">
            <div className="article-content text-base leading-8 text-slate-300 sm:text-lg sm:leading-9">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content}
              </ReactMarkdown>
            </div>

            {/* Footer */}
            <footer className="mt-20 border-t border-white/10 pt-8">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-white/[0.05] px-4 py-2 text-sm text-slate-500"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <a
                href="/articles"
                className="mt-8 inline-block text-sm font-semibold text-slate-500 transition hover:text-white"
              >
                ← Back to all articles
              </a>
            </footer>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
