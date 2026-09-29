import React from 'react'
import Header from '../components/Header'
import SectionHeading from '../components/SectionHeading'

export default function CVPage() {
  const roles = [
    {
      title: 'Senior Engineer',
      company: 'Skillcast',
      dates: 'May 2023 – Present',
      location: 'London',
      bullets: [
        'Designed and delivered a self-service customer journey, enabling users to register, select and purchase Skillcast products without requiring manual onboarding or sales support.',
        'Integrated Stripe to support secure online payments, connecting registration, product selection and payment into a streamlined end-to-end user experience.',
        'Worked across frontend and backend development to deliver new functionality within the existing portal, collaborating with product and business stakeholders to define requirements and improve the customer experience.',
      ],
    },
    {
      title: 'Lead Engineer',
      company: 'Unmind',
      dates: 'Mar 2020 – Mar 2023',
      location: 'London',
      bullets: [
        'Leading multiple engineering teams while supporting engineers’ personal career development and helping teams stay happy, healthy and motivated.',
        'Built three new teams around a data platform and client reporting dashboard, creating a centralised repository for business metrics.',
        'Worked across stakeholder management, hiring, onboarding, team moves, development metrics and ways of working.',
      ],
    },
    {
      title: 'Full Stack Engineer',
      company: 'Unmind',
      dates: 'Nov 2017 – Mar 2020',
      location: 'London',
      bullets: [
        'As the first engineer at Unmind, created the foundations of the company’s system architecture.',
        'Developed the REST API for the first versions of the app, then transferred it to GraphQL and shared knowledge with other developers.',
        'Helped modernise the platform using ReactJS during the post-funding rebrand.',
      ],
    },
    {
      title: 'Software Engineer – Contractor',
      company: 'MaisyWeb',
      dates: 'Apr 2015 – Oct 2017',
      location: 'Brighton',
      bullets: [
        'Built Polestar Payroll, a secure payroll platform using ColdFusion, SQL Server and JavaScript that processed payroll for over 10,000 personnel.',
        'Built the Innerplace website and backend CRM, integrating with Stripe, Trengo, Trello, Mailchimp and Mandrill.',
        'Built the Exec Secure website and management console using ColdFusion and MySQL, with Stripe, Mailchimp and Mandrill integrations.',
      ],
    },
    {
      title: 'Lead Software Engineer',
      company: 'Compare and Share',
      dates: 'Apr 2013 – Apr 2015',
      location: 'Brighton',
      bullets: [
        'Developed an aggregation platform working with over 30 parent APIs, allowing users to search over 3M records.',
        'Engineered the product from concept to MVP and finally to a fully operational platform.',
        'Worked with a data science agency on a dynamic search engine, reducing search speeds from a few seconds to under 0.5 seconds.',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'Tizuni',
      dates: 'Jan 2009 – Apr 2013',
      location: 'Brighton',
      bullets: [
        'Delivered multiple projects for clients including the NHS, BBC, Channel 4 and Courvoisier.',
        'Worked to tight agency deadlines, negotiating scope to deliver efficient solutions for the business.',
        'Built new features for an in-house CRM and liaised with clients, engineers and designers across multiple projects.',
      ],
    },
  ]

  const technologies = [
    'JavaScript',
    'React',
    'GraphQL',
    'RESTful web services',
    'AWS',
    'ColdFusion',
    'Mura CMS',
    'WordPress',
    'HTML',
    'CSS',
    'jQuery',
    'MySQL',
    'SQL Server',
    'Postgres',
    'TypeScript',
    'React Native',
  ]

  const highlights = [
    'First engineer at Unmind, creating the foundations of its system architecture.',
    'Built three new engineering teams around a data platform and client reporting dashboard.',
    'Developed a search platform spanning more than 30 APIs and over 3M records.',
    'Reduced search speeds to under 0.5 seconds through data and search-engine improvements.',
    'Built a payroll platform that processed payroll for over 10,000 personnel.',
    'Moved Unmind’s first REST API to GraphQL while sharing knowledge to upskill other developers.',
  ]

  return (
    <div className="min-h-screen bg-[#090b0f] text-[#f3f4f6]">
      <Header compact />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-32 sm:px-8">
        <section className="border-b border-white/10 pb-10">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.3em] text-[var(--engineering)]">
                Engineering / CV
              </p>
              <h1 className="mt-4 text-5xl font-semibold tracking-[-.04em] sm:text-6xl">
                James Privett
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-7 text-slate-400">
                Experienced Engineering Team Leader & Software Engineer.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                className="rounded-full bg-[var(--engineering)] px-5 py-3 text-sm font-semibold text-[#06111e] transition hover:-translate-y-0.5 hover:brightness-110"
                href="/James-Privett-CV.pdf"
                download="James-Privett-CV.pdf"
              >
                Download PDF ↓
              </a>
              <a
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold transition hover:border-white/30 hover:bg-white/5"
                href="/"
              >
                Back home
              </a>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <article className="rounded-2xl border border-white/10 bg-[#0e1218] p-7 sm:p-9">
            <SectionHeading
              eyebrow="01 / Work Experience"
              colour="var(--engineering)"
              title="A career built around software and people."
              text="From hands-on engineering to leading teams, my experience spans product architecture, full-stack development, delivery and engineering leadership."
            />
            <div className="mt-10 border-l border-[var(--engineering)]/30 pl-6 sm:pl-8">
              {roles.map((role, index) => (
                <div
                  key={`${role.company}-${role.title}`}
                  className={`relative ${index === roles.length - 1 ? '' : 'pb-10'}`}
                >
                  <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-[#0e1218] bg-[var(--engineering)] shadow-[0_0_0_3px_rgba(77,163,255,.12)]" />
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-lg font-semibold">{role.title}</h3>
                    <span className="text-sm text-[var(--engineering)]">
                      {role.company}
                    </span>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[.18em] text-slate-500">
                    {role.dates} · {role.location}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-400">
                    {role.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="relative pl-4 before:absolute before:left-0 before:top-[.7em] before:h-1 before:w-1 before:rounded-full before:bg-slate-600"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>

          <div className="grid content-start gap-5">
            <article className="rounded-2xl border border-white/10 bg-[#0e1218] p-7 sm:p-8">
              <SectionHeading
                eyebrow="02 / Key Technologies"
                colour="var(--engineering)"
                title="Tools I've worked with."
                text="Technologies and platforms listed in my CV, spanning application development, cloud services and databases."
              />
              <div className="mt-7 flex flex-wrap gap-2">
                {technologies.map((technology) => (
                  <span
                    key={technology}
                    className="rounded-full border border-[var(--engineering)]/15 bg-[var(--engineering)]/8 px-3 py-2 text-xs font-medium text-slate-300"
                  >
                    {technology}
                  </span>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#0e1218] p-7 sm:p-8">
              <SectionHeading
                eyebrow="03 / Career Highlights"
                colour="var(--engineering)"
                title="A few things I'm proud of."
                text="Selected outcomes from my engineering career."
              />
              <ul className="mt-7 space-y-4">
                {highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex gap-3 text-sm leading-6 text-slate-400"
                  >
                    <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--engineering)]/15 text-xs text-[var(--engineering)]">
                      ✓
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="mt-5 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-[#0e1218] p-7 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.25em] text-[var(--engineering)]">
              Leadership
            </p>
            <h2 className="mt-4 text-2xl font-semibold">
              People, development & teams
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              People management, people development, coaching, mentoring,
              effective communication, emotional intelligence, delegation skills
              and agile methodologies.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[#0e1218] p-7 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.25em] text-[var(--engineering)]">
              Learning & experimenting
            </p>
            <h2 className="mt-4 text-2xl font-semibold">What's next</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              TypeScript, React Native, product management, blockchain and
              machine learning are listed among my areas of learning, interests
              and experimentation.
            </p>
          </article>
        </section>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
          <p className="text-sm text-slate-500">Full CV available as a PDF.</p>
          <a
            className="rounded-full border border-[var(--engineering)]/30 px-5 py-3 text-sm font-semibold text-[var(--engineering)] transition hover:bg-[var(--engineering)]/10"
            href="/James-Privett-CV.pdf"
            download="James-Privett-CV.pdf"
          >
            Download James Privett CV ↓
          </a>
        </div>
      </main>
    </div>
  )
}
