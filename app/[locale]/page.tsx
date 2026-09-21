import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { createClient } from '@/lib/supabase/server';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import type { Category, Product, SiteSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const [{ data: rawCategories }, { data: featured }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase
      .from('products')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('sort_order')
      .limit(8),
  ]);

  const categories = (rawCategories as Category[]) || [];
  const rootCategories = categories.filter((c) => !c.parent_id && c.is_published);
  const featuredProducts = (featured as Product[]) || [];

  const settingsRow = await supabase.from('site_settings').select('*').limit(1);
  const settings = (settingsRow.data?.[0] as SiteSettings | undefined);
  const heroTitle = (settings && locale === 'zh' ? settings.intro_zh : settings?.intro_en) || dict.home.hero_title;
  const bannerUrl = settings?.banner_image_url;

  return (
    <div>
      {/* Hero / banner */}
      <section className="container pt-4">
        <div className="relative flex h-72 flex-col items-start justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-brand-100 via-white to-gold-light/40 px-8 shadow-sm sm:h-96 sm:px-12">
          {/* decorative circles */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-200/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-gold-light/30 blur-2xl" />
          {bannerUrl && (
            <Image
              src={bannerUrl}
              alt="banner"
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-25"
            />
          )}
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-brand-700 backdrop-blur sm:text-sm">
              {dict.home.hero_subtitle}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-brand-800 sm:text-5xl">
              {dict.home.hero_title}
            </h1>
            <p className="mt-3 line-clamp-3 text-sm text-gray-600 sm:text-base">{heroTitle}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/products`}
                className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-600"
              >
                {dict.home.featured_products}
              </Link>
              <Link
                href={`/${locale}/about`}
                className="rounded-full border border-brand-200 bg-white/70 px-5 py-2.5 text-sm font-semibold text-brand-700 backdrop-blur transition hover:bg-white"
              >
                {dict.header.intro || 'About us'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="container py-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold text-brand-800 sm:text-2xl">
            {dict.home.shop_categories}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {rootCategories.length === 0 ? (
            <p className="col-span-full text-sm text-gray-500">{dict.home.empty}</p>
          ) : (
            rootCategories.map((c) => (
              <CategoryCard key={c.id} locale={locale} category={c} />
            ))
          )}
        </div>
      </section>

      {/* Featured products */}
      <section className="container pb-16">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold text-brand-800 sm:text-2xl">
            {dict.home.featured_products}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {featuredProducts.length === 0 ? (
            <p className="col-span-full text-sm text-gray-500">{dict.home.empty}</p>
          ) : (
            featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                locale={locale}
                product={p}
                t={dict.product}
                colorLabels={dict.color}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
