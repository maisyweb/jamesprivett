import React from 'react'
import { supabase } from '../lib/supabase'
import DailyLogForm, {
  numericDailyFields,
  scoreFields,
} from '../components/personal-development/journal/DailyLogForm'
import DevelopmentEventManager from '../components/personal-development/journal/DevelopmentEventManager'
import HabitManager from '../components/personal-development/journal/HabitManager'

function localDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function emptyLog(date) {
  return {
    log_date: date,
    weight_lb: '',
    steps: '',
    calories_kcal: '',
    protein_grams: '',
    sleep_hours: '',
    water_litres: '',
    alcohol_units: '',
    workout_completed: false,
    workout_minutes: '',
    mood: '',
    energy: '',
    stress: '',
    day_rating: '',
    reading_completed: false,
    learning_completed: false,
    family_time: false,
    outdoors: false,
    went_well: '',
    could_improve: '',
    learned: '',
  }
}

function numberOrNull(value) {
  return value === '' || value === null ? null : Number(value)
}

export default function AdminPersonalDevelopmentJournalPage() {
  const [session, setSession] = React.useState(null)
  const [loadingSession, setLoadingSession] = React.useState(true)
  const [selectedDate, setSelectedDate] = React.useState(localDateString)

  React.useEffect(() => {
    let mounted = true

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()
      if (!mounted) return
      if (error) console.error('Failed to load admin session:', error)
      setSession(data?.session || null)
      setLoadingSession(false)
    }

    loadSession()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      setLoadingSession(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loadingSession) return <PageMessage>Loading...</PageMessage>

  if (!session) {
    return (
      <PageMessage>
        <p>Sign in to manage daily development records.</p>
        <a
          href="/admin"
          className="mt-4 inline-block text-sm text-[var(--personalDevelopment)] hover:text-white"
        >
          Go to admin sign in
        </a>
      </PageMessage>
    )
  }

  return (
    <DailyDevelopmentJournal
      key={session.user.id}
      userId={session.user.id}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
    />
  )
}

function PageMessage({ children }) {
  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <main className="mx-auto max-w-5xl px-5 py-16 sm:px-8">{children}</main>
    </div>
  )
}

function DailyDevelopmentJournal({ userId, selectedDate, onDateChange }) {
  const [log, setLog] = React.useState(() => emptyLog(selectedDate))
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [notice, setNotice] = React.useState(null)

  React.useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    setNotice(null)
    setLog(emptyLog(selectedDate))

    async function loadDailyLog() {
      const { data, error: loadError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', selectedDate)
        .maybeSingle()

      if (!active) return
      if (loadError) {
        console.error('Failed to load daily log:', loadError)
        setError(`Unable to load this date: ${loadError.message}`)
      } else {
        setLog(data || emptyLog(selectedDate))
      }
      setLoading(false)
    }

    loadDailyLog()
    return () => {
      active = false
    }
  }, [selectedDate, userId])

  function updateLog(field, value) {
    setLog((current) => ({ ...current, [field]: value }))
  }

  async function saveLog(event) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setNotice(null)

    const invalidScore = scoreFields.find((field) => {
      const value = numberOrNull(log[field])
      return (
        value !== null && (!Number.isInteger(value) || value < 1 || value > 10)
      )
    })
    const invalidMetric = numericDailyFields.find((field) => {
      const value = numberOrNull(log[field])
      return value !== null && (!Number.isFinite(value) || value < 0)
    })

    if (invalidScore || invalidMetric) {
      setError(
        invalidScore
          ? `${invalidScore.replace('_', ' ')} must be a whole number from 1 to 10.`
          : `${invalidMetric.replaceAll('_', ' ')} must be zero or greater.`
      )
      setSaving(false)
      return
    }

    const payload = {
      ...log,
      user_id: userId,
      log_date: selectedDate,
      updated_at: new Date().toISOString(),
    }
    ;[...numericDailyFields, ...scoreFields].forEach((field) => {
      payload[field] = numberOrNull(log[field])
    })

    const { data, error: saveError } = await supabase
      .from('daily_logs')
      .upsert(payload, { onConflict: 'user_id,log_date' })
      .select('*')
      .single()

    if (saveError) {
      console.error('Failed to save daily log:', saveError)
      setError(`Unable to save daily log: ${saveError.message}`)
      setSaving(false)
      return
    }
    setLog(data)
    setNotice('Daily log saved.')
    setSaving(false)
  }

  const inputClass =
    'mt-2 w-full rounded-lg border border-white/10 bg-[#0e1218] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[var(--personalDevelopment)]/60'

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--personalDevelopment)]">
              Admin / Personal development
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Journal</h1>
          </div>
          <a
            href="/admin/personal-development/dashboard"
            className="text-sm text-slate-500 transition hover:text-white"
          >
            Back to dashboard
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-600">
              Daily record
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              Personal development
            </h2>
          </div>
          <div className="w-full sm:max-w-xs">
            <label
              htmlFor="selected-date"
              className="block text-xs font-semibold uppercase tracking-[.15em] text-slate-500"
            >
              Log date
            </label>
            <input
              id="selected-date"
              type="date"
              value={selectedDate}
              onChange={(event) => onDateChange(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}
        {notice && !error && (
          <p role="status" className="mt-6 text-sm text-emerald-300">
            {notice}
          </p>
        )}

        {loading ? (
          <p className="py-12 text-sm text-slate-500">
            Loading daily records...
          </p>
        ) : (
          <>
            <DailyLogForm
              log={log}
              saving={saving}
              onChange={updateLog}
              onSubmit={saveLog}
            />
            <HabitManager
              userId={userId}
              selectedDate={selectedDate}
              dailyLogId={log.id}
            />
            <DevelopmentEventManager
              userId={userId}
              selectedDate={selectedDate}
            />
          </>
        )}
      </main>
    </div>
  )
}
