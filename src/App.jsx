import React, { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { isCurrentUserAdmin } from './lib/admin'

import HomePage from './pages/HomePage'
import MentoringPage from './pages/MentoringPage'
import MentoringSetupPage from './pages/MentoringSetupPage'
import MentoringPortalPage from './pages/MentoringPortalPage'
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
import AdminPersonalDevelopmentDashboardPage from './pages/AdminPersonalDevelopmentDashboardPage'
import AdminPersonalDevelopmentJournalPage from './pages/AdminPersonalDevelopmentJournalPage'
import AdminMentoringPage from './pages/AdminMentoringPage'
import AdminMentoringClientsPage from './pages/AdminMentoringClientsPage'
import AdminMentoringClientDetailPage from './pages/AdminMentoringClientDetailPage'
import AdminDebugPage from './pages/AdminDebugPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
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

function AdminAccessGate({ children }) {
  const [access, setAccess] = React.useState('checking')

  useEffect(() => {
    let active = true

    async function checkAccess(session) {
      if (!session) {
        if (active) setAccess('signed-out')
        return
      }

      const isAdmin = await isCurrentUserAdmin(session)
      if (active) setAccess(isAdmin ? 'admin' : 'denied')
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Failed to load admin session:', error)
        if (active) setAccess('denied')
        return
      }
      checkAccess(data.session)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAccess(session)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  if (access === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090b0f] px-5 text-sm text-slate-400">
        Checking access...
      </main>
    )
  }

  if (access === 'signed-out') {
    return <AdminPage />
  }

  if (access === 'denied') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#090b0f] px-5 text-center text-[#f3f4f6]">
        <h1 className="text-2xl font-semibold">Admin access required</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
          This account is for the client mentoring area and cannot access site administration.
        </p>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="mt-6 rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-300 hover:border-white/30 hover:text-white"
        >
          Sign out
        </button>
      </main>
    )
  }

  return children
}

function AppRoutes() {
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

  if (path === '/mentoring/setup' || path === '/mentoring/setup/') {
    return renderPage(<MentoringSetupPage />, { noindex: true })
  }

  if (path === '/mentoring/portal' || path === '/mentoring/portal/') {
    return renderPage(<MentoringPortalPage />, { noindex: true })
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

  if (path === '/admin/debug' || path === '/admin/debug/') {
    return renderPage(<AdminDebugPage />, { noindex: true })
  }

  if (path === '/admin/mentoring' || path === '/admin/mentoring/') {
    return renderPage(<AdminMentoringPage />, { noindex: true })
  }

  if (
    path === '/admin/mentoring/clients' ||
    path === '/admin/mentoring/clients/'
  ) {
    return renderPage(<AdminMentoringClientsPage />, { noindex: true })
  }

  const clientRoute = path.match(
    /^\/admin\/mentoring\/clients\/([^/]+)(?:\/(goals|sessions))?\/?$/
  )

  if (clientRoute) {
    const [, clientId, section = 'overview'] = clientRoute
    return renderPage(
      <AdminMentoringClientDetailPage
        clientId={clientId}
        activeSection={section}
      />,
      { noindex: true }
    )
  }

  if (
    path === '/admin/personal-development/dashboard' ||
    path === '/admin/personal-development/dashboard/'
  ) {
    return renderPage(<AdminPersonalDevelopmentDashboardPage />, {
      noindex: true,
    })
  }

  if (
    path === '/admin/personal-development' ||
    path === '/admin/personal-development/' ||
    path === '/admin/daily-development' ||
    path === '/admin/daily-development/'
  ) {
    return renderPage(<AdminPersonalDevelopmentJournalPage />, {
      noindex: true,
    })
  }

  if (path === '/admin' || path === '/admin/') {
    return renderPage(<AdminPage />, { noindex: true })
  }

  if (path === '/' || path === '') {
    return renderPage(<HomePage />, pageMetadata.home)
  }

  return renderPage(<NotFoundPage />, {
    title: 'Page Not Found — James Privett',
    description: "The page you're looking for doesn't exist or may have moved.",
    noindex: true,
  })
}

export default function App() {
  if (window.location.pathname.startsWith('/admin')) {
    return (
      <AdminAccessGate>
        <AppRoutes />
      </AdminAccessGate>
    )
  }

  return <AppRoutes />
}
