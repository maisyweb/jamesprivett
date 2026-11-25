// Temporary static data mode, used while the Supabase project is paused.
//
// Set VITE_STATIC_DATA=true to make the public pages read from the JSON files
// in public/static-data/ (created by scripts/export-static-data.mjs) instead of
// Supabase. Each helper returns { data, error } like a Supabase query, so the
// pages can use either source without changing how they handle results.

export const isStaticDataMode = import.meta.env.VITE_STATIC_DATA === 'true'

const jsonCache = new Map()

async function loadJson(path) {
  if (!jsonCache.has(path)) {
    jsonCache.set(
      path,
      fetch(`/static-data/${path}`).then((response) => {
        if (!response.ok) {
          throw new Error(`Static data request failed (${response.status})`)
        }
        return response.json()
      })
    )
  }

  try {
    return { data: await jsonCache.get(path), error: null }
  } catch (error) {
    jsonCache.delete(path)
    return { data: null, error }
  }
}

// Published articles, newest first (the export is already sorted that way).
export async function getStaticArticles({ section, featured, limit } = {}) {
  const { data, error } = await loadJson('articles.json')
  if (error) return { data: null, error }

  let articles = data
  if (section) articles = articles.filter((a) => a.section === section)
  if (featured) articles = articles.filter((a) => a.featured)
  if (limit) articles = articles.slice(0, limit)

  return { data: articles, error: null }
}

export async function getStaticArticle(slug) {
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return { data: null, error: new Error('Article not found') }
  }
  return loadJson(`articles/${slug}.json`)
}

export function getStaticPersonalMetrics() {
  return loadJson('personal-metrics.json')
}

export async function getStaticPersonalMood(year) {
  const { data, error } = await loadJson('personal-mood.json')
  if (error) return { data: null, error }
  return { data: data.filter((entry) => entry.year === year), error: null }
}
