import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@/lib/i18n/config';
import type { Category } from '@/lib/types';

interface Props {
  locale: Locale;
  category: Category;
}

function name(c: Category, locale: Locale) {
  return locale === 'zh' ? c.name_zh : c.name_en || c.name_zh;
}

export default function CategoryCard({ locale, category }: Props) {
  const placeholder = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    `minimal elegant ${name(category, locale)} jewelry product photo on soft cream background, studio lighting, top-down`,
  )}&image_size=square`;
  return (
    <Link
      href={`/${locale}/category/${category.slug}`}
      className="card-hover group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border border-brand-100 bg-brand-50"
    >
      <Image
        src={category.image_url || placeholder}
        alt={name(category, locale)}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-center">
        <span className="text-base font-semibold text-white drop-shadow sm:text-lg">
          {name(category, locale)}
        </span>
      </div>
    </Link>
  );
}
