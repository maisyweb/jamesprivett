import React from 'react'
import { supabase } from '../lib/supabase'
import { isCurrentUserAdmin } from '../lib/admin'
import MentoringPlanManager from '../components/personal-development/MentoringPlanManager'
import MentoringSessionManager from '../components/personal-development/MentoringSessionManager'
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

export default function AdminMentoringClientDetailPage({
  clientId,
  activeSection = 'overview',
}) {
  const [session, setSession] = React.useState(null)
  const [loadingSession, setLoadingSession] = React.useState(true)
  const [admin, setAdmin] = React.useState(false)
  const [form, setForm] = React.useState({
    first_name: '',
    last_name: '',
    email: '',
    status: 'draft',
    invitation_status: 'not_invited',
  })
  const [client, setClient] = React.useState(null)
  const [loadingClient, setLoadingClient] = React.useState(
    clientId && clientId !== 'new'
  )
  const [saving, setSaving] = React.useState(false)
  const [sendingInvite, setSendingInvite] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [success, setSuccess] = React.useState(null)

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
        setLoadingSession(false)
        return
      }

      const hasAdminAccess = await isCurrentUserAdmin(currentSession)
      setAdmin(hasAdminAccess)
      setLoadingSession(false)
    }

    loadAccess()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession)

      if (!currentSession) {
        setAdmin(false)
        setLoadingSession(false)
        return
      }

      const hasAdminAccess = await isCurrentUserAdmin(currentSession)
      setAdmin(hasAdminAccess)
      setLoadingSession(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  React.useEffect(() => {
    if (!session || !admin || !clientId || clientId === 'new') {
      return
    }

    async function loadClient() {
      setLoadingClient(true)
      const { data, error: loadError } = await supabase
        .from('mentoring_clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (loadError) {
        console.error('Failed to load client:', loadError)
        setError(`Unable to load client: ${loadError.message}`)
        setLoadingClient(false)
        return
      }

      setClient(data)
      setForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        status: data.status || 'draft',
        invitation_status: data.invitation_status || 'not_invited',
      })
      setLoadingClient(false)
    }

    loadClient()
  }, [session, admin, clientId])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    if (!session || !admin) {
      setError('You are not authorised to save this client.')
      setSaving(false)
      return
    }

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      status: form.status,
      invitation_status: form.invitation_status,
    }

    if (!payload.first_name || !payload.last_name || !payload.email) {
      setError('First name, last name and email are required.')
      setSaving(false)
      return
    }

    try {
      if (clientId === 'new') {
        const { data, error: insertError } = await supabase
          .from('mentoring_clients')
          .insert(payload)
          .select('id')
          .single()

        if (insertError || !data) {
          throw insertError || new Error('Unable to create client record.')
        }

        setClient(data)
        window.location.href = `/admin/mentoring/clients/${data.id}`
        return
      }

      const { error: updateError } = await supabase
        .from('mentoring_clients')
        .update(payload)
        .eq('id', clientId)

      if (updateError) {
        throw updateError
      }

      setSuccess('Client details saved.')
    } catch (saveError) {
      console.error('Failed to save client:', saveError)
      setError(saveError?.message || 'Unable to save client details.')
    } finally {
      setSaving(false)
    }
  }

  async function handleInvite() {
    if (!clientId || clientId === 'new') {
      setError('Create the client before sending an invitation.')
      return
    }

    setSendingInvite(true)
    setError(null)
    setSuccess(null)

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        'mentoring-invite',
        {
          body: {
            client_id: clientId,
            email: form.email,
          },
        }
      )

      if (invokeError) {
        throw invokeError
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      setSuccess(data?.message || 'Invitation sent successfully.')
      setForm((current) => ({
        ...current,
        invitation_status: 'invited',
        status: current.status === 'draft' ? 'invited' : current.status,
      }))
    } catch (inviteError) {
      console.error('Invitation failed:', inviteError)

      let message = inviteError?.message || 'Unable to send the invitation.'
      const response = inviteError?.context

      if (response instanceof Response) {
        const responseBody = await response.json().catch(() => null)
        if (typeof responseBody?.error === 'string') {
          message = responseBody.error
        }
      }

      setError(message)
    } finally {
      setSendingInvite(false)
    }
  }

  if (loadingSession) {
    return (
      <PageMessage
        title="Loading client..."
        body="Checking your admin permissions."
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
        body="This account is not authorised to edit mentoring clients."
        actionHref="/admin/mentoring"
        actionLabel="Back to mentoring"
      />
    )
  }

  if (clientId !== 'new' && loadingClient) {
    return (
      <PageMessage
        title="Loading client..."
        body="Fetching the selected client record."
      />
    )
  }

  const isNewClient = clientId === 'new'
  const clientBasePath = `/admin/mentoring/clients/${clientId}`
  const sections = [
    { id: 'overview', label: 'Overview', href: clientBasePath },
    { id: 'goals', label: 'Goals & actions', href: `${clientBasePath}/goals` },
    {
      id: 'sessions',
      label: 'Sessions & notes',
      href: `${clientBasePath}/sessions`,
    },
  ]

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <AdminHeader
        title={isNewClient
          ? 'New client'
          : `${form.first_name || 'Client'} ${form.last_name || ''}`.trim() || 'Client'}
        eyebrow="Admin / Mentoring"
        actions={(
          <a
            href="/admin/mentoring/clients"
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 transition hover:border-white/20 hover:text-white"
          >
            Clients
          </a>
        )}
      />

      <main className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-9">
        {!isNewClient && (
          <nav
            aria-label="Client workspace"
            className="mb-7 overflow-x-auto border-b border-white/10"
          >
            <div className="flex min-w-max gap-6">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={section.href}
                  aria-current={activeSection === section.id ? 'page' : undefined}
                  className={`border-b-2 px-1 pb-3 text-sm transition ${
                    activeSection === section.id
                      ? 'border-[var(--mentoring)] font-semibold text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-200'
                  }`}
                >
                  {section.label}
                </a>
              ))}
            </div>
          </nav>
        )}

        {error && (
          <p className="mb-6 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-6 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
            {success}
          </p>
        )}

        {(isNewClient || activeSection === 'overview') && <form
          onSubmit={handleSave}
          className="rounded-xl border border-white/10 bg-[#0e1218] p-5 sm:p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">
                First name
              </span>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--mentoring)]/50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">
                Last name
              </span>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--mentoring)]/50"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-slate-400">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--mentoring)]/50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">Status</span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--mentoring)]/50"
              >
                <option value="draft">Draft</option>
                <option value="invited">Invited</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="ended">Ended</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">
                Invitation status
              </span>
              <select
                name="invitation_status"
                value={form.invitation_status}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--mentoring)]/50"
              >
                <option value="not_invited">Not invited</option>
                <option value="invited">Invited</option>
                <option value="accepted">Accepted</option>
                <option value="expired">Expired</option>
                <option value="failed">Failed</option>
              </select>
            </label>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[var(--mentoring)] px-5 py-3 text-sm font-semibold text-[#090b0f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save client'}
            </button>

            {!isNewClient && (
              <button
                type="button"
                onClick={handleInvite}
                disabled={sendingInvite}
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingInvite ? 'Sending invite...' : 'Send invitation'}
              </button>
            )}
          </div>
        </form>}

        {!isNewClient && activeSection === 'goals' && (
          <MentoringPlanManager clientId={clientId} />
        )}
        {!isNewClient && activeSection === 'sessions' && (
          <MentoringSessionManager clientId={clientId} />
        )}
      </main>
    </div>
  )
}
