import type { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';
import type { Category, Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://example.vercel.app').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Home + products list per locale
  for (const locale of locales) {
    entries.push({ url: `${BASE}/${locale}`, changeFrequency: 'daily', priority: 1 });
    entries.push({ url: `${BASE}/${locale}/products`, changeFrequency: 'daily', priority: 0.9 });
    entries.push({ url: `${BASE}/${locale}/about`, changeFrequency: 'monthly', priority: 0.5 });
  }

  try {
    const supabase = await createClient();
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from('categories').select('id, slug, updated_at').eq('is_published', true),
      supabase.from('products').select('id, updated_at').eq('is_published', true),
    ]);

    const categories = (cats as Pick<Category, 'id' | 'slug' | 'updated_at'>[]) || [];
    const products = (prods as Pick<Product, 'id' | 'updated_at'>[]) || [];

    for (const locale of locales) {
      for (const c of categories) {
        entries.push({
          url: `${BASE}/${locale}/category/${c.slug}`,
          lastModified: c.updated_at ? new Date(c.updated_at) : undefined,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
      for (const p of products) {
        entries.push({
          url: `${BASE}/${locale}/product/${p.id}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  } catch {
    // Supabase not configured (e.g. prerender without env) — return static entries only.
  }

  return entries;
}
