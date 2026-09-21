import { NextResponse, type NextRequest } from 'next/server';
import { locales, defaultLocale, type Locale } from '@/lib/i18n/config';

// Match all paths except API, _next, static, SEO files, admin (admin uses own layout)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|admin|images|sitemap.xml|robots.txt).*)',
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip if already has a locale prefix
  const pathnameHasLocale = locales.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`,
  );
  if (pathnameHasLocale) return;

  // Detect locale from cookie or Accept-Language
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value as Locale | undefined;
  const acceptLang = request.headers.get('accept-language') || '';
  const detected: Locale =
    cookieLocale && locales.includes(cookieLocale)
      ? cookieLocale
      : detectFromAccept(acceptLang);

  const url = request.nextUrl.clone();
  url.pathname = `/${detected}${pathname}`;
  return NextResponse.redirect(url);
}

function detectFromAccept(accept: string): Locale {
  for (const part of accept.split(',')) {
    const code = part.split(';')[0].split('-')[0].toLowerCase();
    if (locales.includes(code as Locale)) return code as Locale;
  }
  return defaultLocale;
}
