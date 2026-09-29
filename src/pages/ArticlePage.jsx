import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import Arrow from '../components/Arrow'

const siteUrl = 'https://jamesprivett.co.uk'

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

  const requestedCanonical = `${siteUrl}/articles/${encodeURIComponent(slug)}`

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b10] text-slate-100">
        <SEO
          title="Article — James Privett"
          canonical={requestedCanonical}
          noindex
        />
        <Header />

        <main className="mx-auto max-w-4xl px-6 py-24 text-center sm:px-8">
          <p className="text-slate-500">Loading article...</p>
        </main>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="flex min-h-screen flex-col overflow-hidden bg-[#090b0f] text-[#f3f4f6]">
        <SEO
          title="Article not found — James Privett"
          canonical={requestedCanonical}
          noindex
        />
        <Header />

        <main className="relative isolate flex flex-1 items-center overflow-hidden pt-20">
          <div className="grid-bg absolute inset-0 -z-20" />
          <div className="hero-glow absolute inset-0 -z-10" />

          <section className="mx-auto w-full max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="reveal max-w-2xl">
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[.3em] text-[var(--articles)]">
                <span className="h-px w-8 bg-[var(--articles)]" />
                Article not found
              </p>
              <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-[-.035em] sm:text-5xl">
                This article seems to have slipped away.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
                We couldn't find the article you were looking for. It may have
                moved, or it may no longer be available.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  className="rounded-full bg-[var(--articles)] px-5 py-3 text-sm font-semibold text-[#06201d] transition hover:-translate-y-0.5 hover:brightness-110"
                  href="/articles"
                >
                  Browse articles <Arrow />
                </a>
                <a
                  className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5"
                  href="/"
                >
                  Back to homepage
                </a>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
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

  const canonical = `${siteUrl}/articles/${encodeURIComponent(article.slug)}`
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || undefined,
    image: article.cover_image || undefined,
    datePublished: article.published_at || undefined,
    author: {
      '@type': 'Person',
      name: 'James Privett',
      url: siteUrl,
    },
    mainEntityOfPage: canonical,
  }

  return (
    <div className="min-h-screen bg-[#080b10] text-slate-100">
      <SEO
        title={`${article.title} | James Privett`}
        description={article.excerpt || ''}
        canonical={canonical}
        image={article.cover_image}
        type="article"
        publishedTime={article.published_at}
        structuredData={articleSchema}
      />
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
                  alt={`${article.title} article cover`}
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
