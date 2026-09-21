import type { Locale } from '@/lib/i18n/config';
import { isRTL } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { createClient } from '@/lib/supabase/server';
import type { SiteSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AboutPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const dir = isRTL[locale] ? 'rtl' : 'ltr';
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const { data } = await supabase.from('site_settings').select('*').limit(1);
  const s = (data?.[0] as SiteSettings | undefined);
  const name = s ? (locale === 'zh' ? s.company_name_zh : s.company_name_en) : '';
  const intro = s ? (locale === 'zh' ? s.intro_zh : s.intro_en) : '';

  return (
    <div dir={dir} className="bg-white">
      <section className="border-b border-brand-100 bg-gradient-to-r from-brand-50 to-gold-light/40">
        <div className="container py-10">
          <h1 className="text-2xl font-bold text-brand-800 sm:text-3xl">
            {locale === 'zh' ? '关于我们' : 'About Us'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{name}</p>
        </div>
      </section>

      <section className="container py-10">
        <div className="prose max-w-3xl whitespace-pre-line text-gray-700">{intro}</div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Card title={dict.header.whatsapp} value={s?.whatsapp || ''} />
          <Card title={dict.header.wechat} value={s?.wechat || ''} />
          <Card title={dict.header.email} value={s?.email || ''} />
        </div>
      </section>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
      <p className="text-xs uppercase text-gray-400">{title}</p>
      <p className="mt-1 font-mono text-sm text-brand-700">{value}</p>
    </div>
  );
}
