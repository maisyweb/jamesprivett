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

export default function AdminMentoringClientsPage() {
  const [session, setSession] = React.useState(null)
  const [admin, setAdmin] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [clients, setClients] = React.useState([])
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    let mounted = true

    async function loadAccessAndClients() {
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

      if (!hasAdminAccess) {
        setLoading(false)
        return
      }

      await loadClients()
      setLoading(false)
    }

    async function loadClients() {
      let query = supabase
        .from('mentoring_clients')
        .select(
          'id, first_name, last_name, email, status, invitation_status, created_at, updated_at'
        )
        .order('updated_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (search.trim()) {
        const term = `%${search.trim()}%`
        query = query.or(
          `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`
        )
      }

      const { data, error: loadError } = await query

      if (loadError) {
        console.error('Failed to load mentoring clients:', loadError)
        setError(`Unable to load mentoring clients: ${loadError.message}`)
        return
      }

      setClients(data || [])
    }

    loadAccessAndClients()

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

      if (hasAdminAccess) {
        await loadClients()
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [search, statusFilter])

  if (loading) {
    return (
      <PageMessage
        title="Loading clients..."
        body="Checking your permissions and loading the mentoring list."
      />
    )
  }

  if (!session) {
    return (
      <PageMessage
        title="Admin access required"
        body="Sign in to manage mentoring clients."
        actionHref="/admin"
        actionLabel="Go to admin sign in"
      />
    )
  }

  if (!admin) {
    return (
      <PageMessage
        title="Access denied"
        body="This account is not authorised to view the mentoring client list."
        actionHref="/admin"
        actionLabel="Back to admin dashboard"
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <AdminHeader
        title="Mentoring clients"
        eyebrow="Admin / Mentoring"
        actions={
          <a
            href="/admin/mentoring/clients/new"
            className="rounded-lg bg-[var(--mentoring)] px-3 py-2 text-sm font-semibold text-[#090b0f]"
          >
            New client
          </a>
        }
      />

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="rounded-2xl border border-white/10 bg-[#0e1218] p-5">
          <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">
                Search clients
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
                className="w-full rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--mentoring)]/50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--mentoring)]/50"
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="invited">Invited</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="ended">Ended</option>
              </select>
            </label>
          </div>
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0e1218]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 bg-[#10141a] text-xs uppercase tracking-[.2em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Client</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Invitation</th>
                  <th className="px-5 py-4">Updated</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No clients match your current filter.
                    </td>
                  </tr>
                )}

                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-white/10 last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-200">
                          {client.first_name} {client.last_name}
                        </p>
                        <p className="mt-1 text-slate-500">{client.email}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full border border-white/10 px-2.5 py-1 capitalize text-slate-200">
                        {client.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 capitalize text-slate-400">
                      {client.invitation_status || 'not_invited'}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {client.updated_at
                        ? new Date(client.updated_at).toLocaleDateString(
                            'en-GB',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )
                        : '—'}
                    </td>

                    <td className="px-5 py-4">
                      <a
                        href={`/admin/mentoring/clients/${client.id}`}
                        className="text-[var(--mentoring)] hover:text-white"
                      >
                        Open
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
