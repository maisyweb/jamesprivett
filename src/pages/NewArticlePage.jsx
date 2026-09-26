import React from 'react'
import { supabase } from '../lib/supabase'
import ArticleEditor from '../components/admin/ArticleEditor'

const emptyArticle = {
  title: '',
  slug: '',
  section: '',
  category: '',
  excerpt: '',
  content: '',
  reading_time: '',
  status: 'draft',
  cover_image: '',
  featured: false,
  tagIds: [],
}

function createSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function NewArticlePage() {
  const [article, setArticle] = React.useState(emptyArticle)
  const [tags, setTags] = React.useState([])
  const [loadingTags, setLoadingTags] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [uploadingImage, setUploadingImage] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false)

  React.useEffect(() => {
    async function loadTags() {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name, slug')
        .order('name', { ascending: true })

      if (error) {
        console.error('Failed to load tags:', error)
        setError('Unable to load tags.')
        setLoadingTags(false)
        return
      }

      setTags(data || [])
      setLoadingTags(false)
    }

    loadTags()
  }, [])

  function handleChange(updatedArticle) {
    const titleChanged = updatedArticle.title !== article.title
    const slugChanged = updatedArticle.slug !== article.slug

    if (titleChanged && !slugManuallyEdited) {
      updatedArticle.slug = createSlug(updatedArticle.title)
    }

    if (slugChanged) {
      const generatedSlug = createSlug(updatedArticle.title)

      if (updatedArticle.slug === generatedSlug) {
        setSlugManuallyEdited(false)
      } else {
        setSlugManuallyEdited(true)
      }
    }

    setArticle(updatedArticle)
  }

  async function handleImageUpload(file) {
    setError(null)

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setError('Please choose a JPG, PNG or WebP image.')
      return
    }

    const maxFileSize = 5 * 1024 * 1024

    if (file.size > maxFileSize) {
      setError('Please choose an image smaller than 5MB.')
      return
    }

    setUploadingImage(true)

    const fileExtension = file.name.split('.').pop().toLowerCase()
    const fileName = `${crypto.randomUUID()}.${fileExtension}`
    const filePath = `articles/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Failed to upload article image:', uploadError)
      setError('Unable to upload the image.')
      setUploadingImage(false)
      return
    }

    const { data } = supabase.storage
      .from('article-images')
      .getPublicUrl(filePath)

    setArticle({
      ...article,
      cover_image: data.publicUrl,
    })

    setUploadingImage(false)
  }

  async function handleSave() {
    setError(null)

    if (!article.title.trim()) {
      setError('Please enter a title.')
      return
    }

    if (!article.slug.trim()) {
      setError('Please enter a slug.')
      return
    }

    if (!article.content.trim()) {
      setError('Please enter some article content.')
      return
    }

    setSaving(true)

    const now = new Date().toISOString()

    const { data: newArticle, error: articleError } = await supabase
      .from('articles')
      .insert({
        title: article.title.trim(),
        slug: article.slug.trim(),
        category: article.category || null,
        section: article.section || null,
        excerpt: article.excerpt.trim() || null,
        content: article.content.trim(),
        cover_image: article.cover_image || null,
        featured: article.featured,
        reading_time: article.reading_time
          ? Number(article.reading_time)
          : null,
        status: article.status,
        published_at: article.status === 'published' ? now : null,
      })
      .select('id')
      .single()

    if (articleError) {
      console.error('Failed to create article:', articleError)
      setError(articleError.message || 'Unable to create article.')
      setSaving(false)
      return
    }

    if (article.tagIds.length > 0) {
      const tagRows = article.tagIds.map((tagId) => ({
        article_id: newArticle.id,
        tag_id: tagId,
      }))

      const { error: tagError } = await supabase
        .from('article_tags')
        .insert(tagRows)

      if (tagError) {
        console.error('Failed to save article tags:', tagError)
        setError('The article was created, but its tags could not be saved.')
        setSaving(false)
        return
      }
    }

    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--personalDevelopment)]">
              Admin
            </p>

            <h1 className="mt-2 text-2xl font-semibold">New Article</h1>
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
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[.3em] text-slate-600">
            Training Journal
          </p>

          <h2 className="mt-2 text-3xl font-semibold">Write something new</h2>

          <p className="mt-3 max-w-2xl text-slate-500">
            Create a new article. You can save it as a draft and publish it when
            you're ready.
          </p>
        </div>

        {loadingTags && (
          <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-500">
            Loading tags...
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <ArticleEditor
          article={article}
          tags={tags}
          onChange={handleChange}
          onSave={handleSave}
          onImageUpload={handleImageUpload}
          uploadingImage={uploadingImage}
          saving={saving}
          mode="new"
        />
      </main>
    </div>
  )
}
