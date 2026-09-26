import React from 'react'
import Arrow from './Arrow'

export default function ArticleCard({
  article,
  colour = 'var(--engineering)',
}) {
  return (
    <a
      href={`/articles/${article.slug}`}
      className="card group flex h-full flex-col rounded-2xl border border-white/10 bg-[#0e1218] p-6 sm:p-7"
    >
      <div className="flex items-center justify-between gap-4">
        <span
          className="text-[10px] font-bold uppercase tracking-[.24em]"
          style={{ color: colour }}
        >
          {article.category}
        </span>

        <span className="text-xs text-slate-600">{article.read}</span>
      </div>

      <h3
        className="mt-7 text-xl font-semibold leading-7 transition"
        style={{
          '--article-colour': colour,
        }}
      >
        <span className="group-hover:text-[var(--article-colour)]">
          {article.title}
        </span>
      </h3>

      <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">
        {article.excerpt}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/[.02] px-2.5 py-1 text-[11px] text-slate-500"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div
        className="mt-6 flex items-center gap-2 text-sm font-semibold"
        style={{ color: colour }}
      >
        Read article <Arrow />
      </div>
    </a>
  )
}
