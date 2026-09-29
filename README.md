# jamesprivett.co.uk

Initial personal site for James Privett.

## Stack

- React
- Vite
- Tailwind CSS v4
- Lucide React icons

## Run locally

Requires Node.js 20.19+ (or a newer supported Node release).

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Contact form email

The contact form sends messages through the Supabase `contact` Edge Function
and Resend. The Resend API key is stored as a Supabase secret, not in the
frontend.

1. Verify a sending domain in Resend and create an API key.
2. Set the function secrets in the linked Supabase project:

   ```bash
   supabase secrets set RESEND_API_KEY=re_... RESEND_FROM="James Privett <website@your-verified-domain>"
   ```

   `RESEND_FROM` must use an address on the domain verified with Resend.

3. Link the Supabase CLI to the same project used by the website, then apply
   the database migration:

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
   the visitor. The admin inbox is available at `/admin/contact-emails` after
   signing in.

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

## Next steps

1. Replace the placeholder project content with real projects.
2. Add GitHub/LinkedIn URLs.
3. Add the final portrait/photo treatment.
4. Connect the repo to Cloudflare Pages.
5. Add routing and the database-backed training journal.
