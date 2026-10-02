import React from 'react'
import {
  average,
  formatNumber,
  calculateWeeklyWorkouts,
  calculateWorkoutDistribution,
} from '../../../lib/personalDevelopmentDashboard'

function Bars({ items, maxValue }) {
  return (
    <div className="mt-5 flex h-24 items-end gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-0 flex-1 flex-col items-center gap-2"
        >
          <span className="text-[10px] tabular-nums text-slate-500">
            {item.known ? item.value : '—'}
          </span>
          <div className="flex h-14 w-full items-end">
            <div
              className="w-full bg-[var(--personalDevelopment)]/75"
              style={{
                height: item.known
                  ? `${Math.max(5, (item.value / Math.max(1, maxValue)) * 100)}%`
                  : '2px',
                opacity: item.known ? 1 : 0.2,
              }}
            />
          </div>
          <span className="text-[10px] text-slate-600">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function PhysicalProgress({ logs, overview }) {
  const weeks = calculateWeeklyWorkouts(logs).slice(-12)
  const weekdays = calculateWorkoutDistribution(logs)
  const maxWeek = Math.max(1, ...weeks.map((week) => week.workouts))
  const maxWeekday = Math.max(1, ...weekdays.map((day) => day.count))
  const knownWorkoutDays = logs.filter(
    (log) => typeof log.workout_completed === 'boolean'
  ).length
  const totalSteps = overview.totalSteps
  const durationLogs = logs.filter((log) => log.workout_completed === true)
  const averageWeight = average(logs.map((log) => log.weight_lb))
  const averageCalories = average(logs.map((log) => log.calories_kcal))
  const averageAlcohol = average(logs.map((log) => log.alcohol_units))
  const activities = [
    ['Reading', 'reading_completed'],
    ['Learning', 'learning_completed'],
    ['Family time', 'family_time'],
    ['Outdoors', 'outdoors'],
  ].map(([label, field]) => ({
    label,
    count: logs.filter((log) => log[field] === true).length,
    recorded: logs.filter((log) => typeof log[field] === 'boolean').length,
  }))

  return (
    <section className="border-t border-white/10 py-8">
      <div className="max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-600">
          Physical progress
        </p>
        <h2 className="mt-2 text-2xl font-semibold">
          The body, in the background
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Movement, recovery and nourishment alongside the rest of the picture.
        </p>
      </div>
      <div className="mt-7 grid gap-7 lg:grid-cols-[.9fr_1.1fr]">
        <div className="grid grid-cols-2 gap-x-7 gap-y-6 sm:grid-cols-3">
          <Stat
            label="Average steps"
            value={formatNumber(overview.averageSteps)}
            unit=" / day"
          />
          <Stat label="Total steps" value={formatNumber(totalSteps)} />
          <Stat
            label="Workouts"
            value={formatNumber(overview.workouts)}
            unit={` / ${knownWorkoutDays} logged days`}
          />
          <Stat
            label="Workout duration"
            value={formatNumber(overview.averageWorkoutMinutes, 0)}
            unit=" min avg"
          />
          <Stat
            label="Average sleep"
            value={formatNumber(overview.averageSleep, 1)}
            unit=" h"
          />
          <Stat
            label="Average water"
            value={formatNumber(overview.averageWater, 1)}
            unit=" L"
          />
          <Stat
            label="Average protein"
            value={formatNumber(overview.averageProtein, 0)}
            unit=" g"
          />
          <Stat
            label="Average calories"
            value={formatNumber(averageCalories)}
            unit=" kcal"
          />
          <Stat
            label="Average alcohol"
            value={formatNumber(averageAlcohol, 1)}
            unit=" units"
          />
          <Stat
            label="Average weight"
            value={formatNumber(averageWeight, 1)}
            unit=" lb"
          />
        </div>
        <div className="grid gap-7 sm:grid-cols-2">
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-semibold text-slate-300">
              Workout days by weekday
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Logged yes/no answers only
            </p>
            <Bars
              items={weekdays.map((day) => ({
                label: day.label,
                value: day.count,
                known: day.known > 0,
              }))}
              maxValue={maxWeekday}
            />
          </div>
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-semibold text-slate-300">
              Weekly workout rhythm
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Up to 12 calendar weeks
            </p>
            <Bars
              items={weeks.map((week) => ({
                label: new Date(`${week.start}T12:00:00`).toLocaleDateString(
                  'en-GB',
                  { day: 'numeric', month: 'short' }
                ),
                value: week.workouts,
                known: week.knownDays > 0,
              }))}
              maxValue={maxWeek}
            />
          </div>
        </div>
      </div>
      <div className="mt-7 grid gap-4 border-t border-white/[.06] pt-5 sm:grid-cols-2 lg:grid-cols-4">
        {activities.map((activity) => (
          <div
            key={activity.label}
            className="flex items-baseline justify-between gap-3"
          >
            <span className="text-xs text-slate-500">{activity.label}</span>
            <span className="text-sm tabular-nums text-slate-300">
              {activity.recorded
                ? `${activity.count} / ${activity.recorded} recorded`
                : '—'}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs text-slate-600">
        {durationLogs.length} workouts include duration data for an average of{' '}
        {formatNumber(
          average(durationLogs.map((log) => log.workout_minutes)),
          0
        )}{' '}
        minutes.
      </p>
    </section>
  )
}

function Stat({ label, value, unit = '' }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[.13em] text-slate-600">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-slate-100">
        {value}
        <span className="text-xs font-normal text-slate-600">{unit}</span>
      </p>
    </div>
  )
}
