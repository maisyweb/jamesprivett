import React from 'react'

export default function ArticleEditor({
  article,
  tags,
  onChange,
  onSave,
  onImageUpload,
  uploadingImage = false,
  saving = false,
  mode = 'new',
}) {
  function updateField(field, value) {
    onChange({
      ...article,
      [field]: value,
    })
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    onImageUpload(file)
    event.target.value = ''
  }

  function toggleTag(tagId) {
    const currentTags = article.tagIds || []

    const newTagIds = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId]

    updateField('tagIds', newTagIds)
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-slate-300"
        >
          Title
        </label>

        <input
          id="title"
          type="text"
          value={article.title}
          onChange={(event) => updateField('title', event.target.value)}
          placeholder="Enter article title"
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#0e1218] px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-white/25"
        />
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-semibold text-slate-300"
        >
          Slug
        </label>

        <input
          id="slug"
          type="text"
          value={article.slug}
          onChange={(event) => updateField('slug', event.target.value)}
          placeholder="article-url-slug"
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#0e1218] px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-white/25"
        />

        <p className="mt-2 text-xs text-slate-600">
          This becomes the URL for the article.
        </p>
      </div>

      {/* Section + Category */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="section"
            className="block text-sm font-semibold text-slate-300"
          >
            Section
          </label>

          <select
            id="section"
            value={article.section}
            onChange={(event) => updateField('section', event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0e1218] px-4 py-3 text-base text-white outline-none transition focus:border-white/25"
          >
            <option value="">Select section</option>
            <option value="Engineering">Engineering</option>
            <option value="Mentoring">Mentoring</option>
            <option value="Personal Development">Personal Development</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-semibold text-slate-300"
          >
            Category
          </label>

          <select
            id="category"
            value={article.category}
            onChange={(event) => updateField('category', event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0e1218] px-4 py-3 text-base text-white outline-none transition focus:border-white/25"
          >
            <option value="">Select category</option>
            <option value="AI & Engineering">AI & Engineering</option>
            <option value="Mindset">Mindset</option>
            <option value="Leadership">Leadership</option>
            <option value="Self-Improvement">Self-Improvement</option>
            <option value="Mentoring">Mentoring</option>
            <option value="Habits">Habits</option>
            <option value="Getting Started">Getting Started</option>
            <option value="Stuff">Stuff</option>
            <option value="Case Study">Case Study</option>
          </select>
        </div>
      </div>

      {/* Reading time */}
      <div>
        <label
          htmlFor="reading_time"
          className="block text-sm font-semibold text-slate-300"
        >
          Reading time
        </label>

        <div className="relative mt-2 sm:max-w-xs">
          <input
            id="reading_time"
            type="number"
            min="1"
            value={article.reading_time}
            onChange={(event) =>
              updateField('reading_time', event.target.value)
            }
            placeholder="5"
            className="w-full rounded-xl border border-white/10 bg-[#0e1218] px-4 py-3 pr-16 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-white/25"
          />

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-600">
            min
          </span>
        </div>
      </div>

      <div className="mt-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={article.featured || false}
            onChange={(event) =>
              onChange({
                ...article,
                featured: event.target.checked,
              })
            }
            className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-blue-400 focus:ring-blue-400"
          />

          <div>
            <span className="text-sm font-medium text-slate-200">
              Featured article
            </span>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Show this article as a featured article on its section page.
            </p>
          </div>
        </label>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-slate-300">
          Tags
        </label>

        <div className="mt-3 flex flex-wrap gap-2">
          {tags.length === 0 && (
            <p className="text-sm text-slate-600">No tags available.</p>
          )}

          {tags.map((tag) => {
            const selected = (article.tagIds || []).some(
              (tagId) => String(tagId) === String(tag.id)
            )

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  const currentTagIds = article.tagIds || []

                  const newTagIds = selected
                    ? currentTagIds.filter(
                        (tagId) => String(tagId) !== String(tag.id)
                      )
                    : [...currentTagIds, tag.id]

                  onChange({
                    ...article,
                    tagIds: newTagIds,
                  })
                }}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  selected
                    ? 'border-[var(--personalDevelopment)] bg-[var(--personalDevelopment)] text-[#090b0f]'
                    : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/25 hover:text-white'
                }`}
              >
                {selected ? '✓ ' : ''}
                {tag.name}
              </button>
            )
          })}
        </div>

        <p className="mt-3 text-xs text-slate-600">
          Select as many tags as apply.
        </p>
      </div>

      {/* Cover image */}
      <div>
        <label className="block text-sm font-semibold text-slate-300">
          Cover image
        </label>

        <div className="mt-3 w-fit overflow-hidden rounded-2xl border border-white/10 bg-[#0e1218]">
          {article.cover_image ? (
            <img
              src={article.cover_image}
              alt=""
              className="aspect-video w-[240px] object-cover"
            />
          ) : (
            <div className="flex aspect-video w-[240px] items-center justify-center text-sm text-slate-600">
              No cover image selected
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-full bg-white/[0.06] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.1] hover:text-white">
            {uploadingImage ? 'Uploading...' : 'Choose image'}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={uploadingImage}
              className="hidden"
            />
          </label>

          {article.cover_image && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...article,
                  cover_image: '',
                })
              }
              disabled={uploadingImage}
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-400 transition hover:border-red-400/30 hover:text-red-400"
            >
              Remove image
            </button>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-600">
          JPG, PNG or WebP. Ideally around 1200 × 675 pixels.
        </p>
      </div>

      {/* Excerpt */}
      <div>
        <label
          htmlFor="excerpt"
          className="block text-sm font-semibold text-slate-300"
        >
          Excerpt
        </label>

        <textarea
          id="excerpt"
          rows="3"
          value={article.excerpt}
          onChange={(event) => updateField('excerpt', event.target.value)}
          placeholder="A short description of the article..."
          className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#0e1218] px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-white/25"
        />

        <p className="mt-2 text-xs text-slate-600">
          Used on the article cards and article page.
        </p>
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-semibold text-slate-300"
        >
          Article content
        </label>

        <textarea
          id="content"
          rows="24"
          value={article.content}
          onChange={(event) => updateField('content', event.target.value)}
          placeholder={`Write your article in Markdown...

## A heading

Your article content goes here.

**You can use bold text**, lists, links and other Markdown formatting.`}
          className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#0e1218] px-4 py-4 font-mono text-sm leading-7 text-white outline-none transition placeholder:text-slate-600"
        />

        <p className="mt-2 text-xs text-slate-600">Markdown is supported.</p>
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-semibold text-slate-300"
        >
          Status
        </label>

        <select
          id="status"
          value={article.status}
          onChange={(event) => updateField('status', event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#0e1218] px-4 py-3 text-base text-white outline-none transition focus:border-white/25 sm:max-w-xs"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        <p className="mt-2 text-xs text-slate-600">
          Draft articles are only visible in the admin area.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        <a
          href="/admin"
          className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-400 transition hover:border-white/20 hover:text-white"
        >
          Cancel
        </a>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-full bg-[var(--personalDevelopment)] px-6 py-3 text-sm font-semibold text-[#090b0f] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? 'Saving...'
            : mode === 'edit'
              ? 'Save changes'
              : 'Create article'}
        </button>
      </div>
    </div>
  )
}
