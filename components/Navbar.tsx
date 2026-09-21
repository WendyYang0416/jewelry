'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { isRTL } from '@/lib/i18n/config';
import type { Category } from '@/lib/types';
import { FaChevronDown, FaBars, FaXmark } from 'react-icons/fa6';

interface Props {
  locale: Locale;
  categories: Category[];
  t: { recommendations: string; categories: string; home?: string };
  hint: string;
}

export default function Navbar({ locale, categories, t, hint }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
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

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return (
    <nav dir={dir} className="sticky top-0 z-40 border-b border-brand-100 bg-white shadow-sm">
      <div className="container">
        {/* Mobile row: hamburger + featured link */}
        <div className="flex items-center justify-between md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Menu"
            className="flex items-center gap-2 px-2 py-3 text-brand-800"
          >
            <FaBars className="h-5 w-5" />
            <span className="text-sm font-medium">{t.categories}</span>
          </button>
          <Link
            href={`/${locale}/products?featured=1`}
            onClick={closeDrawer}
            className="px-2 py-3 text-sm font-medium text-brand-800"
          >
            {t.recommendations}
          </Link>
        </div>

        {/* Desktop menu */}
        <ul
          className="hidden items-stretch justify-center gap-1 text-sm font-medium sm:gap-6 md:flex"
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
            <Link
              href={`/${locale}/products`}
              className="flex items-center gap-1 px-3 py-3 text-brand-800 hover:text-brand-600"
            >
              {t.categories}
              <FaChevronDown className="h-3 w-3" />
            </Link>

            {/* Hover mega-panel */}
            <div
              className={`absolute inset-x-0 top-full transition-all duration-200 ${
                hovered === 'categories'
                  ? 'visible opacity-100'
                  : 'invisible translate-y-1 opacity-0'
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

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${drawerOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!drawerOpen}
      >
        {/* Backdrop */}
        <div
          onClick={closeDrawer}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            drawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Panel */}
        <div
          className={`absolute inset-y-0 start-0 flex w-72 max-w-[80vw] flex-col bg-white shadow-2xl transition-transform duration-200`}
          style={{ transform: drawerOpen ? 'translateX(0)' : dir === 'rtl' ? 'translateX(100%)' : 'translateX(-100%)' }}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-bold text-brand-800">{t.categories}</span>
            <button onClick={closeDrawer} aria-label="Close" className="p-1 text-gray-500">
              <FaXmark className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <Link
              href={`/${locale}/products?featured=1`}
              onClick={closeDrawer}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-brand-800 hover:bg-brand-50"
            >
              ★ {t.recommendations}
            </Link>
            <Link
              href={`/${locale}/products`}
              onClick={closeDrawer}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-brand-800 hover:bg-brand-50"
            >
              {t.categories}
            </Link>

            <div className="mt-2 border-t border-gray-100 pt-2">
              {rootChildren.map((root) => {
                const children = childMap.get(root.id) || [];
                const open = expandedIds[root.id];
                return (
                  <div key={root.id}>
                    <div className="flex items-center">
                      <Link
                        href={`/${locale}/category/${root.slug}`}
                        onClick={closeDrawer}
                        className="flex-1 rounded-md px-3 py-2.5 text-sm text-gray-800 hover:bg-brand-50"
                      >
                        {categoryName(root)}
                      </Link>
                      {children.length > 0 && (
                        <button
                          type="button"
                          aria-label="Expand"
                          onClick={() => setExpandedIds((e) => ({ ...e, [root.id]: !e[root.id] }))}
                          className="p-2 text-gray-400"
                        >
                          <FaChevronDown
                            className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
                          />
                        </button>
                      )}
                    </div>
                    {open && children.length > 0 && (
                      <div className="ms-4 border-s border-gray-100 ps-2">
                        {children.map((ch) => (
                          <Link
                            key={ch.id}
                            href={`/${locale}/category/${root.slug}/${ch.slug}`}
                            onClick={closeDrawer}
                            className="block rounded-md px-3 py-2 text-xs text-gray-600 hover:bg-brand-50"
                          >
                            {categoryName(ch)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 p-3 text-[11px] text-gray-400">
            {hint}
          </div>
        </div>
      </div>
    </nav>
  );
}
