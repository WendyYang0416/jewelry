-- ============================================================================
-- 0002 — Inquiries table (customer inquiry form submissions)
-- Run in Supabase SQL Editor (after 0001_init.sql)
-- ============================================================================

create table if not exists public.inquiries (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid references public.products (id) on delete set null,
  sku         text,                            -- snapshot of SKU at submit time
  name        text not null,                   -- customer name
  contact     text not null,                   -- email or WhatsApp number
  message     text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists inquiries_created_idx
  on public.inquiries (created_at desc);

-- RLS: anonymous visitors may submit (insert only); admins may read/update/delete
alter table public.inquiries enable row level security;

create policy if not exists "public submit inquiry"
  on public.inquiries for insert
  with check (true);

create policy if not exists "admin read inquiries"
  on public.inquiries for select
  using (auth.role() = 'authenticated');

create policy if not exists "admin update inquiries"
  on public.inquiries for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy if not exists "admin delete inquiries"
  on public.inquiries for delete
  using (auth.role() = 'authenticated');

-- updated_at trigger is not needed (no updated_at column); keep creation timestamp only.
