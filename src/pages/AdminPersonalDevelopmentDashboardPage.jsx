import React from 'react'
import { supabase } from '../lib/supabase'
import DashboardHeader from '../components/personal-development/dashboard/DashboardHeader'
import DashboardOverview from '../components/personal-development/dashboard/DashboardOverview'
import TrendChart from '../components/personal-development/dashboard/TrendChart'
import WellbeingTrends from '../components/personal-development/dashboard/WellbeingTrends'
import PhysicalProgress from '../components/personal-development/dashboard/PhysicalProgress'
import HabitOverview from '../components/personal-development/dashboard/HabitOverview'
import BehaviourInsights from '../components/personal-development/dashboard/BehaviourInsights'
import DevelopmentTimeline from '../components/personal-development/dashboard/DevelopmentTimeline'
import ReflectionSection from '../components/personal-development/dashboard/ReflectionSection'
import DashboardInsights from '../components/personal-development/dashboard/DashboardInsights'
import PeriodComparison from '../components/personal-development/dashboard/PeriodComparison'
import YearSummary from '../components/personal-development/dashboard/YearSummary'
import RatingDistribution from '../components/personal-development/dashboard/RatingDistribution'
import SectionTitle from '../components/personal-development/dashboard/SectionTitle'
import {
  average,
  calculateHabitCompletion,
  calculateInsights,
  calculateOverview,
  calculateRatingDistribution,
  calculateRollingAverage,
  calculateYearSummary,
  comparePeriods,
  dateRangeForPeriod,
  localDateString,
  normalizeDailyLog,
} from '../lib/personalDevelopmentDashboard'

const emptyData = { logs: [], habits: [], dailyHabits: [], events: [] }

async function fetchAllPages(buildQuery, pageSize = 1000) {
  const rows = []
  let offset = 0

  while (true) {
    const { data, error } = await buildQuery().range(
      offset,
      offset + pageSize - 1
    )
    if (error) return { data: null, error }
    rows.push(...(data || []))
    if (!data || data.length < pageSize) break
    offset += pageSize
  }

  return { data: rows, error: null }
}

async function fetchDailyHabits(logIds) {
  const idGroups = []
  for (let index = 0; index < logIds.length; index += 200) {
    idGroups.push(logIds.slice(index, index + 200))
  }

  const groups = await Promise.all(
    idGroups.map((ids) =>
      fetchAllPages(() =>
        supabase.from('daily_habits').select('*').in('daily_log_id', ids)
      )
    )
  )
  const failed = groups.find((group) => group.error)
  return failed
    ? { data: null, error: failed.error }
    : { data: groups.flatMap((group) => group.data), error: null }
}

export default function AdminPersonalDevelopmentDashboardPage() {
  const [session, setSession] = React.useState(null)
  const [loadingSession, setLoadingSession] = React.useState(true)
  const [range, setRange] = React.useState('90')
  const [data, setData] = React.useState(emptyData)
  const [loadingData, setLoadingData] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [reload, setReload] = React.useState(0)

  React.useEffect(() => {
    let mounted = true

    async function loadSession() {
      const { data: authData, error: authError } =
        await supabase.auth.getSession()
      if (!mounted) return
      if (authError) setError(`Unable to check sign-in: ${authError.message}`)
      setSession(authData?.session || null)
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

  React.useEffect(() => {
    if (!session?.user?.id) return undefined
    let active = true
    setLoadingData(true)
    setError(null)

    const today = localDateString()
    const days = range === 'all' ? null : Number(range)
    const bounds = dateRangeForPeriod(days, today)
    const buildLogsQuery = () => {
      let query = supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .lte('log_date', today)
        .order('log_date', { ascending: true })
      if (bounds.previousStart)
        query = query.gte('log_date', bounds.previousStart)
      return query
    }
    const buildEventsQuery = () => {
      let query = supabase
        .from('development_events')
        .select('*')
        .eq('user_id', session.user.id)
        .lte('event_date', today)
        .order('event_date', { ascending: false })
      if (bounds.start) query = query.gte('event_date', bounds.start)
      return query
    }

    async function loadDashboardData() {
      const [logsResult, habitsResult, eventsResult] = await Promise.all([
        fetchAllPages(buildLogsQuery),
        supabase
          .from('habit_definitions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('sort_order', { ascending: true }),
        fetchAllPages(buildEventsQuery),
      ])
      const queryError =
        logsResult.error || habitsResult.error || eventsResult.error

      if (queryError) {
        console.error(
          'Failed to load personal development dashboard:',
          queryError
        )
        if (active) {
          setError(`Unable to load dashboard data: ${queryError.message}`)
          setLoadingData(false)
        }
        return
      }

      const logs = (logsResult.data || []).map(normalizeDailyLog)
      let dailyHabits = []
      if (logs.length) {
        const { data: rows, error: habitsError } = await fetchDailyHabits(
          logs.map((log) => log.id)
        )

        if (habitsError) {
          console.error('Failed to load daily habit records:', habitsError)
          if (active) {
            setError(`Unable to load habit records: ${habitsError.message}`)
            setLoadingData(false)
          }
          return
        }
        dailyHabits = rows || []
      }

      if (!active) return
      setData({
        logs,
        habits: habitsResult.data || [],
        dailyHabits,
        events: eventsResult.data || [],
      })
      setLoadingData(false)
    }

    loadDashboardData()
    return () => {
      active = false
    }
  }, [session?.user?.id, range, reload])

  const derived = React.useMemo(() => {
    const today = localDateString()
    const days = range === 'all' ? null : Number(range)
    const bounds = dateRangeForPeriod(days, today)
    const currentLogs = data.logs.filter(
      (log) => !bounds.start || log.log_date >= bounds.start
    )
    const previousLogs = bounds.previousStart
      ? data.logs.filter(
          (log) =>
            log.log_date >= bounds.previousStart &&
            log.log_date <= bounds.previousEnd
        )
      : []
    const currentIds = new Set(currentLogs.map((log) => log.id))
    const previousIds = new Set(previousLogs.map((log) => log.id))
    const currentRecords = data.dailyHabits.filter((row) =>
      currentIds.has(row.daily_log_id)
    )
    const previousRecords = data.dailyHabits.filter((row) =>
      previousIds.has(row.daily_log_id)
    )
    const habitSummary = calculateHabitCompletion(
      currentLogs,
      data.habits,
      currentRecords
    )
    const previousHabitSummary = calculateHabitCompletion(
      previousLogs,
      data.habits,
      previousRecords
    )
    const overview = calculateOverview(currentLogs)
    const previousOverview = calculateOverview(previousLogs)
    const elapsedDays = currentLogs.length
      ? Math.max(
          1,
          Math.ceil(
            (new Date(`${today}T12:00:00`) -
              new Date(`${currentLogs[0].log_date}T12:00:00`)) /
              86400000
          ) + 1
        )
      : 0
    const totalDays = days || elapsedDays
    const stepsAverages = new Map(
      calculateRollingAverage(data.logs, 'steps').map((item) => [
        item.date,
        item.value,
      ])
    )
    const weightAverages = new Map(
      calculateRollingAverage(data.logs, 'weight_lb').map((item) => [
        item.date,
        item.value,
      ])
    )
    const chartLogs = currentLogs.map((log) => ({
      ...log,
      steps_rolling: stepsAverages.get(log.log_date),
      weight_rolling: weightAverages.get(log.log_date),
    }))
    const currentEvents = data.events.filter(
      (event) => !bounds.start || event.event_date >= bounds.start
    )
    const comparisons = comparePeriods(currentLogs, previousLogs)
    const yearSummary = calculateYearSummary(
      currentLogs,
      currentEvents,
      habitSummary
    )

    return {
      bounds,
      currentLogs,
      previousLogs,
      currentRecords,
      previousRecords,
      events: currentEvents,
      habitSummary,
      previousHabitSummary,
      overview,
      previousOverview,
      totalDays,
      chartLogs,
      comparisons,
      yearSummary,
      insights: calculateInsights(currentLogs, habitSummary, totalDays),
      moodDistribution: calculateRatingDistribution(currentLogs, 'mood'),
      dayRatingDistribution: calculateRatingDistribution(
        currentLogs,
        'day_rating'
      ),
      startDate: bounds.start || currentLogs[0]?.log_date || today,
      endDate: today,
    }
  }, [data, range])

  if (loadingSession || (session && loadingData)) {
    return (
      <DashboardMessage>
        Loading your personal development data...
      </DashboardMessage>
    )
  }

  if (!session) {
    return (
      <DashboardMessage>
        <p>Sign in to view your personal development dashboard.</p>
        <a
          href="/admin"
          className="mt-4 inline-block text-sm text-[var(--personalDevelopment)] hover:text-white"
        >
          Go to admin sign in
        </a>
      </DashboardMessage>
    )
  }

  const selectedDays = range === 'all' ? null : Number(range)
  const isYearView = range === '365' || range === 'all'
  const journalUrl = '/admin/personal-development'

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <DashboardHeader
        range={range}
        onRangeChange={setRange}
        dateRange={{ start: derived.startDate, end: derived.endDate }}
      />
      <main className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.06] py-3">
          <p className="text-xs text-slate-600">
            {derived.currentLogs.length} days recorded · {derived.events.length}{' '}
            events in this period
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setReload((value) => value + 1)}
              className="text-xs text-slate-500 hover:text-white"
            >
              Refresh data
            </button>
            <a
              href={journalUrl}
              className="text-xs text-[var(--personalDevelopment)] hover:text-white"
            >
              Open journal to add or edit entries
            </a>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-3 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setReload((value) => value + 1)}
              className="self-start text-xs underline sm:self-auto"
            >
              Retry
            </button>
          </div>
        )}

        {!error && (
          <>
            {!derived.currentLogs.length && (
              <section className="border-b border-white/10 py-10">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--personalDevelopment)]">
                  A clear starting point
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-semibold">
                  Your data will tell its story over time.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  There are no daily records in this period. Events and habit
                  definitions will appear as you add them.
                </p>
                <a
                  href={journalUrl}
                  className="mt-5 inline-block rounded-lg bg-[var(--personalDevelopment)] px-4 py-2.5 text-sm font-semibold text-[#090b0f]"
                >
                  Open journal
                </a>
              </section>
            )}

            <DashboardOverview
              current={derived.overview}
              previous={derived.previousOverview}
              totalDays={derived.totalDays}
              daysLogged={derived.currentLogs.length}
              habitRate={derived.habitSummary.rate}
            />

            <section className="border-b border-white/10 py-8">
              <SectionTitle
                eyebrow="The big picture"
                title="Trends over time"
                detail="Daily readings are shown as entered; moving averages smooth noise without hiding the underlying observations."
              />
              <div className="mt-5 grid gap-x-8 gap-y-8 lg:grid-cols-2">
                <TrendChart
                  title="Weight"
                  description="lb · a focused axis makes small changes visible"
                  rows={derived.chartLogs}
                  series={[
                    { field: 'weight_lb', label: 'Daily', color: '#e4b962' },
                    {
                      field: 'weight_rolling',
                      label: '7-day average',
                      color: '#e4b962',
                      dash: '5 4',
                    },
                  ]}
                />
                <TrendChart
                  title="Steps"
                  description="Steps per day and 7-day rolling average"
                  rows={derived.chartLogs}
                  series={[
                    { field: 'steps', label: 'Daily', color: '#79b9a4' },
                    {
                      field: 'steps_rolling',
                      label: '7-day average',
                      color: '#79b9a4',
                      dash: '5 4',
                    },
                  ]}
                />
                <TrendChart
                  title="Sleep"
                  description="Hours per night"
                  rows={derived.chartLogs}
                  series={[
                    { field: 'sleep_hours', label: 'Sleep', color: '#88a9d4' },
                  ]}
                />
              </div>
              <WellbeingTrends
                logs={derived.currentLogs}
                daily={selectedDays === 7}
              />
            </section>

            <PhysicalProgress
              logs={derived.currentLogs}
              overview={derived.overview}
            />

            <section className="border-t border-white/10 py-8">
              <SectionTitle
                eyebrow="Wellbeing"
                title="How I've been feeling"
                detail="Rating distributions help distinguish a steady shift from a change driven by only a few days."
              />
              <div className="mt-6 grid gap-8 sm:grid-cols-2">
                <RatingDistribution
                  title="Mood"
                  distribution={derived.moodDistribution}
                />
                <RatingDistribution
                  title="Day rating"
                  distribution={derived.dayRatingDistribution}
                />
              </div>
            </section>

            <HabitOverview
              logs={derived.currentLogs}
              habits={derived.habitSummary}
            />
            <BehaviourInsights logs={derived.currentLogs} />
            <DashboardInsights insights={derived.insights} />
            <PeriodComparison
              comparisons={derived.comparisons}
              habitCurrent={derived.habitSummary.rate}
              currentRange={{
                start: derived.startDate,
                end: derived.endDate,
              }}
              previousRange={
                derived.bounds.previousStart
                  ? {
                      start: derived.bounds.previousStart,
                      end: derived.bounds.previousEnd,
                    }
                  : null
              }
              habitPrevious={
                selectedDays && derived.previousLogs.length
                  ? derived.previousHabitSummary.rate
                  : null
              }
            />
            {isYearView && <YearSummary summary={derived.yearSummary} />}
            <DevelopmentTimeline events={derived.events} />
            <ReflectionSection logs={derived.currentLogs} />
          </>
        )}
      </main>
    </div>
  )
}

function DashboardMessage({ children }) {
  return (
    <div className="min-h-screen bg-[#090b0f] px-5 py-16 text-[#f3f4f6]">
      <main className="mx-auto max-w-5xl">{children}</main>
    </div>
  )
}
