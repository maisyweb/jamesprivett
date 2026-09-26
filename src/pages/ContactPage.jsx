import React from 'react'
import Header from '../components/Header'
import Arrow from '../components/Arrow'

const contactEmail = 'james@jamesprivett.co.uk'

export default function ContactPage() {
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      '',
      form.message,
    ].join('\n')

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(
      form.subject
    )}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <Header compact />

      <main className="pt-20">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="grid-bg absolute inset-0 opacity-60" />
          <div className="hero-glow absolute inset-0 opacity-70" />

          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--engineering)]">
              Contact
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-.045em] sm:text-6xl lg:text-7xl">
              Have something worth talking about?
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
              Whether it is a software problem, a mentoring conversation, or an
              idea you want to explore, send me a note and I&apos;ll get back to
              you as soon as I can.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.75fr_1.25fr] lg:gap-20 lg:py-28">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--mentoring)]">
                Start a conversation
              </p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
                Tell me what&apos;s on your mind.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-400">
                I&apos;m especially interested in conversations about
                engineering, leadership, mentoring and building useful things.
              </p>

              <div className="mt-10 border-t border-white/10 pt-6">
                <p className="text-xs font-bold uppercase tracking-[.25em] text-slate-600">
                  Prefer email?
                </p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="mt-3 inline-flex items-center gap-2 text-lg font-medium text-[var(--engineering)] transition hover:text-white"
                >
                  {contactEmail} <Arrow />
                </a>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 bg-[#0e1218] p-6 sm:p-8"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-semibold text-slate-300"
                  >
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-[var(--engineering)]/60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-semibold text-slate-300"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-[var(--engineering)]/60"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="contact-subject"
                  className="block text-sm font-semibold text-slate-300"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-[var(--engineering)]/60"
                />
              </div>

              <div className="mt-6">
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-semibold text-slate-300"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows="7"
                  className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-[var(--engineering)]/60"
                />
              </div>

              <button
                type="submit"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--engineering)] px-5 py-3 text-sm font-semibold text-[#06111e] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                Open email <Arrow />
              </button>
              <p className="mt-4 text-xs leading-5 text-slate-600">
                This will open your default email app with the message ready to
                send.
              </p>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}
