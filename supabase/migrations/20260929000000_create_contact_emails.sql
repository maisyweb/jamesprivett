create table if not exists public.contact_emails (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  sender_email text not null check (char_length(sender_email) between 1 and 254),
  subject text not null check (char_length(subject) between 1 and 200),
  message text not null check (char_length(message) between 1 and 10000),
  delivery_status text not null default 'pending'
    check (delivery_status in ('pending', 'sent', 'failed')),
  resend_id text,
  created_at timestamptz not null default now()
);

create index if not exists contact_emails_created_at_idx
  on public.contact_emails (created_at desc);

alter table public.contact_emails enable row level security;

revoke all on table public.contact_emails from anon, authenticated;
grant select, delete on table public.contact_emails to authenticated;
grant all on table public.contact_emails to service_role;

create policy "Authenticated users can view contact emails"
  on public.contact_emails
  for select
  to authenticated
  using (true);

create policy "Authenticated users can delete contact emails"
  on public.contact_emails
  for delete
  to authenticated
  using (true);