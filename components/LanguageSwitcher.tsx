'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/config';
import { FaChevronDown, FaGlobe } from 'react-icons/fa6';

export default function LanguageSwitcher({ current }: { current: Locale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function switchTo(l: Locale) {
    setOpen(false);
    if (l === current) return;
    // Replace the leading /<locale>/ segment of the current path.
    const segments = pathname.split('/');
    if (segments.length > 1) segments[1] = l;
    const newPath = segments.join('/') || `/${l}`;
    document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.push(newPath);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full border border-brand-200 bg-white px-2 py-1.5 text-sm text-brand-700 hover:border-brand-400 sm:gap-1.5 sm:px-3"
        aria-label="Language"
      >
        <FaGlobe className="hidden text-brand-500 sm:inline" />
        <span className="text-base leading-none">{localeFlags[current]}</span>
        <span className="hidden sm:inline">{localeNames[current]}</span>
        <FaChevronDown className="h-3 w-3 text-brand-400" />
      </button>

      {open && (
        <ul className="absolute end-0 mt-2 w-44 overflow-hidden rounded-xl border border-brand-100 bg-white shadow-lg z-50">
          {locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                onClick={() => switchTo(l)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-brand-50 ${
                  l === current ? 'font-semibold text-brand-700' : 'text-gray-700'
                }`}
              >
                <span className="text-base">{localeFlags[l]}</span>
                <span>{localeNames[l]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
