# Yiwu Yiling Accessories Co., Ltd. — Independent Site

义乌忆翎饰品有限公司独立站。基于 Next.js 14 (App Router) + Supabase + Tailwind CSS，支持 7 国语言，Vercel 一键部署。

Live demo: deploy this repo to Vercel and visit `https://<your-project>.vercel.app`.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS (responsive, mobile + desktop)
- **Backend / DB / Auth / Storage**: Supabase (Postgres, Storage, Auth)
- **i18n**: 7 locales — English, العربية, Español, Français, 日本語, 한국어, 中文
- **Deploy**: Vercel (zero-config)

## Project Structure
```
jewelry/
├── app/
│   ├── [locale]/                  # Storefront (locale-prefixed)
│   │   ├── layout.tsx            # html/body + Header + Navbar + Footer
│   │   ├── page.tsx              # Homepage (hero + category grid + featured)
│   │   ├── about/page.tsx        # Company intro
│   │   ├── category/[slug]/      # Category directory (parent + child)
│   │   ├── product/[id]/         # Product detail
│   │   └── products/             # Product list / search
│   ├── admin/                    # Admin panel (NO locale prefix)
│   │   ├── layout.tsx            # Root admin layout
│   │   ├── login/page.tsx        # Email + password sign-in
│   │   ├── page.tsx              # Redirects to /admin/products
│   │   ├── products/             # List + new + [id] edit
│   │   ├── categories/           # Category CRUD + drag-sort (next milestone)
│   │   └── settings/             # Site copy / banner / contact (next milestone)
│   ├── globals.css
│   └── page.tsx                  # Redirects to /en
├── components/
│   ├── Header.tsx                # Company name + intro + logo + lang + contact + admin
│   ├── Navbar.tsx                # Featured + Categories mega-panel + hint bar
│   ├── LanguageSwitcher.tsx
│   ├── ContactPopover.tsx        # WhatsApp / WeChat / Email popover
│   ├── CategoryCard.tsx
│   ├── ProductCard.tsx
│   └── admin/
│       ├── AdminShell.tsx
│       ├── ProductForm.tsx       # ← core product upload form (all required fields)
│       └── ProductList.tsx
├── lib/
│   ├── i18n/
│   │   ├── config.ts             # locales, RTL, names, flags
│   │   ├── get-dictionary.ts     # server-only dictionary loader
│   │   └── dictionaries/{en,ar,es,fr,ja,ko,zh}.json
│   ├── supabase/{client,server,admin}.ts
│   └── types/index.ts
├── supabase/migrations/0001_init.sql   # Categories + Products + SiteSettings + RLS + Storage
├── middleware.ts                 # Locale routing + redirect
├── next.config.mjs
├── tailwind.config.ts
├── .env.local.example
└── README.md
```

## Local Development
```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in your Supabase keys
cp .env.local.example .env.local

# 3. Run the SQL migration
#    Open Supabase Dashboard → SQL Editor → paste supabase/migrations/0001_init.sql → Run

# 4. Create an admin user
#    Supabase Dashboard → Authentication → Users → Add user (email + password)
#    This user can sign in at /admin/login.

# 5. (Optional) Bulk-insert 14 demo products across all 7 categories
npm run seed
#    Requires SUPABASE_SERVICE_ROLE_KEY in .env.local. Idempotent — safe to re-run.

# 6. Start dev server
npm run dev
# Visit http://localhost:3000  (auto-redirects to /en)
```

## Deploy to Vercel (one-click)

### Step 1 — Create the Supabase project
1. Go to https://supabase.com → New project.
2. Note the **Project URL**, **anon public key**, and **service_role key** (Project Settings → API).
3. Open **SQL Editor**, paste the contents of [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql), and run it. This creates the `categories`, `products`, `site_settings` tables, the `product-images` storage bucket, RLS policies, and seed categories.
4. Go to **Authentication → Users → Add user**, create the admin email + password you'll use to log in at `/admin`.

### Step 2 — Deploy on Vercel
1. Push this repo to GitHub (or use `vercel` CLI).
2. Go to https://vercel.com → New Project → import the repo. Vercel auto-detects Next.js — no config needed.
3. In **Settings → Environment Variables**, add:
   | Name | Value | Environments |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR-PROJECT-ref.supabase.co` | Production + Preview + Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon public) | Production + Preview + Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service role) | Production + Preview |
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app` | Production |
4. Click **Deploy**. Once finished, anyone with the public URL can browse the site — no local server required.

### Step 3 — Add products
Visit `https://<your-project>.vercel.app/admin/login`, sign in with the admin user, then click **New product**. Upload images (multi-image), fill SKU, name, color series, box quantity (PCS), weight (g), CBM, and pick a category / subcategory. Toggle "Published" to make it visible on the storefront, and "Featured" to surface it on the homepage.

## i18n Notes
- 7 locales: `en`, `ar`, `es`, `fr`, `ja`, `ko`, `zh`.
- Default locale is `en`; middleware auto-redirects `/` → `/en` (or detected from `Accept-Language`).
- Arabic uses RTL layout (`dir="rtl"`); other locales are LTR.
- Language preference is stored in the `NEXT_LOCALE` cookie.
- Translation dictionaries live in `lib/i18n/dictionaries/<locale>.json`.

## Database Schema (summary)
- `categories` — self-referential (`parent_id`) for parent/child; seeded with 手机链 / 脚链 / 手链 / 项链 / 戒指 / 耳环 / 胸针 and the specified sub-categories.
- `products` — `sku` (unique, required), `colors` (text[]), `box_quantity` (PCS), `weight_g`, `cbm`, `category_id`, `images` (text[] of Supabase Storage URLs), `is_featured`, `is_published`.
- `site_settings` — singleton row holding company name, intro, banner, contact info.

Full DDL: [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).

## Roadmap (next milestones)
- Category manager page with drag-and-drop sort ordering.
- Site settings page (edit company intro, banner, contact info from the admin UI).
- Category directory pages (`/category/[slug]`, `/category/[slug]/[child]`) and product detail page.
- Arabic / RTL fine-tuning for product detail layout.

## License
Proprietary — Yiwu Yiling Accessories Co., Ltd.
