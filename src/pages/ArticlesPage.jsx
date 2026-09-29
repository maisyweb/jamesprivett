import React from 'react'
import Header from '../components/Header'
import { supabase } from '../lib/supabase'
import SiteFooter from '../components/SiteFooter'

const sections = [
  'All',
  'Engineering',
  'Mentoring',
  'Personal Development',
  'Other',
]

function getSectionStyles(section) {
  switch (section) {
    case 'Engineering':
      return {
        text: 'text-blue-400',
        border: 'border-blue-400/20',
        background: 'bg-blue-400/10',
      }

    case 'Mentoring':
      return {
        text: 'text-purple-400',
        border: 'border-purple-400/20',
        background: 'bg-purple-400/10',
      }

    case 'Personal Development':
      return {
        text: 'text-amber-400',
        border: 'border-amber-400/20',
        background: 'bg-amber-400/10',
      }

    default:
      return {
        text: 'text-slate-400',
        border: 'border-white/10',
        background: 'bg-white/[0.04]',
      }
  }
}

function ArticleImage({ article, featured = false }) {
  const styles = getSectionStyles(article.section)

  if (article.cover_image) {
    return (
      <img
        src={article.cover_image}
        alt={`${article.title} article cover`}
        className={`w-full object-cover transition duration-700 group-hover:scale-[1.02] ${
          featured ? 'aspect-[16/8] lg:aspect-auto lg:h-full' : 'aspect-video'
        }`}
      />
    )
  }

  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden bg-[#0e1218] ${
        featured ? 'aspect-[16/8] lg:aspect-auto lg:h-full' : 'aspect-video'
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${styles.background} opacity-40`}
      />

      <div className="relative px-8 text-center">
        <p
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${styles.text}`}
        >
          {article.section || 'Article'}
        </p>

        <p className="mt-4 max-w-sm text-xl font-semibold tracking-tight text-slate-300">
          {article.title}
        </p>
      </div>
    </div>
  )
}

function ArticleMeta({ article }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-600">
      {article.reading_time && <span>{article.reading_time} min read</span>}

      {article.reading_time && article.published_at && <span>·</span>}

      {article.published_at && (
        <span>
          {new Date(article.published_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      )}
    </div>
  )
}

function ArticleSectionLabel({ article }) {
  const styles = getSectionStyles(article.section)

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em]">
      {article.section && (
        <span className={styles.text}>{article.section}</span>
      )}

      {article.category && (
        <>
          <span className="text-slate-700">·</span>
          <span className="text-slate-600">{article.category}</span>
        </>
      )}
    </div>
  )
}

function ArticleTags({ article }) {
  if (!article.article_tags?.length) {
    return null
  }

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {article.article_tags.map(
        (relation) =>
          relation.tags && (
            <span
              key={relation.tags.id}
              className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-slate-500"
            >
              {relation.tags.name}
            </span>
          )
      )}
    </div>
  )
}

export default function ArticlesPage() {
  const getInitialSection = () => {
    const params = new URLSearchParams(window.location.search)
    const requestedSection = params.get('section')

    if (requestedSection && sections.includes(requestedSection)) {
      return requestedSection
    }

    return 'All'
  }

  const [articles, setArticles] = React.useState([])
  const [selectedSection, setSelectedSection] =
    React.useState(getInitialSection)
  const [selectedTag, setSelectedTag] = React.useState('All topics')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    async function loadArticles() {
      setLoading(true)
      setError(null)

      const { data, error: articlesError } = await supabase
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
          cover_image,
          published_at,
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
        .order('published_at', { ascending: false })

      if (articlesError) {
        console.error('Failed to load articles:', articlesError)
        setError('Unable to load the articles.')
        setLoading(false)
        return
      }

      setArticles(data || [])
      setLoading(false)
    }

    loadArticles()
  }, [])

  const availableTags = React.useMemo(() => {
    const tagMap = new Map()

    articles.forEach((article) => {
      ;(article.article_tags || []).forEach((relation) => {
        if (relation.tags) {
          tagMap.set(relation.tags.id, relation.tags)
        }
      })
    })

    return Array.from(tagMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }, [articles])

  const filteredArticles = React.useMemo(() => {
    return articles.filter((article) => {
      const sectionMatches =
        selectedSection === 'All' || article.section === selectedSection

      const tagMatches =
        selectedTag === 'All topics' ||
        article.article_tags?.some(
          (relation) => relation.tags?.name === selectedTag
        )

      return sectionMatches && tagMatches
    })
  }, [articles, selectedSection, selectedTag])

  const featuredArticle = filteredArticles[0]
  const remainingArticles = filteredArticles.slice(1)

  const hasActiveFilters =
    selectedSection !== 'All' || selectedTag !== 'All topics'

  const filterDescription = [
    selectedSection !== 'All' ? selectedSection : null,
    selectedTag !== 'All topics' ? selectedTag : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="min-h-screen bg-[#080b10] text-slate-100">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/articles-hero.png')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#080b10] via-[#080b10]/90 to-[#080b10]/20" />
          <div className="absolute inset-0 bg-[#080b10]/10" />

          <div className="relative mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28 lg:py-32">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--articles)]">
                Articles
              </p>

              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                Ideas, lessons and things I&apos;ve{' '}
                <span className="text-[var(--articles)]">learned.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
                Things I&apos;ve learned from building software, helping people
                grow, and figuring out how to look after myself.
              </p>
            </div>
          </div>
        </section>

        {/* Articles */}
        <section>
          <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20">
            {/* Section filters */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--articles)]/70">
                Browse by section
              </p>

              <div className="flex flex-wrap gap-2">
                {sections.map((section) => {
                  const selected = selectedSection === section

                  return (
                    <button
                      key={section}
                      type="button"
                      onClick={() => setSelectedSection(section)}
                      className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500 transition hover:text-white"
                      style={{
                        border: selected
                          ? '2px solid var(--articles)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        color: selected ? 'var(--articles)' : undefined,
                      }}
                    >
                      {section}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Topic filters */}
            {!loading && availableTags.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--articles)]/70">
                  Browse by topic
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTag('All topics')}
                    className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500 transition hover:text-white"
                    style={{
                      border:
                        selectedTag === 'All topics'
                          ? '2px solid var(--articles)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                      color:
                        selectedTag === 'All topics'
                          ? 'var(--articles)'
                          : undefined,
                    }}
                  >
                    All topics
                  </button>

                  {availableTags.map((tag) => {
                    const selected = selectedTag === tag.name

                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => setSelectedTag(tag.name)}
                        className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500 transition hover:text-white"
                        style={{
                          border: selected
                            ? '2px solid var(--articles)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          color: selected ? 'var(--articles)' : undefined,
                        }}
                      >
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Active filter summary */}
            {!loading && !error && (
              <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-300">
                    {filteredArticles.length}
                  </span>{' '}
                  {filteredArticles.length === 1 ? 'article' : 'articles'}
                  {hasActiveFilters && (
                    <>
                      {' '}
                      <span className="text-slate-700">·</span>{' '}
                      {filterDescription}
                    </>
                  )}
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSection('All')
                      setSelectedTag('All topics')
                    }}
                    className="w-fit text-sm font-semibold text-[var(--articles)] transition hover:text-white"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="py-20 text-center text-slate-500">
                Loading articles...
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="py-20 text-center text-red-400">{error}</div>
            )}

            {/* Empty */}
            {!loading && !error && filteredArticles.length === 0 && (
              <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-20 text-center">
                <p className="text-lg font-semibold text-white">
                  No articles found.
                </p>

                <p className="mt-3 text-sm text-slate-500">
                  There aren&apos;t any published articles matching these
                  filters yet.
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSection('All')
                      setSelectedTag('All topics')
                    }}
                    className="mt-6 text-sm font-semibold text-slate-400 transition hover:text-white"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Latest article */}
            {!loading && !error && featuredArticle && (
              <div className="mt-12">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--articles)]/70">
                    Latest
                  </p>
                </div>

                <a
                  href={`/articles/${featuredArticle.slug}`}
                  className="group block overflow-hidden rounded-[2rem] border border-[var(--articles)]/20 bg-[var(--articles)]/[0.03] transition hover:border-[var(--articles)]/50 hover:bg-[var(--articles)]/[0.06]"
                >
                  <div className="grid lg:grid-cols-2">
                    <div className="overflow-hidden">
                      <ArticleImage article={featuredArticle} featured />
                    </div>

                    <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                      <ArticleSectionLabel article={featuredArticle} />

                      <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-white transition group-hover:text-[var(--articles)] sm:text-4xl">
                        {featuredArticle.title}
                      </h2>

                      {featuredArticle.excerpt && (
                        <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">
                          {featuredArticle.excerpt}
                        </p>
                      )}

                      <div className="mt-7">
                        <ArticleMeta article={featuredArticle} />
                      </div>

                      <ArticleTags article={featuredArticle} />

                      <div className="mt-8 text-sm font-semibold text-[var(--articles)] transition group-hover:text-white">
                        Read article →
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            )}

            {/* Remaining articles */}
            {!loading && !error && remainingArticles.length > 0 && (
              <div className="mt-20">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--articles)]/70">
                      More articles
                    </p>

                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                      More things I&apos;ve written
                    </h2>
                  </div>

                  <span className="hidden text-sm text-slate-600 sm:block">
                    {remainingArticles.length}{' '}
                    {remainingArticles.length === 1 ? 'article' : 'articles'}
                  </span>
                </div>

                <div className="mt-8 grid gap-8 md:grid-cols-3">
                  {remainingArticles.map((article) => (
                    <a
                      key={article.id}
                      href={`/articles/${article.slug}`}
                      className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] transition hover:border-[var(--articles)]/40 hover:bg-[var(--articles)]/[0.04]"
                    >
                      <div className="overflow-hidden">
                        <ArticleImage article={article} />
                      </div>

                      <div className="p-7">
                        <ArticleSectionLabel article={article} />

                        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white transition group-hover:text-[var(--articles)]">
                          {article.title}
                        </h3>

                        {article.excerpt && (
                          <p className="mt-3 line-clamp-3 text-base leading-7 text-slate-400">
                            {article.excerpt}
                          </p>
                        )}

                        <div className="mt-6">
                          <ArticleMeta article={article} />
                        </div>

                        <ArticleTags article={article} />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
