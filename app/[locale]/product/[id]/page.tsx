import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { isRTL } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { createClient } from '@/lib/supabase/server';
import ProductGallery from '@/components/ProductGallery';
import type { Category, Product, SiteSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { locale: string; id: string };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const locale = params.locale as Locale;
  const dir = isRTL[locale] ? 'rtl' : 'ltr';
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const { data: prod } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .eq('is_published', true)
    .single();
  if (!prod) notFound();
  const product = prod as Product;

  const [catRow, settingsRow] = await Promise.all([
    product.category_id
      ? supabase.from('categories').select('*').eq('id', product.category_id).single()
      : Promise.resolve({ data: null }),
    supabase.from('site_settings').select('*').limit(1),
  ]);
  const category = catRow.data as Category | null;
  const settings = settingsRow.data?.[0] as SiteSettings | undefined;

  function catName(c: Category) {
    return locale === 'zh' ? c.name_zh : c.name_en || c.name_zh;
  }

  const waLink = `https://wa.me/${(settings?.whatsapp || '').replace(/[^\d]/g, '')}?text=${encodeURIComponent(
    `Hi, I'm interested in product ${product.sku} - ${product.name}`,
  )}`;
  const mailLink = `mailto:${settings?.email || ''}?subject=${encodeURIComponent(
    `Inquiry: ${product.sku} - ${product.name}`,
  )}`;

  return (
    <div dir={dir} className="bg-white">
      <div className="container py-6 sm:py-10">
        <nav className="mb-4 text-xs text-gray-500">
          <Link href={`/${locale}`} className="hover:text-brand-700">{dict.nav.home}</Link>
          {category && (
            <>
              <span className="mx-1">/</span>
              <Link href={`/${locale}/category/${category.slug}`} className="hover:text-brand-700">
                {catName(category)}
              </Link>
            </>
          )}
          <span className="mx-1">/</span>
          <span className="text-brand-700">{product.sku}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <ProductGallery
            product={product}
            colorLabels={dict.color}
            labels={dict.product}
          />

          {/* Info */}
          <div className="flex flex-col">
            <p className="font-mono text-xs text-gray-400">{dict.product.sku}: {product.sku}</p>
            <h1 className="mt-1 text-2xl font-bold text-brand-800 sm:text-3xl">{product.name}</h1>
            {product.description && (
              <p className="mt-3 whitespace-pre-line text-sm text-gray-600">{product.description}</p>
            )}

            <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
              <p className="text-sm font-semibold text-brand-800">
                {locale === 'zh' ? '询价 / 下单' : 'Inquiry / Order'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {locale === 'zh'
                  ? '点击下方按钮通过 WhatsApp 或邮件联系我们获取报价。'
                  : 'Click below to reach us via WhatsApp or email for a quote.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  WhatsApp
                </a>
                <a
                  href={mailLink}
                  className="inline-flex items-center gap-1 rounded-full border border-brand-300 px-4 py-2 text-sm text-brand-700 hover:bg-brand-50"
                >
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
