import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { isRTL } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import type { Category, Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { locale: string; slug: string; child: string };
  searchParams: { sort?: string };
}

export default async function SubCategoryPage({ params, searchParams }: PageProps) {
  const locale = params.locale as Locale;
  const dir = isRTL[locale] ? 'rtl' : 'ltr';
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const sort = searchParams.sort || 'newest';

  const [{ data: parentRow }, { data: childRow }] = await Promise.all([
    supabase.from('categories').select('*').eq('slug', params.slug).eq('is_published', true).single(),
    supabase.from('categories').select('*').eq('slug', params.child).eq('is_published', true).single(),
  ]);
  if (!parentRow || !childRow) notFound();
  const parent = parentRow as Category;
  const child = childRow as Category;
  if (child.parent_id !== parent.id) notFound();

  let pq = supabase.from('products').select('*').eq('category_id', child.id).eq('is_published', true);
  if (sort === 'sku') pq = pq.order('sku');
  else if (sort === 'name') pq = pq.order('name_en');
  else pq = pq.order('sort_order').order('created_at', { ascending: false });
  const { data: products } = await pq;
  const productsList = (products as Product[]) || [];

  function catName(c: Category) {
    return locale === 'zh' ? c.name_zh : c.name_en || c.name_zh;
  }

  return (
    <div dir={dir} className="bg-white">
      <section className="border-b border-brand-100 bg-gradient-to-r from-brand-50 to-gold-light/40">
        <div className="container py-8">
          <nav className="text-xs text-gray-500">
            <Link href={`/${locale}`} className="hover:text-brand-700">{dict.nav.home}</Link>
            <span className="mx-1">/</span>
            <Link href={`/${locale}/category/${parent.slug}`} className="hover:text-brand-700">{catName(parent)}</Link>
            <span className="mx-1">/</span>
            <span className="text-brand-700">{catName(child)}</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold text-brand-800 sm:text-3xl">{catName(child)}</h1>
        </div>
      </section>

      <section className="container pb-16 pt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-brand-800">{dict.home.featured_products}</h2>
          <div className="flex gap-1.5">
            {([
              ['newest', dict.home.sort_newest],
              ['sku', dict.home.sort_sku],
              ['name', dict.home.sort_name],
            ] as const).map(([key, label]) => (
              <Link
                key={key}
                href={`/${locale}/category/${parent.slug}/${child.slug}?sort=${key}`}
                className={`rounded-full px-3 py-1 text-xs ${
                  sort === key ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-brand-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        {productsList.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-400">
            {dict.home.empty}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {productsList.map((p) => (
              <ProductCard
                key={p.id}
                locale={locale}
                product={p}
                t={dict.product}
                colorLabels={dict.color}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
