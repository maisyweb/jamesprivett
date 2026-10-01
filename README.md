# jamesprivett.co.uk

Personal website and article publishing app for James Privett.

## Stack

- React
- Vite
- Tailwind CSS v4
- Supabase (database, authentication, storage, and Edge Functions)
- React Markdown

## Prerequisites

Requires Node.js 20.19+ (or a newer supported Node release). Supabase-backed
features also require a Supabase project. The contact form email feature
requires the Supabase CLI and a Resend account.

## Configure Supabase

Create or select a Supabase project, then copy its project URL and publishable
key from the project API settings into a local `.env.local` file:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Vite embeds `VITE_` variables into the browser build. The publishable key is
designed for client use; never put a Supabase service-role key or Resend API key
in this file. Restart the dev server after changing environment variables.

The app expects these Supabase tables: `articles`, `article_tags`, `tags`,
`article_ideas`, `personal_metrics`, and `personal_mood`. This repository does
not currently include migrations for those tables, so they must already exist
in the selected project with appropriate Row Level Security (RLS) policies.
Only the `contact_emails` table is created by a migration in this repository;
see [Contact form email](#contact-form-email).

Article image uploads expect a Storage bucket named `article-images`. Configure
the bucket and its upload/read policies in Supabase Storage before using image
uploads in the article editor.

The admin sign-in uses Supabase email/password authentication. Create or invite
the intended admin user in the Supabase dashboard. The UI sign-in is not a
database security boundary: protect reads and writes with RLS policies, and
grant access only to trusted users. In particular, do not rely on hiding an
admin URL to protect data.

## Run locally

Install dependencies and start Vite:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. The public pages can render without a working
Supabase project, but database-backed pages and contact submission require the
environment variables above and the corresponding Supabase schema.

Routes are selected from `window.location.pathname` in the app. Vite serves
the application for local deep links automatically. For deployment to another
static host, configure a fallback so application routes serve `index.html`.

## Contact form email

The contact form sends messages through the Supabase `contact` Edge Function
and Resend. The Resend API key is stored as a Supabase secret, not in the
frontend.

1. Verify a sending domain in Resend and create an API key.
2. Install and authenticate the Supabase CLI, then link it to the same project
   used by the website. Set the function secrets:

   ```bash
   supabase secrets set RESEND_API_KEY=re_... RESEND_FROM="James Privett <website@your-verified-domain>"
   ```

   `RESEND_FROM` must use an address on the domain verified with Resend.

3. Apply the tracked database migration:

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

4. Deploy the updated function:

   ```bash
   supabase functions deploy contact --no-verify-jwt
   ```

5. Build and deploy the site with `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_PUBLISHABLE_KEY` set to that same project. The function sends
   to `hello@jamesprivett.co.uk`; replies to the notification go directly to
   the visitor. The admin inbox is available at `/admin/contact-emails` to
   authenticated users, subject to the table's RLS policies.

The contact form only confirms success when the function returns a saved record
ID. If the function has not been redeployed, the form warns that the message may
have been sent but was not confirmed as stored. Messages submitted before the
table and updated function were deployed are not added retroactively.

The contact function is publicly callable by design. Its input is validated,
but add CAPTCHA and/or rate limiting if the endpoint starts receiving spam.

## Build

```bash
npm run build
npm run preview
```

For Cloudflare Pages, use `npm run build` as the build command and `dist` as
the output directory. Set the two `VITE_` variables in the Pages project before
building; these values are compiled into the deployed frontend. Cloudflare
Pages serves the SPA entry point for unmatched routes when no top-level
`404.html` is present. Other static hosts need an equivalent `index.html`
fallback for paths such as `/articles/example` and `/admin/articles`.
