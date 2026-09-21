import Image from 'next/image';
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
      <section className="relative">
        <div className="container relative flex h-64 flex-col items-start justify-center rounded-b-3xl bg-gradient-to-r from-brand-100 to-gold-light/60 px-6 sm:h-80">
          {bannerUrl && (
            <Image
              src={bannerUrl}
              alt="banner"
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-30"
            />
          )}
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-2xl font-bold text-brand-800 sm:text-4xl">
              {dict.home.hero_title}
            </h1>
            <p className="mt-2 text-sm text-brand-700 sm:text-base">
              {dict.home.hero_subtitle}
            </p>
            <p className="mt-3 line-clamp-3 text-xs text-gray-600 sm:text-sm">{heroTitle}</p>
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-7">
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
