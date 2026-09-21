'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { isRTL } from '@/lib/i18n/config';
import type { Category } from '@/lib/types';
import { FaChevronDown } from 'react-icons/fa6';

interface Props {
  locale: Locale;
  categories: Category[];
  t: { recommendations: string; categories: string };
  hint: string;
}

export default function Navbar({ locale, categories, t, hint }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const dir = isRTL[locale] ? 'rtl' : 'ltr';

  const roots = categories.filter((c) => !c.parent_id);
  const childMap = new Map<string | null, Category[]>();
  for (const c of categories) {
    const arr = childMap.get(c.parent_id) || [];
    arr.push(c);
    childMap.set(c.parent_id, arr);
  }
  const rootChildren = childMap.get(null) || [];

  function categoryName(c: Category) {
    return locale === 'zh' ? c.name_zh : c.name_en || c.name_zh;
  }

  return (
    <nav dir={dir} className="sticky top-0 z-40 border-b border-brand-100 bg-white shadow-sm">
      <div className="container">
        <ul
          className="flex items-stretch justify-center gap-1 text-sm font-medium sm:gap-6"
          onMouseLeave={() => setHovered(null)}
        >
          <li>
            <Link
              href={`/${locale}/products?featured=1`}
              onMouseEnter={() => setHovered('featured')}
              className="flex items-center gap-1 px-3 py-3 text-brand-800 hover:text-brand-600"
            >
              {t.recommendations}
            </Link>
          </li>

          <li onMouseEnter={() => setHovered('categories')}>
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-3 text-brand-800 hover:text-brand-600"
            >
              {t.categories}
              <FaChevronDown className="h-3 w-3" />
            </button>

            {/* Hover mega-panel */}
            <div
              className={`absolute inset-x-0 top-full transition-all duration-200 ${
                hovered === 'categories'
                  ? 'visible opacity-100'
                  : 'invisible opacity-0 translate-y-1'
              }`}
            >
              <div className="border-t border-brand-100 bg-white shadow-lg">
                <div className="container grid grid-cols-2 gap-x-6 gap-y-2 py-4 sm:grid-cols-4 lg:grid-cols-7">
                  {rootChildren.map((root) => {
                    const children = childMap.get(root.id) || [];
                    return (
                      <div key={root.id} className="group">
                        <Link
                          href={`/${locale}/category/${root.slug}`}
                          className="block rounded-md px-2 py-1 font-semibold text-brand-700 hover:bg-brand-50"
                        >
                          {categoryName(root)}
                        </Link>
                        {children.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {children.map((ch) => (
                              <li key={ch.id}>
                                <Link
                                  href={`/${locale}/category/${root.slug}/${ch.slug}`}
                                  className="block rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-brand-50 hover:text-brand-700"
                                >
                                  {categoryName(ch)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>
        </ul>

        {/* Floating hint bar */}
        <div className="border-t border-brand-50 bg-brand-50/60 py-1 text-center text-[11px] text-brand-700">
          {hint}
        </div>
      </div>
    </nav>
  );
}
