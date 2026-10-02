import React from 'react'
import {
  formatDate,
  formatNumber,
  shiftDate,
} from '../../../lib/personalDevelopmentDashboard'

function HabitHeatmap({ logs, habits, startDate, endDate }) {
  const mapStart = startDate || (endDate ? shiftDate(endDate, -89) : null)
  const mapEnd = endDate || logs[logs.length - 1]?.log_date
  const firstDate =
    mapStart && mapEnd && mapStart < shiftDate(mapEnd, -364)
      ? shiftDate(mapEnd, -364)
      : mapStart
  const dateCells = []
  if (firstDate && mapEnd) {
    for (let date = firstDate; date <= mapEnd; date = shiftDate(date, 1))
      dateCells.push(date)
  }
  const leadingBlanks = dateCells.length
    ? (new Date(`${dateCells[0]}T12:00:00`).getDay() + 6) % 7
    : 0
  const paddedDates = [...Array(leadingBlanks).fill(null), ...dateCells]
  const weeks = []
  for (let index = 0; index < paddedDates.length; index += 7)
    weeks.push(paddedDates.slice(index, index + 7))
  const logsByDate = new Map(logs.map((log) => [log.log_date, log]))
  const records = new Map(
    habits.relevantRecords.map((record) => [
      `${record.daily_log_id}:${record.habit_id}`,
      record,
    ])
  )
  const dayStats = new Map(habits.daily.map((day) => [day.logId, day]))
  const activeCount = habits.activeDefinitions.length

  return (
    <div className="mt-5 overflow-x-auto pb-2">
      <div className="min-w-[560px]">
        <div
          className="grid grid-flow-col grid-rows-7 gap-1"
          style={{
            gridTemplateColumns: `repeat(${Math.max(1, weeks.length)}, minmax(0, 1fr))`,
          }}
        >
          {weeks.flatMap((week, index) =>
            Array.from({ length: 7 }, (_, dayIndex) => {
              const date = week[dayIndex]
              if (!date) return <span key={`blank-${index}-${dayIndex}`} />
              const log = logsByDate.get(date)
              const stat = log
                ? dayStats.get(log.id) || { completed: 0, tracked: 0 }
                : { completed: 0, tracked: 0 }
              const rate = stat.tracked ? stat.completed / stat.tracked : null
              const tone =
                !log || rate === null
                  ? 'bg-white/[.04]'
                  : rate >= 0.75
                    ? 'bg-[var(--personalDevelopment)]'
                    : rate >= 0.5
                      ? 'bg-[var(--personalDevelopment)]/70'
                      : rate > 0
                        ? 'bg-[var(--personalDevelopment)]/35'
                        : 'bg-white/10'
              const description = !log
                ? 'no daily log'
                : rate === null
                  ? 'no habit checks recorded'
                  : `${Math.round(rate * 100)}% of recorded checks completed`
              return (
                <span
                  key={date}
                  title={`${formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' })} · ${stat.completed}/${stat.tracked} habits completed · ${description} · ${activeCount} active habits`}
                  aria-label={`${formatDate(date)}: ${stat.completed} of ${stat.tracked} recorded habits completed; ${description}`}
                  className={`aspect-square max-h-4 min-h-3 rounded-[2px] ${tone}`}
                />
              )
            })
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-600">
          <span>Less</span>
          <span className="flex items-center gap-1">
            <i className="h-3 w-3 rounded-[2px] bg-white/[.04]" />
            <i className="h-3 w-3 rounded-[2px] bg-[var(--personalDevelopment)]/35" />
            <i className="h-3 w-3 rounded-[2px] bg-[var(--personalDevelopment)]/70" />
            <i className="h-3 w-3 rounded-[2px] bg-[var(--personalDevelopment)]" />
          </span>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}

export default function HabitOverview({ logs, habits, startDate, endDate }) {
  return (
    <section className="border-t border-white/10 py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-600">
            Habits
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Small actions, repeated
          </h2>
        </div>
        <p className="text-xs text-slate-600">
          Rates use only explicit completion records
        </p>
      </div>
      {!habits.activeDefinitions.length ? (
        <p className="mt-6 text-sm text-slate-500">
          No active habits have been defined.
        </p>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="divide-y divide-white/[.06]">
            {habits.perHabit.map((habit) => (
              <article key={habit.id} className="py-4 first:pt-0">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-sm font-medium text-slate-200">
                    {habit.name}
                  </h3>
                  <span className="text-xl font-semibold tabular-nums text-[var(--personalDevelopment)]">
                    {habit.rate === null ? '—' : `${Math.round(habit.rate)}%`}
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-white/[.06]">
                  <div
                    className="h-full bg-[var(--personalDevelopment)]"
                    style={{ width: `${habit.rate || 0}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  {habit.completedDays} completed · {habit.trackedDays} days
                  recorded
                  {logs.length ? ` · ${logs.length} days logged in period` : ''}
                </p>
              </article>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-semibold text-slate-300">
              Daily habit rhythm
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Each square uses the proportion of explicitly recorded habits
              completed that day.
            </p>
            <HabitHeatmap
              logs={logs}
              habits={habits}
              startDate={startDate}
              endDate={endDate}
            />
            <p className="mt-2 text-xs text-slate-600">
              Across this period: {formatNumber(habits.completedRecords)}{' '}
              completed of {formatNumber(habits.trackedRecords)} recorded habit
              checks.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
