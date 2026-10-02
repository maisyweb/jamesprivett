import React from 'react'
import {
  formatDate,
  formatNumber,
  numericValue,
} from '../../../lib/personalDevelopmentDashboard'

export default function TrendChart({
  title,
  description,
  rows,
  series,
  emptyMessage,
  rolling = false,
  domain,
  axisTicks,
}) {
  const width = 740
  const height = 230
  const left = 46
  const right = 12
  const top = 18
  const bottom = 32
  const plotWidth = width - left - right
  const plotHeight = height - top - bottom
  const values = series.flatMap((item) =>
    rows
      .map((row) => numericValue(row[item.field]))
      .filter((value) => value !== null)
  )

  if (!values.length) {
    return (
      <section className="border-t border-white/10 pt-5">
        <h3 className="text-base font-semibold text-slate-200">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-slate-600">{description}</p>
        )}
        <p className="grid h-52 place-items-center text-sm text-slate-600">
          {emptyMessage || 'No recorded values in this period.'}
        </p>
      </section>
    )
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad =
    max === min ? Math.max(Math.abs(max) * 0.1, 1) : (max - min) * 0.12
  const minAxis = domain?.[0] ?? min - pad
  const maxAxis = domain?.[1] ?? max + pad
  const ticks =
    axisTicks ||
    Array.from(
      { length: 4 },
      (_, index) => maxAxis - ((maxAxis - minAxis) / 3) * index
    )
  const firstTime = new Date(`${rows[0].log_date}T12:00:00`).getTime()
  const lastTime = new Date(
    `${rows[rows.length - 1].log_date}T12:00:00`
  ).getTime()
  const points = series.map((item) => {
    const pointsForSeries = rows.flatMap((row, index) => {
      const value = numericValue(row[item.field])
      if (value === null) return []
      const time = new Date(`${row.log_date}T12:00:00`).getTime()
      return [
        {
          x:
            firstTime === lastTime
              ? left + plotWidth / 2
              : left +
                ((time - firstTime) / (lastTime - firstTime)) * plotWidth,
          y: top + ((maxAxis - value) / (maxAxis - minAxis)) * plotHeight,
          value,
          date: row.log_date,
        },
      ]
    })
    return { ...item, points: pointsForSeries }
  })
  const axisValue = (step) => maxAxis - ((maxAxis - minAxis) / 3) * step
  const dateLabels =
    firstTime === lastTime
      ? [{ x: left + plotWidth / 2, text: formatDate(rows[0].log_date) }]
      : [
          { x: left, text: formatDate(rows[0].log_date) },
          {
            x: left + plotWidth / 2,
            text: formatDate(
              new Date((firstTime + lastTime) / 2).toISOString().slice(0, 10)
            ),
          },
          {
            x: left + plotWidth,
            text: formatDate(rows[rows.length - 1].log_date),
          },
        ]

  return (
    <section className="min-w-0 border-t border-white/10 pt-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-200">{title}</h3>
          {description && (
            <p className="mt-1 text-xs text-slate-600">{description}</p>
          )}
        </div>
        <div
          className="flex flex-wrap gap-x-4 gap-y-2"
          aria-label={`${title} legend`}
        >
          {series.map((item) => (
            <span
              key={item.field}
              className="inline-flex items-center gap-2 text-[11px] text-slate-400"
            >
              <i
                className="h-0.5 w-4"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`${title}. ${rows.length} daily records.`}
          className="h-52 w-full overflow-visible sm:h-60"
        >
          {ticks.map((value) => {
            const y =
              top + ((maxAxis - value) / (maxAxis - minAxis)) * plotHeight
            return (
              <g key={value}>
                <line
                  x1={left}
                  x2={width - right}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,.09)"
                  strokeDasharray="3 5"
                />
                <text
                  x={left - 7}
                  y={y + 3}
                  textAnchor="end"
                  fill="#77808e"
                  fontSize="10"
                >
                  {formatNumber(value, 0)}
                </text>
              </g>
            )
          })}
          {points.map((item) => {
            const path = item.points
              .map(
                (point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`
              )
              .join(' ')
            return (
              <g key={item.field}>
                <path
                  d={path}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={rolling ? 2.6 : 2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={item.dash || undefined}
                />
                {item.points.map((point) => (
                  <circle
                    key={`${item.field}-${point.date}`}
                    cx={point.x}
                    cy={point.y}
                    r="2.5"
                    fill={item.color}
                  >
                    <title>{`${item.label}: ${formatNumber(point.value, 1)} on ${formatDate(point.date, { day: 'numeric', month: 'short', year: 'numeric' })}`}</title>
                  </circle>
                ))}
              </g>
            )
          })}
          {dateLabels.map((label) => (
            <text
              key={`${label.x}-${label.text}`}
              x={label.x}
              y={height - 6}
              fill="#77808e"
              fontSize="10"
              textAnchor={
                label.x === left
                  ? 'start'
                  : label.x === left + plotWidth
                    ? 'end'
                    : 'middle'
              }
            >
              {label.text}
            </text>
          ))}
        </svg>
      </div>
      <p className="sr-only">
        Chart vertical axis runs from {formatNumber(minAxis, 1)} to{' '}
        {formatNumber(maxAxis, 1)} and does not start at zero.
      </p>
    </section>
  )
}
