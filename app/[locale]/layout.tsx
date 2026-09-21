import type { Locale } from '@/lib/i18n/config';
import { isRTL, localeNames } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import type { Category, SiteSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale: Locale = params.locale as Locale;
  const dir = isRTL[locale] ? 'rtl' : 'ltr';
  const dict = await getDictionary(locale);

  // Fetch categories + site settings server-side for the chrome.
  const supabase = await createClient();
  const [{ data: categories }, { data: settingsRow }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('site_settings').select('*').limit(1),
  ]);

  const settings: Pick<SiteSettings, 'company_name_zh' | 'company_name_en' | 'whatsapp' | 'wechat' | 'email'> = settingsRow?.[0] ?? {
    company_name_zh: '义乌忆锦饰品有限公司',
    company_name_en: 'Yiwu Yiling Accessories Co., Ltd.',
    whatsapp: '+86 19548146867',
    wechat: '+86 19548146867',
    email: '257491320@qq.com',
  };

  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        <Header locale={locale} settings={settings} t={dict.header} />
        <Navbar
          locale={locale}
          categories={(categories as Category[]) || []}
          t={{ recommendations: dict.nav.recommendations, categories: dict.nav.categories }}
          hint={dict.category_hint}
        />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-brand-100 bg-brand-50/40 py-6 text-center text-xs text-gray-500">
          <div className="container">
            <p>© {new Date().getFullYear()} {locale === 'zh' ? settings.company_name_zh : settings.company_name_en}. {dict.footer.rights}</p>
            <p className="mt-1 text-[11px]">{dict.footer.made_in} · {localeNames[locale]}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
