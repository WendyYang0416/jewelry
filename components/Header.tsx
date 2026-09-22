import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { isRTL } from '@/lib/i18n/config';
import type { SiteSettings } from '@/lib/types';
import LanguageSwitcher from './LanguageSwitcher';
import ContactPopover from './ContactPopover';

interface Props {
  locale: Locale;
  settings: Pick<SiteSettings, 'company_name_zh' | 'company_name_en' | 'whatsapp' | 'wechat' | 'email'>;
  t: {
    intro: string;
    contact: string;
    admin: string;
    whatsapp: string;
    wechat: string;
    email: string;
    copy: string;
    copied: string;
    search?: string;
  };
}

export default function Header({ locale, settings, t }: Props) {
  const companyName = locale === 'zh' ? settings.company_name_zh : settings.company_name_en;
  const dir = isRTL[locale] ? 'rtl' : 'ltr';

  const searchForm = (mobile: boolean) => (
    <form
      action={`/${locale}/products`}
      method="get"
      className={mobile ? 'md:hidden' : 'hidden md:flex md:flex-1 md:justify-center'}
      role="search"
    >
      <div className="relative w-full max-w-xs">
        <input
          type="search"
          name="q"
          placeholder={t.search}
          aria-label={t.search}
          className="w-full rounded-full border border-brand-200 bg-brand-50/50 px-4 py-1.5 pe-9 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-400"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute end-1 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-brand-600 hover:bg-brand-100"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </form>
  );

  return (
    <header dir={dir} className="relative z-50 border-b border-brand-100 bg-white shadow-sm backdrop-blur">
      <div className="container flex items-center justify-between gap-2 py-3 sm:gap-4">
        {/* Left: company name + intro */}
        <div className="flex min-w-0 flex-col items-start gap-0.5">
          <Link
            href={`/${locale}`}
            className="max-w-full truncate text-base font-bold leading-tight text-brand-800 hover:text-brand-600 sm:text-xl"
          >
            {companyName}
          </Link>
          <Link
            href={`/${locale}/about`}
            className="shrink-0 text-xs text-gray-500 hover:text-brand-600"
          >
            {t.intro}
          </Link>
        </div>

        {/* Center: logo + desktop search */}
        <div className="hidden items-center gap-4 md:flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold text-base font-bold text-white shadow-sm">
            YL
          </div>
          {searchForm(false)}
        </div>

        {/* Right: language, contact, admin */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <LanguageSwitcher current={locale} />
          <ContactPopover
            whatsapp={settings.whatsapp}
            wechat={settings.wechat}
            email={settings.email}
            labels={{
              whatsapp: t.whatsapp,
              wechat: t.wechat,
              email: t.email,
              copy: t.copy,
              copied: t.copied,
            }}
          />
          <Link
            href="/admin"
            className="flex items-center justify-center rounded-full border border-brand-300 px-2.5 py-1.5 text-sm text-brand-700 hover:bg-brand-50 sm:px-3"
            aria-label={t.admin}
          >
            <span className="sm:hidden">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="hidden sm:inline">{t.admin}</span>
          </Link>
        </div>
      </div>

      {/* Mobile full-width search row */}
      <div className="container pb-2 md:hidden">{searchForm(true)}</div>
    </header>
  );
}
