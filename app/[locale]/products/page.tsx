import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { isRTL } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import type { Category, Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { locale: string };
  searchParams: { featured?: string; category?: string; q?: string };
}

export default async function ProductsListPage({ params, searchParams }: PageProps) {
  const locale = params.locale as Locale;
  const dir = isRTL[locale] ? 'rtl' : 'ltr';
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const q = (searchParams.q || '').trim();

  let query = supabase.from('products').select('*').eq('is_published', true);
  if (searchParams.featured === '1') query = query.eq('is_featured', true);
  if (searchParams.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', searchParams.category)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
  }
  if (q) {
    // Search by SKU / name (zh & en). Strip characters that would break the .or() filter syntax.
    const safe = q.replace(/[,()]/g, '');
    query = query.or(
      `sku.ilike.%${safe}%,name_en.ilike.%${safe}%,name_zh.ilike.%${safe}%`
    );
  }
  const { data: productsList } = await query.order('sort_order').order('created_at', { ascending: false });
  const { data: cats } = await supabase.from('categories').select('*').eq('is_published', true).order('sort_order');

  const products = (productsList as Product[]) || [];
  const categories = (cats as Category[]) || [];
  const roots = categories.filter((c) => !c.parent_id);

  function catName(c: Category) {
    return locale === 'zh' ? c.name_zh : c.name_en || c.name_zh;
  }

  const title = q ? `“${q}”`
    : searchParams.featured === '1' ? dict.nav.recommendations
      : searchParams.category ? (roots.find((r) => r.slug === searchParams.category)?.name_zh ?? dict.nav.products)
      : dict.nav.products;

  return (
    <div dir={dir} className="bg-white">
      <section className="border-b border-brand-100 bg-gradient-to-r from-brand-50 to-gold-light/40">
        <div className="container py-8">
          <nav className="text-xs text-gray-500">
            <Link href={`/${locale}`} className="hover:text-brand-700">{dict.nav.home}</Link>
            <span className="mx-1">/</span>
            <span className="text-brand-700">{title}</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold text-brand-800 sm:text-3xl">{title}</h1>
        </div>
      </section>

      <section className="container pb-16 pt-6">
        {/* Category filter chips */}
        <div className="mb-5 flex flex-wrap gap-2">
          <Link
            href={`/${locale}/products`}
            className={`rounded-full px-3 py-1 text-xs ${
              !searchParams.category ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-brand-50'
            }`}
          >
            {dict.home.view_all}
          </Link>
          <Link
            href={`/${locale}/products?featured=1`}
            className={`rounded-full px-3 py-1 text-xs ${
              searchParams.featured === '1' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-brand-50'
            }`}
          >
            {dict.nav.recommendations}
          </Link>
          {roots.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/products?category=${c.slug}`}
              className={`rounded-full px-3 py-1 text-xs ${
                searchParams.category === c.slug ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-brand-50'
              }`}
            >
              {catName(c)}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-400">
            {dict.home.empty}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {products.map((p) => (
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
