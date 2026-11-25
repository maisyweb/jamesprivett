// Exports the public site data from Supabase into public/static-data/ so the
// site can run with VITE_STATIC_DATA=true while the Supabase project is paused.
//
// Run with: node --env-file=.env.local scripts/export-static-data.mjs
// Uses the publishable key, so it only sees what public visitors can see (RLS).

import { createClient } from '@supabase/supabase-js'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const outDir = path.resolve('public/static-data')
const imageDir = path.join(outDir, 'images')
const storagePattern = new RegExp(
  `${supabaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/storage/v1/object/public/[^\\s)"'>]+`,
  'g'
)

const downloaded = new Map()

async function localiseImage(url) {
  if (downloaded.has(url)) return downloaded.get(url)

  const fileName = path.basename(new URL(url).pathname)
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`Failed to download ${url}: ${response.status}`)

  await writeFile(
    path.join(imageDir, fileName),
    Buffer.from(await response.arrayBuffer())
  )
  const localPath = `/static-data/images/${fileName}`
  downloaded.set(url, localPath)
  return localPath
}

async function localiseText(text) {
  if (!text) return text
  let result = text
  for (const url of new Set(text.match(storagePattern) || [])) {
    result = result.replaceAll(url, await localiseImage(url))
  }
  return result
}

function check(label, { data, error }) {
  if (error) throw new Error(`${label}: ${error.message}`)
  return data
}

await rm(outDir, { recursive: true, force: true })
await mkdir(path.join(outDir, 'articles'), { recursive: true })
await mkdir(imageDir, { recursive: true })

const articles = check(
  'articles',
  await supabase
    .from('articles')
    .select(
      `id, title, slug, section, category, excerpt, content, reading_time,
       published_at, cover_image, featured,
       article_tags ( tags ( id, name, slug ) )`
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
)

const index = []
for (const article of articles) {
  const localised = {
    ...article,
    cover_image: await localiseText(article.cover_image),
    content: await localiseText(article.content),
  }
  await writeFile(
    path.join(outDir, 'articles', `${article.slug}.json`),
    JSON.stringify(localised, null, 2)
  )
  const { content, ...summary } = localised
  index.push(summary)
}
await writeFile(
  path.join(outDir, 'articles.json'),
  JSON.stringify(index, null, 2)
)

const metrics = check(
  'personal_metrics',
  await supabase
    .from('personal_metrics')
    .select(
      'id, name, slug, category, unit, value, starting_value, target, frequency'
    )
    .eq('active', true)
)
await writeFile(
  path.join(outDir, 'personal-metrics.json'),
  JSON.stringify(metrics, null, 2)
)

const mood = check(
  'personal_mood',
  await supabase
    .from('personal_mood')
    .select('year, month, score, note')
    .order('year', { ascending: true })
    .order('month', { ascending: true })
)
await writeFile(
  path.join(outDir, 'personal-mood.json'),
  JSON.stringify(mood, null, 2)
)

console.log(
  `Exported ${articles.length} articles, ${downloaded.size} images, ${metrics.length} metrics, ${mood.length} mood entries`
)
