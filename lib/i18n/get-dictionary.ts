import 'server-only';

import type { Locale } from './config';
import { defaultLocale, isValidLocale } from './config';

export type Dictionary = typeof import('@/lib/i18n/dictionaries/en.json');

const cache: Partial<Record<Locale, Dictionary>> = {};

export async function getDictionary(locale: string | undefined): Promise<Dictionary> {
  const lng: Locale = isValidLocale(locale) ? locale : defaultLocale;
  if (cache[lng]) return cache[lng] as Dictionary;
  const mod = (await import(`@/lib/i18n/dictionaries/${lng}.json`)) as Dictionary;
  cache[lng] = mod;
  return mod;
}
