import React from 'react'
import { supabase } from '../lib/supabase'

export default function AdminContactEmailsPage() {
  const [session, setSession] = React.useState(null)
  const [loadingSession, setLoadingSession] = React.useState(true)

  React.useEffect(() => {
    let mounted = true

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (mounted) {
        setSession(session)
        setLoadingSession(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoadingSession(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loadingSession) {
    return <PageMessage>Loading...</PageMessage>
  }

  if (!session) {
    return (
      <PageMessage>
        <p>Sign in to view contact emails.</p>
        <a
          href="/admin"
          className="mt-4 inline-block text-sm text-[var(--personalDevelopment)] hover:text-white"
        >
          Go to admin sign in
        </a>
      </PageMessage>
    )
  }

  return <ContactEmailsInbox />
}

function PageMessage({ children }) {
  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <main className="mx-auto max-w-5xl px-5 py-16 sm:px-8">{children}</main>
    </div>
  )
}

function ContactEmailsInbox() {
  const [emails, setEmails] = React.useState([])
  const [selectedEmail, setSelectedEmail] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    async function loadEmails() {
      const { data, error } = await supabase
        .from('contact_emails')
        .select(
          'id, name, sender_email, subject, message, delivery_status, resend_id, created_at'
        )
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load contact emails:', error)
        setError(`Unable to load contact emails: ${error.message}`)
        setLoading(false)
        return
      }

      setEmails(data || [])
      setLoading(false)
    }

    loadEmails()
  }, [])

  async function handleDelete(email) {
    const confirmed = window.confirm(
      `Delete the email from ${email.name}?\n\nThis cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    const { error } = await supabase
      .from('contact_emails')
      .delete()
      .eq('id', email.id)

    if (error) {
      console.error('Failed to delete contact email:', error)
      window.alert('Unable to delete the contact email.')
      return
    }

    setEmails((currentEmails) =>
      currentEmails.filter((currentEmail) => currentEmail.id !== email.id)
    )
    setSelectedEmail(null)
  }

  function formatDate(value) {
    return new Date(value).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--personalDevelopment)]">
              Admin
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Contact emails</h1>
          </div>
          <a
            href="/admin"
            className="text-sm text-slate-500 transition hover:text-white"
          >
            Back to dashboard
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.3em] text-slate-600">
            Inbox
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Website messages</h2>
          <p className="mt-3 text-sm text-slate-500">
            {emails.length} {emails.length === 1 ? 'record' : 'records'}
          </p>
        </div>

        <div className="mt-8">
          {loading && (
            <p className="text-sm text-slate-500">Loading emails...</p>
          )}

          {error && (
            <p className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {!loading && !error && emails.length === 0 && (
            <p className="text-sm text-slate-500">No contact emails found.</p>
          )}

          {!loading && !error && emails.length > 0 && (
            <div className="divide-y divide-white/10 border-y border-white/10">
              {emails.map((email) => (
                <article
                  key={email.id}
                  className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`text-xs font-semibold uppercase tracking-[.15em] ${
                          email.delivery_status === 'sent'
                            ? 'text-emerald-300'
                            : email.delivery_status === 'failed'
                              ? 'text-red-300'
                              : 'text-amber-300'
                        }`}
                      >
                        {email.delivery_status}
                      </span>
                      <span className="text-xs text-slate-600">
                        {formatDate(email.created_at)}
                      </span>
                    </div>
                    <h3 className="mt-2 truncate text-lg font-semibold">
                      {email.subject}
                    </h3>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {email.name} · {email.sender_email}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedEmail(email)}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(email)}
                      className="rounded-full border border-red-400/20 px-4 py-2 text-sm font-semibold text-red-400 transition hover:border-red-400/40 hover:bg-red-400/5"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-email-subject"
            className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-[#0e1218] p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">
                  {selectedEmail.delivery_status} ·{' '}
                  {formatDate(selectedEmail.created_at)}
                </p>
                <h2
                  id="contact-email-subject"
                  className="mt-3 break-words text-2xl font-semibold"
                >
                  {selectedEmail.subject}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                aria-label="Close email details"
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-6 border-y border-white/10 py-4 text-sm">
              <p className="text-slate-300">{selectedEmail.name}</p>
              <a
                href={`mailto:${selectedEmail.sender_email}`}
                className="mt-1 inline-block text-[var(--personalDevelopment)] hover:text-white"
              >
                {selectedEmail.sender_email}
              </a>
            </div>

            <p className="mt-6 whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
              {selectedEmail.message}
            </p>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => handleDelete(selectedEmail)}
                className="rounded-full border border-red-400/20 px-4 py-2 text-sm font-semibold text-red-400 transition hover:border-red-400/40 hover:bg-red-400/5"
              >
                Delete email
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
