import React, { useEffect } from 'react'

const SITE_URL = 'https://jamesprivett.co.uk'
const DEFAULT_TITLE =
  'James Privett — Software Engineer, Mentor & Lifelong Learner'
const DEFAULT_DESCRIPTION =
  'Software engineer, mentor and lifelong learner sharing ideas about software, leadership, mentoring and personal development.'
const DEFAULT_IMAGE = `${SITE_URL}/james.jpg`

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)

  if (!content) {
    element?.remove()
    return
  }

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image,
  type = 'website',
  noindex = false,
  publishedTime,
  structuredData,
}) {
  useEffect(() => {
    const canonicalUrl = new URL(
      canonical || window.location.pathname,
      SITE_URL
    ).href
    const imageUrl = new URL(image || DEFAULT_IMAGE, SITE_URL).href
    const jsonLdId = 'site-seo-jsonld'

    document.title = title

    let canonicalElement = document.head.querySelector('link[rel="canonical"]')

    if (!canonicalElement) {
      canonicalElement = document.createElement('link')
      canonicalElement.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalElement)
    }
    canonicalElement.setAttribute('href', canonicalUrl)

    setMeta('name', 'description', description)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:image', imageUrl)
    setMeta('property', 'og:site_name', 'James Privett')
    setMeta('property', 'article:published_time', publishedTime)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', imageUrl)

    let jsonLdElement = document.getElementById(jsonLdId)

    if (!structuredData) {
      jsonLdElement?.remove()
      return
    }

    if (!jsonLdElement) {
      jsonLdElement = document.createElement('script')
      jsonLdElement.id = jsonLdId
      jsonLdElement.type = 'application/ld+json'
      document.head.appendChild(jsonLdElement)
    }

    jsonLdElement.textContent = JSON.stringify(structuredData)
  }, [
    canonical,
    description,
    image,
    noindex,
    publishedTime,
    structuredData,
    title,
    type,
  ])

  return null
}
