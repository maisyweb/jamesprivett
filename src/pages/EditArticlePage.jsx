import React from 'react'
import { supabase } from '../lib/supabase'
import ArticleEditor from '../components/admin/ArticleEditor'

export default function EditArticlePage({ articleId }) {
  const [article, setArticle] = React.useState(null)
  const [tags, setTags] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [uploadingImage, setUploadingImage] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    async function loadArticle() {
      setLoading(true)
      setError(null)

      const { data: articleData, error: articleError } = await supabase
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
          status,
          cover_image,
          featured,
          article_tags (
            tag_id
          )
        `
        )
        .eq('id', articleId)
        .single()

      if (articleError) {
        console.error('Failed to load article:', articleError)
        setError('Unable to load article.')
        setLoading(false)
        return
      }

      const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .select('id, name, slug')
        .order('name', { ascending: true })

      if (tagError) {
        console.error('Failed to load tags:', tagError)
        setError('Unable to load tags.')
        setLoading(false)
        return
      }

      setArticle({
        title: articleData.title || '',
        slug: articleData.slug || '',
        section: articleData.section || '',
        category: articleData.category || '',
        excerpt: articleData.excerpt || '',
        content: articleData.content || '',
        reading_time: articleData.reading_time || '',
        status: articleData.status || 'draft',
        cover_image: articleData.cover_image || '',
        featured: articleData.featured || '',
        tagIds: (articleData.article_tags || []).map(
          (relationship) => relationship.tag_id
        ),
      })

      setTags(tagData || [])
      setLoading(false)
    }

    loadArticle()
  }, [articleId])

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

    setArticle((currentArticle) => ({
      ...currentArticle,
      cover_image: data.publicUrl,
    }))

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

    const { error: articleError } = await supabase
      .from('articles')
      .update({
        title: article.title.trim(),
        slug: article.slug.trim(),
        section: article.section || null,
        category: article.category || null,
        excerpt: article.excerpt.trim() || null,
        content: article.content.trim(),
        cover_image: article.cover_image || null,
        featured: article.featured,
        reading_time: article.reading_time
          ? Number(article.reading_time)
          : null,
        status: article.status,
        published_at:
          article.status === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', articleId)

    if (articleError) {
      console.error('Failed to update article:', articleError)
      setError(articleError.message || 'Unable to save article.')
      setSaving(false)
      return
    }

    const { error: deleteTagsError } = await supabase
      .from('article_tags')
      .delete()
      .eq('article_id', articleId)

    if (deleteTagsError) {
      console.error('Failed to remove existing article tags:', deleteTagsError)
      setError('The article was updated, but its tags could not be updated.')
      setSaving(false)
      return
    }

    if (article.tagIds.length > 0) {
      const tagRows = article.tagIds.map((tagId) => ({
        article_id: Number(articleId),
        tag_id: tagId,
      }))

      const { error: tagError } = await supabase
        .from('article_tags')
        .insert(tagRows)

      if (tagError) {
        console.error('Failed to save article tags:', tagError)
        setError('The article was updated, but its tags could not be saved.')
        setSaving(false)
        return
      }
    }

    window.location.href = '/admin'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8">
          <p className="text-sm text-slate-500">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error && !article) {
    return (
      <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
          <p className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {error}
          </p>

          <a
            href="/admin"
            className="mt-6 inline-block text-sm text-slate-500 transition hover:text-white"
          >
            ← Back to dashboard
          </a>
        </div>
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

            <h1 className="mt-2 text-2xl font-semibold">Edit Article</h1>
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
            Articles
          </p>

          <h2 className="mt-2 text-3xl font-semibold">Edit article</h2>

          <p className="mt-3 max-w-2xl text-slate-500">
            Update the article, change its tags, or publish it when you're
            ready.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <ArticleEditor
          article={article}
          tags={tags}
          onChange={setArticle}
          onSave={handleSave}
          onImageUpload={handleImageUpload}
          uploadingImage={uploadingImage}
          saving={saving}
          mode="edit"
        />
      </main>
    </div>
  )
}
