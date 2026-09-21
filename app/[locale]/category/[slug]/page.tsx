import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { isRTL } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import type { Category, Product, SiteSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { locale: string; slug: string };
}

export default async function CategoryDirectoryPage({ params }: PageProps) {
  const locale = params.locale as Locale;
  const dir = isRTL[locale] ? 'rtl' : 'ltr';
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const { data: catRow } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();
  if (!catRow) notFound();
  const category = catRow as Category;

  // Sub-categories of this root + products directly in this root
  const [{ data: subs }, { data: products }, { data: settingsRow }] = await Promise.all([
    supabase.from('categories').select('*').eq('parent_id', category.id).eq('is_published', true).order('sort_order'),
    supabase
      .from('products')
      .select('*')
      .eq('category_id', category.id)
      .eq('is_published', true)
      .order('sort_order')
      .order('created_at', { ascending: false }),
    supabase.from('site_settings').select('*').limit(1),
  ]);
  const settings = settingsRow?.[0] as SiteSettings | undefined;
  const subCategories = (subs as Category[]) || [];
  const productsList = (products as Product[]) || [];

  function catName(c: Category) {
    return locale === 'zh' ? c.name_zh : c.name_en || c.name_zh;
  }

  const placeholderFor = (name: string) =>
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
      `minimal elegant ${name} jewelry product photo on soft cream background, studio lighting, top-down`,
    )}&image_size=square`;

  return (
    <div dir={dir} className="bg-white">
      {/* Category hero */}
      <section className="border-b border-brand-100 bg-gradient-to-r from-brand-50 to-gold-light/40">
        <div className="container py-8">
          <nav className="text-xs text-gray-500">
            <Link href={`/${locale}`} className="hover:text-brand-700">{dict.nav.home}</Link>
            <span className="mx-1">/</span>
            <span className="text-brand-700">{catName(category)}</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold text-brand-800 sm:text-3xl">{catName(category)}</h1>
          {settings && (
            <p className="mt-1 max-w-2xl text-sm text-gray-600">
              {locale === 'zh' ? settings.intro_zh : settings.intro_en}
            </p>
          )}
        </div>
      </section>

      {/* Sub-categories (if any) */}
      {subCategories.length > 0 && (
        <section className="container py-8">
          <h2 className="mb-4 text-lg font-bold text-brand-800">{dict.home.shop_categories}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {subCategories.map((s) => (
              <Link
                key={s.id}
                href={`/${locale}/category/${category.slug}/${s.slug}`}
                className="card-hover group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border border-brand-100 bg-brand-50"
              >
                <Image
                  src={s.image_url || placeholderFor(catName(s))}
                  alt={catName(s)}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-center">
                  <span className="text-base font-semibold text-white">{catName(s)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products in this category (root) */}
      <section className="container pb-16">
        <h2 className="mb-4 text-lg font-bold text-brand-800">{dict.home.featured_products}</h2>
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
