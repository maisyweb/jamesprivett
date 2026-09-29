import React from 'react'
import Header from '../components/Header'
import Arrow from '../components/Arrow'
import SiteFooter from '../components/SiteFooter'
import { supabase } from '../lib/supabase'

const contactEmail = 'hello@jamesprivett.co.uk'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitMessage, setSubmitMessage] = React.useState('')
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  function handleChange(event) {
    const { name, value } = event.target
    event.currentTarget.setCustomValidity('')
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formElement = event.currentTarget
    const fields = [
      ['name', 'Name'],
      ['email', 'Email'],
      ['subject', 'Subject'],
      ['message', 'Message'],
    ]
    const emptyField = fields.find(([fieldName]) => !form[fieldName].trim())

    if (emptyField) {
      const [fieldName, label] = emptyField
      const field = formElement.elements.namedItem(fieldName)
      field.setCustomValidity(`${label} cannot be blank.`)
      field.reportValidity()
      return
    }

    const cleanedForm = Object.fromEntries(
      Object.entries(form).map(([fieldName, value]) => [
        fieldName,
        value.trim(),
      ])
    )
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const { data, error } = await supabase.functions.invoke('contact', {
        body: cleanedForm,
      })

      if (error) {
        const response = error.context
        const responseBody =
          response instanceof Response
            ? await response
                .clone()
                .json()
                .catch(() => null)
            : null
        throw new Error(
          typeof responseBody?.error === 'string'
            ? responseBody.error
            : 'Your message could not be sent.'
        )
      }

      if (typeof data?.recordId !== 'string') {
        setSubmitMessage(
          'The email service did not confirm that your message was stored. It may have been sent, so please do not submit it again yet. Contact me directly by email.'
        )
        return
      }

      setSubmitMessage(
        "Thanks for getting in touch. I'll reply as soon as I can."
      )
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setSubmitMessage(
        `${error.message} Please try again or email me directly.`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <Header compact />

      <main className="pt-20">
        <section className="relative overflow-hidden border-b border-white/10">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('contact-hero.png')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#080b10] via-[#080b10]/90 to-[#080b10]/20" />
          <div className="absolute inset-0 bg-[#080b10]/10" />

          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--engineering)]">
                Contact
              </p>

              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-.045em] sm:text-6xl lg:text-7xl">
                Have something worth talking about?
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
                Whether it is a software problem, a mentoring conversation, or
                an idea you want to explore, send me a note and I&apos;ll get
                back to you as soon as I can.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.75fr_1.25fr] lg:gap-20 lg:py-28">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--engineering)]">
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
                    maxLength={120}
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
                    maxLength={254}
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
                  maxLength={200}
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
                  maxLength={10000}
                  required
                  rows="7"
                  className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#090b0f] px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-[var(--engineering)]/60"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--engineering)] px-5 py-3 text-sm font-semibold text-[#06111e] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                {isSubmitting ? 'Sending...' : 'Send message'}{' '}
                {!isSubmitting && <Arrow />}
              </button>
              {submitMessage && (
                <p
                  className="mt-4 text-sm leading-6 text-slate-300"
                  role="status"
                  aria-live="polite"
                >
                  {submitMessage}
                </p>
              )}
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
