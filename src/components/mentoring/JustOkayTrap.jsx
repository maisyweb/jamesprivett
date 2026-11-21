import React from 'react'

const questions = [
  {
    id: 'settling',
    title: 'What am I settling for?',
    prompt: 'Where have I accepted “good enough” without consciously deciding that it is enough?',
  },
  {
    id: 'capability',
    title: 'What am I capable of?',
    prompt: 'What could I realistically achieve with sustained effort over the next year?',
  },
  {
    id: 'postponing',
    title: 'What am I postponing?',
    prompt: 'What do I keep telling myself I will do someday?',
  },
  {
    id: 'cost',
    title: 'What is the cost of doing nothing?',
    prompt: 'If life stays exactly as it is for three years, what might I regret?',
  },
  {
    id: 'today',
    title: 'What can I do today?',
    prompt: 'What small, meaningful action would move me in the right direction?',
  },
]

const scoreBands = [
  {
    max: 25,
    title: 'Mostly on autopilot',
    description: 'Some parts of life may feel comfortable enough that your own priorities are easy to put off.',
    color: '#fb7185',
  },
  {
    max: 50,
    title: 'Starting to notice',
    description: 'You may be seeing a gap between what feels familiar and what feels genuinely fulfilling.',
    color: '#fbbf24',
  },
  {
    max: 75,
    title: 'Choosing more deliberately',
    description: 'You are making room to question old routines and move toward what matters to you.',
    color: '#2dd4bf',
  },
  {
    max: 100,
    title: 'Building with intention',
    description: 'Your choices feel connected to the life you want, while still leaving room for acceptance and rest.',
    color: '#a3e635',
  },
]

const responseFieldClass =
  'mt-3 w-full resize-y rounded-lg border border-white/10 bg-[#10141a] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-[var(--mentoring)]/60'

export default function JustOkayTrap() {
  const [score, setScore] = React.useState(50)
  const [responses, setResponses] = React.useState({})
  const band = scoreBands.find((item) => score <= item.max)
  const gradientPosition = `${score}%`

  function updateResponse(id, value) {
    setResponses((current) => ({ ...current, [id]: value }))
  }

  function resetReflection() {
    setScore(50)
    setResponses({})
  }

  return (
    <section aria-labelledby="just-okay-title" className="py-5 sm:py-7">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--mentoring)]">
            Personal reflection
          </p>
          <h2 id="just-okay-title" className="mt-1 text-2xl font-semibold text-white">
            The “Just Okay” Trap
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-400">
            You can appreciate the life you have and still ask whether you are deliberately building the life you want.
          </p>
        </div>
        <button
          type="button"
          onClick={resetReflection}
          className="rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-400 transition hover:border-white/30 hover:text-white"
        >
          Reset reflection
        </button>
      </div>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="rounded-xl border border-white/10 bg-[#0e1218] p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">
                Your current sense
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">How deliberately am I building?</h3>
            </div>
            <p className="shrink-0 text-right text-4xl font-semibold tabular-nums text-white">
              {score}<span className="ml-1 text-base font-normal text-slate-500">/100</span>
            </p>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-400">
            Move the marker to what feels true today. This is a prompt for reflection, not a test or a measure of your worth.
          </p>

          <label htmlFor="just-okay-score" className="sr-only">
            How deliberately you are building a fulfilling life, from 1 to 100
          </label>
          <input
            id="just-okay-score"
            type="range"
            min="1"
            max="100"
            step="1"
            value={score}
            onChange={(event) => setScore(Number(event.target.value))}
            aria-valuetext={`${score} out of 100: ${band.title}`}
            className="just-okay-range mt-7 h-3 w-full cursor-pointer appearance-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0e1218]"
            style={{
              '--score-position': gradientPosition,
              accentColor: band.color,
              background:
                'linear-gradient(90deg, #fb7185 0%, #fbbf24 35%, #2dd4bf 70%, #a3e635 100%)',
            }}
          />
          <div className="mt-2 flex justify-between gap-4 text-xs text-slate-500">
            <span className="max-w-[42%]">Comfortable, mostly on autopilot</span>
            <span className="max-w-[42%] text-right">Deliberately building what matters</span>
          </div>

          <div
            aria-live="polite"
            className="mt-7 border-l-2 pl-4"
            style={{ borderColor: band.color }}
          >
            <p className="text-sm font-semibold" style={{ color: band.color }}>
              {band.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {band.description}
            </p>
          </div>

          <div className="mt-7 border-t border-white/10 pt-5">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">A useful reminder</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              This is not about being dissatisfied all the time or chasing achievement. Acceptance and ambition can sit side by side.
            </p>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Take it a little deeper</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Five questions</h3>
            <p className="mt-1 text-sm text-slate-400">Open any prompt that feels useful. You do not need to answer them all.</p>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {questions.map((question, index) => (
              <details key={question.id} className="group py-3">
                <summary className="flex cursor-pointer list-none items-center gap-3 py-1 text-sm font-medium text-slate-200 marker:hidden">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/10 text-[11px] tabular-nums text-slate-500">
                    {index + 1}
                  </span>
                  <span className="flex-1">{question.title}</span>
                  <span aria-hidden="true" className="text-lg leading-none text-slate-500 transition group-open:rotate-45">+</span>
                </summary>
                <div className="pl-10 pr-1 pt-2">
                  <p className="text-sm leading-5 text-slate-400">{question.prompt}</p>
                  <label className="sr-only" htmlFor={`reflection-${question.id}`}>
                    Your response: {question.title}
                  </label>
                  <textarea
                    id={`reflection-${question.id}`}
                    rows={3}
                    maxLength={1000}
                    value={responses[question.id] || ''}
                    onChange={(event) => updateResponse(question.id, event.target.value)}
                    placeholder="Write a few thoughts…"
                    className={responseFieldClass}
                  />
                </div>
              </details>
            ))}
          </div>

          <p className="mt-4 text-center text-[11px] text-slate-600">
            Prototype only · Your score and notes are not saved and will reset when you leave or refresh.
          </p>
        </div>
      </div>
    </section>
  )
}
