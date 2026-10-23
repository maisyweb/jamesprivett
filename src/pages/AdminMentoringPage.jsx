import React from 'react'
import { supabase } from '../lib/supabase'
import { isCurrentUserAdmin } from '../lib/admin'
import AdminHeader from '../components/admin/AdminHeader'

function PageMessage({ title, body, actionHref, actionLabel }) {
  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <div className="rounded-2xl border border-white/10 bg-[#0e1218] p-8">
          <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--mentoring)]">
            Mentoring
          </p>
          <h1 className="mt-4 text-3xl font-semibold">{title}</h1>
          <p className="mt-4 text-sm leading-7 text-slate-400">{body}</p>
          {actionHref && (
            <a
              href={actionHref}
              className="mt-6 inline-block rounded-full bg-[var(--mentoring)] px-5 py-3 text-sm font-semibold text-[#090b0f]"
            >
              {actionLabel}
            </a>
          )}
        </div>
      </main>
    </div>
  )
}

export default function AdminMentoringPage() {
  const [session, setSession] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [admin, setAdmin] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    let mounted = true

    async function loadAccess() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      if (!mounted) {
        return
      }

      setSession(currentSession)

      if (!currentSession) {
        setLoading(false)
        return
      }

      const hasAdminAccess = await isCurrentUserAdmin(currentSession)
      setAdmin(hasAdminAccess)
      setLoading(false)
    }

    loadAccess()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession)

      if (!currentSession) {
        setAdmin(false)
        setLoading(false)
        return
      }

      const hasAdminAccess = await isCurrentUserAdmin(currentSession)
      setAdmin(hasAdminAccess)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <PageMessage
        title="Loading access..."
        body="Checking your mentoring admin access."
      />
    )
  }

  if (!session) {
    return (
      <PageMessage
        title="Admin access required"
        body="You need to sign in before you can manage mentoring clients."
        actionHref="/admin"
        actionLabel="Go to admin sign in"
      />
    )
  }

  if (!admin) {
    return (
      <PageMessage
        title="Access denied"
        body="This account is not authorised to manage the mentoring portal."
        actionHref="/admin"
        actionLabel="Back to admin dashboard"
      />
    )
  }

  return <MentoringDashboard session={session} />
}

function MentoringDashboard({ session }) {
  const [clients, setClients] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    async function loadClients() {
      const { data, error: loadError } = await supabase
        .from('mentoring_clients')
        .select(
          'id, first_name, last_name, email, status, invitation_status, created_at, updated_at'
        )
        .order('updated_at', { ascending: false })
        .limit(8)

      if (loadError) {
        console.error('Failed to load mentoring clients:', loadError)
        setError(`Unable to load mentoring clients: ${loadError.message}`)
        setLoading(false)
        return
      }

      setClients(data || [])
      setLoading(false)
    }

    loadClients()
  }, [])

  function formatDate(value) {
    if (!value) {
      return '—'
    }

    return new Date(value).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <AdminHeader
        title="Mentoring portal"
        eyebrow="Admin / Mentoring"
        actions={
          <a
            href="/admin/mentoring/clients"
            className="rounded-lg bg-[var(--mentoring)] px-3 py-2 text-sm font-semibold text-[#090b0f]"
          >
            Manage clients
          </a>
        }
      />

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-600">
              Overview
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              Client relationships
            </h2>
          </div>

          <a
            href="/admin/mentoring/clients/new"
            className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            + New client
          </a>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              'Active',
              clients.filter((client) => client.status === 'active').length,
              'text-emerald-300',
            ],
            [
              'Invited',
              clients.filter((client) => client.invitation_status === 'invited')
                .length,
              'text-[var(--mentoring)]',
            ],
            [
              'Suspended',
              clients.filter((client) => client.status === 'suspended').length,
              'text-amber-300',
            ],
            [
              'Draft',
              clients.filter((client) => client.status === 'draft').length,
              'text-slate-300',
            ],
          ].map(([label, value, colour]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-[#0e1218] p-5"
            >
              <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-600">
                {label}
              </p>
              <p className={`mt-4 text-4xl font-semibold ${colour}`}>{value}</p>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-8 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <section className="mt-10 rounded-2xl border border-white/10 bg-[#0e1218] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-600">
                Recent
              </p>
              <h3 className="mt-2 text-xl font-semibold">Recent clients</h3>
            </div>
            <a
              href="/admin/mentoring/clients"
              className="text-sm text-slate-500 hover:text-white"
            >
              View all
            </a>
          </div>

          {loading && (
            <p className="mt-5 text-sm text-slate-500">
              Loading client overview...
            </p>
          )}

          {!loading && clients.length === 0 && (
            <p className="mt-5 text-sm text-slate-500">No clients yet.</p>
          )}

          {!loading && clients.length > 0 && (
            <div className="mt-6 divide-y divide-white/[0.06]">
              {clients.map((client) => (
                <a
                  key={client.id}
                  href={`/admin/mentoring/clients/${client.id}`}
                  className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-200">
                      {client.first_name} {client.last_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {client.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="rounded-full border border-white/10 px-2.5 py-1 capitalize">
                      {client.status}
                    </span>
                    <span>{client.invitation_status || 'not_invited'}</span>
                    <span>{formatDate(client.updated_at)}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
