export const locales = ['en', 'ar', 'es', 'fr', 'ja', 'ko', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  es: 'Español',
  fr: 'Français',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  ar: '🇸🇦',
  es: '🇪🇸',
  fr: '🇫🇷',
  ja: '🇯🇵',
  ko: '🇰🇷',
  zh: '🇨🇳',
};

export const isRTL: Record<Locale, boolean> = {
  en: false,
  ar: true,
  es: false,
  fr: false,
  ja: false,
  ko: false,
  zh: false,
};

export const dictionaries: Record<Locale, string> = {
  en: 'en',
  ar: 'ar',
  es: 'es',
  fr: 'fr',
  ja: 'ja',
  ko: 'ko',
  zh: 'zh',
};

export function isValidLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
