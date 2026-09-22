import type { Locale } from '@/lib/i18n/config';
import { isRTL, localeNames } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import HtmlDir from '@/components/HtmlDir';
import type { Category, SiteSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const locale: Locale = params.locale as Locale;
  const supabase = await createClient();
  let companyZh = '义乌忆翎饰品有限公司';
  let companyEn = 'Yiwu Yiling Accessories Co., Ltd.';
  try {
    const { data } = await supabase.from('site_settings').select('company_name_zh, company_name_en').limit(1);
    if (data?.[0]) {
      companyZh = data[0].company_name_zh || companyZh;
      companyEn = data[0].company_name_en || companyEn;
    }
  } catch {
    // Supabase not configured — use defaults.
  }
  const title = locale === 'zh' ? companyZh : companyEn;
  return {
    title: {
      default: title,
      template: `%s · ${title}`,
    },
    description:
      locale === 'zh'
        ? '义乌忆翎饰品有限公司——手机链、脚链、手链、项链、戒指、耳环、胸针等饰品源头工厂，支持 OEM/ODM，全球发货。'
        : 'Yiwu Yiling Accessories Co., Ltd. — factory-direct phone charms, anklets, bracelets, necklaces, rings, earrings and brooches. OEM/ODM welcome, worldwide shipping.',
    robots: { index: true, follow: true },
  };
}

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
    company_name_zh: '义乌忆翎饰品有限公司',
    company_name_en: 'Yiwu Yiling Accessories Co., Ltd.',
    whatsapp: '+86 19548146867',
    wechat: '+86 19548146867',
    email: '257491320@qq.com',
  };

  return (
    <>
      <HtmlDir locale={locale} dir={dir} />
      <Header locale={locale} settings={settings} t={dict.header} />
      <Navbar
        locale={locale}
        categories={(categories as Category[]) || []}
        t={{ recommendations: dict.nav.recommendations, categories: dict.nav.categories }}
        hint={dict.category_hint}
      />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-brand-100 bg-gradient-to-b from-white to-brand-50/60 py-8 text-center text-xs text-gray-500">
        <div className="container">
          <p>© {new Date().getFullYear()} {locale === 'zh' ? settings.company_name_zh : settings.company_name_en}. {dict.footer.rights}</p>
          <p className="mt-1 text-[11px]">{dict.footer.made_in} · {localeNames[locale]}</p>
        </div>
      </footer>
    </>
  );
}
