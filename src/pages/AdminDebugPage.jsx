import React from 'react'
import { supabase } from '../lib/supabase'
import AdminHeader from '../components/admin/AdminHeader'

export default function AdminDebugPage() {
  const [session, setSession] = React.useState(null)
  const [adminUser, setAdminUser] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    async function load() {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        setSession(currentSession)

        if (!currentSession?.user?.id) {
          setLoading(false)
          return
        }

        const { data, error: adminError } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', currentSession.user.id)
          .maybeSingle()

        if (adminError && adminError.code !== 'PGRST116') {
          throw adminError
        }

        setAdminUser(data)
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <AdminHeader title="Admin auth debug" eyebrow="Admin / Diagnostics" />
      <main className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <div className="rounded-2xl border border-white/10 bg-[#0e1218] p-8">
          <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--mentoring)]">
            Debug
          </p>
          <h1 className="mt-4 text-3xl font-semibold">Admin auth debug</h1>

          {loading && (
            <p className="mt-6 text-sm text-slate-400">Loading session...</p>
          )}

          {error && (
            <p className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {!loading && (
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="rounded-xl border border-white/10 bg-[#090b0f] p-4">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">
                  Session
                </p>
                <p className="mt-2 break-all">
                  {session?.user?.id || 'No authenticated user'}
                </p>
                <p className="mt-2 break-all text-slate-400">
                  {session?.user?.email || 'No email'}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#090b0f] p-4">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">
                  admin_users lookup
                </p>
                <p className="mt-2 break-all">
                  {adminUser ? adminUser.user_id : 'No matching row found'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
