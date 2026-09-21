-- ============================================================================
-- Yiwu Yiling Accessories — Initial schema
-- Run this in Supabase SQL Editor (or `supabase db push`)
-- ============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. Categories (分类表) — self-referential to support parent/child
-- ============================================================================
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null unique,
  name_key    text not null default '',          -- i18n dictionary key (optional)
  name_zh     text not null,
  name_en     text not null default '',
  parent_id   uuid references public.categories (id) on delete set null,
  image_url   text,
  sort_order  int  not null default 0,
  is_published boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists categories_parent_id_idx
  on public.categories (parent_id);
create index if not exists categories_sort_idx
  on public.categories (sort_order);

-- ============================================================================
-- 2. Products (产品表)
-- ============================================================================
create table if not exists public.products (
  id            uuid primary key default uuid_generate_v4(),
  sku           text not null unique,            -- 产品编号 (必填, 唯一)
  name          text not null,
  description   text,
  colors        text[] not null default '{}',     -- 同产品色系 (gold, silver, ...)
  box_quantity  int  not null default 0 check (box_quantity >= 0), -- 箱规 PCS
  weight_g      numeric(10,3) not null default 0 check (weight_g >= 0), -- 重量 g
  cbm           numeric(10,4) not null default 0 check (cbm >= 0),       -- CBM m³
  category_id   uuid references public.categories (id) on delete set null,
  images        text[] not null default '{}',    -- Supabase Storage URLs
  is_featured   boolean not null default false,
  is_published  boolean not null default true,
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_sku_idx
  on public.products (sku);
create index if not exists products_category_idx
  on public.products (category_id);
create index if not exists products_featured_idx
  on public.products (is_featured)
  where is_featured = true;
create index if not exists products_published_idx
  on public.products (is_published, sort_order);

-- ============================================================================
-- 3. Site settings (系统设置表) — singleton row (fixed id)
-- ============================================================================
create table if not exists public.site_settings (
  id              uuid primary key default '00000000-0000-0000-0000-000000000000',
  company_name_zh text not null default '义乌忆锦饰品有限公司',
  company_name_en text not null default 'Yiwu Yiling Accessories Co., Ltd.',
  intro_zh        text not null default '',
  intro_en       text not null default '',
  banner_image_url text,
  whatsapp       text not null default '',
  wechat         text not null default '',
  email          text not null default '',
  updated_at     timestamptz not null default now()
);

-- Seed the singleton row ----------------------------------------------------
insert into public.site_settings (id, company_name_zh, company_name_en, intro_zh, intro_en, whatsapp, wechat, email)
values (
  '00000000-0000-0000-0000-000000000000',
  '义乌忆锦饰品有限公司',
  'Yiwu Yiling Accessories Co., Ltd.',
  '义乌忆锦饰品有限公司，专注于高品质饰品的研发、生产与出口，主营手机链、脚链、手链、项链、戒指、耳环、胸针等品类，支持OEM/ODM定制，远销中东、欧美、东南亚市场。',
  'Yiwu Yiling Accessories Co., Ltd. specializes in the R&D, production and export of high-quality accessories including phone charms, anklets, bracelets, necklaces, rings, earrings and brooches. OEM/ODM orders are welcome.',
  '+86 19548146867',
  '+86 19548146867',
  '257491320@qq.com'
)
on conflict (id) do nothing;

-- ============================================================================
-- 4. Seed categories (matched to the hand-drawn sketch)
--    Sub-categories only exist where the user specified them
-- ============================================================================
do $$
declare
  v_phone uuid; v_bracelet uuid;
begin
  insert into public.categories (slug, name_key, name_zh, name_en, parent_id, sort_order)
  values
    ('phone-charm',  'cat.phone_charm',  '手机链', 'Phone Charm', null, 1)
  returning id into v_phone;

  insert into public.categories (slug, name_key, name_zh, name_en, parent_id, sort_order)
  values
    ('phone-charm-beaded', 'cat.phone_charm_beaded', '串珠', 'Beaded', v_phone, 1),
    ('phone-charm-woven',   'cat.phone_charm_woven', '编织', 'Woven', v_phone, 2),
    ('phone-charm-knit',    'cat.phone_charm_knit', '针织', 'Knitted', v_phone, 3),
    ('phone-charm-trim',    'cat.phone_charm_trim', '辅料', 'Trim / Accessories', v_phone, 4);

  insert into public.categories (slug, name_key, name_zh, name_en, parent_id, sort_order)
  values
    ('anklet', 'cat.anklet', '脚链', 'Anklet', null, 2);

  insert into public.categories (slug, name_key, name_zh, name_en, parent_id, sort_order)
  values
    ('bracelet', 'cat.bracelet', '手链', 'Bracelet', null, 3)
  returning id into v_bracelet;

  insert into public.categories (slug, name_key, name_zh, name_en, parent_id, sort_order)
  values
    ('bracelet-handmade', 'cat.bracelet_handmade', '手工链', 'Handmade', v_bracelet, 1),
    ('bracelet-pandora',   'cat.bracelet_pandora', '潘多拉款', 'Pandora Style', v_bracelet, 2);

  insert into public.categories (slug, name_key, name_zh, name_en, parent_id, sort_order)
  values
    ('necklace', 'cat.necklace', '项链', 'Necklace', null, 4),
    ('ring',     'cat.ring',     '戒指', 'Ring', null, 5),
    ('earring',  'cat.earring',  '耳环', 'Earring', null, 6),
    ('brooch',   'cat.brooch',   '胸针', 'Brooch', null, 7);
end $$;

-- ============================================================================
-- 5. Storage bucket for product images
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- ============================================================================
-- 6. Row Level Security
-- ============================================================================
alter table public.products       enable row level security;
alter table public.categories      enable row level security;
alter table public.site_settings  enable row level security;

-- Public can read published rows --------------------------------------------
-- Note: PostgreSQL does not support `CREATE POLICY IF NOT EXISTS`; use DROP + CREATE for idempotency.
drop policy if exists "public read published products" on public.products;
create policy "public read published products"
  on public.products for select
  using (is_published = true);

drop policy if exists "public read categories"
  on public.categories;
create policy "public read categories"
  on public.categories for select
  using (is_published = true);

drop policy if exists "public read site settings"
  on public.site_settings;
create policy "public read site settings"
  on public.site_settings for select
  using (true);

-- Authenticated admins can do everything on these tables --------------------
drop policy if exists "admin all products"
  on public.products;
create policy "admin all products"
  on public.products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "admin all categories"
  on public.categories;
create policy "admin all categories"
  on public.categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "admin update site settings"
  on public.site_settings;
create policy "admin update site settings"
  on public.site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Storage policies ----------------------------------------------------------
drop policy if exists "public read product images"
  on storage.objects;
create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "admin upload product images"
  on storage.objects;
create policy "admin upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "admin update product images"
  on storage.objects;
create policy "admin update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "admin delete product images"
  on storage.objects;
create policy "admin delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ============================================================================
-- 7. Updated_at triggers
-- ============================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_touch      on public.products;
drop trigger if exists categories_touch    on public.categories;
drop trigger if exists site_settings_touch on public.site_settings;

create trigger products_touch      before update on public.products
  for each row execute function public.touch_updated_at();
create trigger categories_touch    before update on public.categories
  for each row execute function public.touch_updated_at();
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();
