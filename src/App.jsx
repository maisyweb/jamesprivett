import React from 'react'

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
import ContactPage from './pages/ContactPage'

export default function App() {
  const path = window.location.pathname

  if (path === '/cv' || path === '/cv/') {
    return <CVPage />
  }

  if (path === '/mentoring' || path === '/mentoring/') {
    return <MentoringPage />
  }

  if (path === '/personal-development' || path === '/personal-development/') {
    return <PersonalDevelopmentPage />
  }

  if (path === '/engineering' || path === '/engineering/') {
    return <EngineeringPage />
  }

  if (path === '/articles' || path === '/articles/') {
    return <ArticlesPage />
  }

  if (path === '/contact' || path === '/contact/') {
    return <ContactPage />
  }

  if (path.startsWith('/articles/')) {
    const slug = path.replace('/articles/', '').replace(/\/$/, '')
    return <ArticlePage slug={slug} />
  }

  if (path === '/admin/articles/new' || path === '/admin/articles/new/') {
    return <NewArticlePage />
  }

  if (
    path === '/admin/article-ideas/new' ||
    path === '/admin/article-ideas/new/'
  ) {
    return <ArticleIdeaEditorPage />
  }

  if (path.startsWith('/admin/article-ideas/edit/')) {
    const ideaId = path
      .replace('/admin/article-ideas/edit/', '')
      .replace(/\/$/, '')

    return <ArticleIdeaEditorPage ideaId={ideaId} />
  }

  if (path === '/admin/article-ideas' || path === '/admin/article-ideas/') {
    return <ArticleIdeasPage />
  }

  if (path.startsWith('/admin/articles/edit/')) {
    const articleId = path
      .replace('/admin/articles/edit/', '')
      .replace(/\/$/, '')

    return <EditArticlePage articleId={articleId} />
  }

  if (path === '/admin/articles' || path === '/admin/articles/') {
    return <AdminArticlesPage />
  }

  if (path === '/admin' || path === '/admin/') {
    return <AdminPage />
  }

  return <HomePage />
}
