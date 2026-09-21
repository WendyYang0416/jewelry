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
  };
}

export default function Header({ locale, settings, t }: Props) {
  const companyName = locale === 'zh' ? settings.company_name_zh : settings.company_name_en;
  const dir = isRTL[locale] ? 'rtl' : 'ltr';

  return (
    <header dir={dir} className="border-b border-brand-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container flex items-center justify-between gap-4 py-3">
        {/* Left: company name + intro */}
        <div className="flex flex-col items-start gap-0.5">
          <Link
            href={`/${locale}`}
            className="text-lg font-bold leading-tight text-brand-800 hover:text-brand-600 sm:text-xl"
          >
            {companyName}
          </Link>
          <Link
            href={`/${locale}/about`}
            className="text-xs text-gray-500 hover:text-brand-600"
          >
            {t.intro}
          </Link>
        </div>

        {/* Center: logo / image slot */}
        <div className="hidden md:block">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold text-base font-bold text-white shadow-sm">
            YL
          </div>
        </div>

        {/* Right: language, contact, admin */}
        <div className="flex items-center gap-2 sm:gap-3">
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
            className="rounded-full border border-brand-300 px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50"
          >
            {t.admin}
          </Link>
        </div>
      </div>
    </header>
  );
}
