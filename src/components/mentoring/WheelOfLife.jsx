import React from 'react'

const areas = [
  { name: 'Health', color: '#fb7185' },
  { name: 'Relationships', color: '#f97316' },
  { name: 'Career', color: '#facc15' },
  { name: 'Finances', color: '#a3e635' },
  { name: 'Personal growth', color: '#2dd4bf' },
  { name: 'Fun & recreation', color: '#38bdf8' },
  { name: 'Home environment', color: '#818cf8' },
  { name: 'Purpose', color: '#e879f9' },
]

const initialRatings = areas.map(() => 5)
const center = 200
const maxRadius = 165

function pointAt(angle, radius) {
  const radians = (angle * Math.PI) / 180
  return {
    x: center + Math.cos(radians) * radius,
    y: center + Math.sin(radians) * radius,
  }
}

function areaWedge(index, rating) {
  const middle = -90 + index * 45
  const radius = (rating / 10) * maxRadius
  const start = pointAt(middle - 22.5, radius)
  const end = pointAt(middle + 22.5, radius)
  return `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y} Z`
}

export default function WheelOfLife() {
  const [ratings, setRatings] = React.useState(initialRatings)
  const [reflection, setReflection] = React.useState('')

  const average = ratings.reduce((total, rating) => total + rating, 0) / areas.length
  const wheelPoints = ratings
    .map((rating, index) => {
      const point = pointAt(-90 + index * 45, (rating / 10) * maxRadius)
      return `${point.x},${point.y}`
    })
    .join(' ')

  function updateRating(index, value) {
    setRatings((current) => current.map((rating, position) => (
      position === index ? Number(value) : rating
    )))
  }

  function resetWheel() {
    setRatings(initialRatings)
    setReflection('')
  }

  return (
    <section aria-labelledby="wheel-title" className="py-5 sm:py-7">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--mentoring)]">
            Personal reflection
          </p>
          <h2 id="wheel-title" className="mt-1 text-2xl font-semibold text-white">
            Wheel of Life
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-5 text-slate-400">
            Rate how satisfied you feel in each area right now. There are no right answers.
          </p>
        </div>
        <button
          type="button"
          onClick={resetWheel}
          className="rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-400 transition hover:border-white/30 hover:text-white"
        >
          Reset ratings
        </button>
      </div>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)] lg:gap-10">
        <div className="space-y-5">
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {areas.map((area, index) => (
              <label key={area.name} className="block min-w-0">
                <span className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2.5 text-slate-300">
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: area.color }}
                    />
                    <span className="truncate">{area.name}</span>
                  </span>
                  <span className="min-w-7 text-right font-semibold tabular-nums text-white">
                    {ratings[index]}
                  </span>
                </span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={ratings[index]}
                  aria-label={`${area.name} satisfaction, ${ratings[index]} out of 10`}
                  onChange={(event) => updateRating(index, event.target.value)}
                  className="mt-2.5 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--mentoring)]"
                  style={{ accentColor: area.color }}
                />
                <span className="mt-1 flex justify-between text-[10px] text-slate-600">
                  <span>Low</span>
                  <span>High</span>
                </span>
              </label>
            ))}
          </div>

          <label className="block border-t border-white/10 pt-5">
            <span className="text-sm font-medium text-slate-300">One area I’d like to focus on</span>
            <textarea
              rows={3}
              maxLength={500}
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              placeholder="What small change could make a difference?"
              className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-[#10141a] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-[var(--mentoring)]/60"
            />
            <span className="mt-1 block text-right text-[10px] tabular-nums text-slate-600">
              {reflection.length}/500
            </span>
          </label>
        </div>

        <div className="mx-auto w-full max-w-[620px] lg:sticky lg:top-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Your snapshot</p>
              <p className="mt-1 text-sm text-slate-300">Current balance</p>
            </div>
            <p className="text-right text-sm font-semibold tabular-nums text-white">
              {average.toFixed(1)}<span className="font-normal text-slate-500"> / 10</span>
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#0e1218] p-3 sm:p-5">
            <svg
              viewBox="0 0 400 400"
              role="img"
              aria-label={`Wheel of Life chart. Average rating ${average.toFixed(1)} out of 10.`}
              className="mx-auto block aspect-square w-full max-w-[560px]"
            >
              <defs>
                <radialGradient id="wheel-center-glow">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>

              {areas.map((area, index) => (
                <path
                  key={`wedge-${area.name}`}
                  d={areaWedge(index, ratings[index])}
                  fill={area.color}
                  fillOpacity="0.22"
                  stroke={area.color}
                  strokeOpacity="0.5"
                  strokeWidth="1"
                />
              ))}

              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <circle
                  key={`ring-${level}`}
                  cx={center}
                  cy={center}
                  r={(level / 10) * maxRadius}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity={level % 2 === 0 ? '0.16' : '0.08'}
                  strokeWidth="1"
                />
              ))}

              {areas.map((area, index) => {
                const endpoint = pointAt(-90 + index * 45, maxRadius)
                return (
                  <line
                    key={`axis-${area.name}`}
                    x1={center}
                    y1={center}
                    x2={endpoint.x}
                    y2={endpoint.y}
                    stroke="#ffffff"
                    strokeOpacity="0.24"
                    strokeWidth="1"
                  />
                )
              })}

              <polygon
                points={wheelPoints}
                fill="#ffffff"
                fillOpacity="0.16"
                stroke="#ffffff"
                strokeOpacity="0.95"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {ratings.map((rating, index) => {
                const dot = pointAt(-90 + index * 45, (rating / 10) * maxRadius)
                return (
                  <circle
                    key={`point-${areas[index].name}`}
                    cx={dot.x}
                    cy={dot.y}
                    r="4"
                    fill={areas[index].color}
                    stroke="#090b0f"
                    strokeWidth="2"
                  />
                )
              })}

              <circle cx={center} cy={center} r="30" fill="url(#wheel-center-glow)" />
              <circle cx={center} cy={center} r="3" fill="#ffffff" fillOpacity="0.75" />
            </svg>

            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/10 pt-4 sm:grid-cols-4">
              {areas.map((area, index) => (
                <div key={`legend-${area.name}`} className="flex min-w-0 items-center gap-2 text-[11px] text-slate-400">
                  <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: area.color }} />
                  <span className="truncate">{area.name}</span>
                  <span className="ml-auto tabular-nums text-slate-200">{ratings[index]}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-slate-600">
            Prototype only · This snapshot is not saved and will reset when you leave or refresh.
          </p>
        </div>
      </div>
    </section>
  )
}
