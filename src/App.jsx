import React, { useEffect } from 'react'

import HomePage from './pages/HomePage'
import MentoringPage from './pages/MentoringPage'
import PersonalDevelopmentPage from './pages/PersonalDevelopmentPage'
import CVPage from './pages/CVPage'
import ArticlePage from './pages/ArticlePage'
import AdminPage from './pages/AdminPage'
import NewArticlePage from './pages/NewArticlePage'
import EditArticlePage from './pages/EditArticlePage'
import ArticlesPage from './pages/ArticlesPage'
import EngineeringPage from './pages/EngineeringPage'
import ArticleIdeasPage from './pages/ArticleIdeasPage'
import ArticleIdeaEditorPage from './pages/ArticleIdeaEditorPage'
import AdminArticlesPage from './pages/AdminArticlesPage'
import AdminContactEmailsPage from './pages/AdminContactEmailsPage'
import ContactPage from './pages/ContactPage'
import SEO from './components/SEO'

const siteUrl = 'https://jamesprivett.co.uk'

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'James Privett',
  url: siteUrl,
  image: `${siteUrl}/james.jpg`,
  jobTitle: 'Software Engineer and Engineering Leader',
}

const pageMetadata = {
  home: {
    title: 'James Privett — Software Engineer, Mentor & Lifelong Learner',
    description:
      'Software engineer, mentor and lifelong learner sharing ideas about software, leadership, mentoring and personal development.',
    canonical: `${siteUrl}/`,
    structuredData: personSchema,
  },
  engineering: {
    title: 'Engineering — James Privett',
    description:
      "My experience as a software engineer, team leader and mentor, covering software development, engineering leadership and the lessons I've learned building software.",
    canonical: `${siteUrl}/engineering`,
  },
  mentoring: {
    title: 'Mentoring — James Privett',
    description:
      'Thoughts on mentoring, leadership and helping people grow, from my experience as an engineering leader, mentor and coach.',
    canonical: `${siteUrl}/mentoring`,
  },
  personalDevelopment: {
    title: 'Personal Development — James Privett',
    description:
      'Lessons from getting fitter, building better habits and learning how to look after myself without making personal development unnecessarily complicated.',
    canonical: `${siteUrl}/personal-development`,
  },
  articles: {
    title: 'Articles — James Privett',
    description:
      "Ideas, lessons and things I've learned from building software, helping people grow and figuring out how to look after myself.",
    canonical: `${siteUrl}/articles`,
  },
  cv: {
    title: 'CV — James Privett',
    description:
      'The experience, skills and career history of James Privett, software engineer and engineering leader.',
    canonical: `${siteUrl}/cv`,
  },
  contact: {
    title: 'Contact — James Privett',
    description:
      'Get in touch with James Privett about software engineering, mentoring, collaboration or other opportunities.',
    canonical: `${siteUrl}/contact`,
  },
}

function renderPage(page, metadata) {
  return (
    <>
      <SEO {...metadata} />
      {page}
    </>
  )
}

export default function App() {
  const path = window.location.pathname

  useEffect(() => {
    if (!import.meta.env.PROD) return
    if (typeof window.gtag !== 'function') return

    window.gtag('event', 'page_view', {
      page_path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
      page_title: document.title,
      page_location: window.location.href,
    })
  }, [])

  if (path === '/cv' || path === '/cv/') {
    return renderPage(<CVPage />, pageMetadata.cv)
  }

  if (path === '/mentoring' || path === '/mentoring/') {
    return renderPage(<MentoringPage />, pageMetadata.mentoring)
  }

  if (path === '/personal-development' || path === '/personal-development/') {
    return renderPage(
      <PersonalDevelopmentPage />,
      pageMetadata.personalDevelopment
    )
  }

  if (path === '/engineering' || path === '/engineering/') {
    return renderPage(<EngineeringPage />, pageMetadata.engineering)
  }

  if (path === '/articles' || path === '/articles/') {
    return renderPage(<ArticlesPage />, pageMetadata.articles)
  }

  if (path === '/contact' || path === '/contact/') {
    return renderPage(<ContactPage />, pageMetadata.contact)
  }

  if (path.startsWith('/articles/')) {
    const slug = path.replace('/articles/', '').replace(/\/$/, '')
    return <ArticlePage slug={slug} />
  }

  if (path === '/admin/articles/new' || path === '/admin/articles/new/') {
    return renderPage(<NewArticlePage />, { noindex: true })
  }

  if (
    path === '/admin/article-ideas/new' ||
    path === '/admin/article-ideas/new/'
  ) {
    return renderPage(<ArticleIdeaEditorPage />, { noindex: true })
  }

  if (path.startsWith('/admin/article-ideas/edit/')) {
    const ideaId = path
      .replace('/admin/article-ideas/edit/', '')
      .replace(/\/$/, '')

    return renderPage(<ArticleIdeaEditorPage ideaId={ideaId} />, {
      noindex: true,
    })
  }

  if (path === '/admin/article-ideas' || path === '/admin/article-ideas/') {
    return renderPage(<ArticleIdeasPage />, { noindex: true })
  }

  if (path.startsWith('/admin/articles/edit/')) {
    const articleId = path
      .replace('/admin/articles/edit/', '')
      .replace(/\/$/, '')

    return renderPage(<EditArticlePage articleId={articleId} />, {
      noindex: true,
    })
  }

  if (path === '/admin/articles' || path === '/admin/articles/') {
    return renderPage(<AdminArticlesPage />, { noindex: true })
  }

  if (path === '/admin/contact-emails' || path === '/admin/contact-emails/') {
    return renderPage(<AdminContactEmailsPage />, { noindex: true })
  }

  if (path === '/admin' || path === '/admin/') {
    return renderPage(<AdminPage />, { noindex: true })
  }

  if (path === '/' || path === '') {
    return renderPage(<HomePage />, pageMetadata.home)
  }

  return renderPage(<HomePage />, { ...pageMetadata.home, noindex: true })
}
