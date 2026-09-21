import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@/lib/i18n/config';
import type { Product } from '@/lib/types';

interface Props {
  locale: Locale;
  product: Product;
  t: { sku: string; colors: string; box_quantity: string; weight: string; cbm: string };
  colorLabels: Record<string, string>;
}

export default function ProductCard({ locale, product, t, colorLabels }: Props) {
  const cover = product.images[0];
  const placeholder = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    'elegant gold jewelry product photo on white background, studio lighting',
  )}&image_size=square`;
  const link = locale === 'zh' ? `/zh/product/${product.id}` : `/${locale}/product/${product.id}`;

  return (
    <Link
      href={link}
      className="card-hover group flex flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm hover:shadow-xl hover:shadow-brand-500/10"
    >
      <div className="relative aspect-square overflow-hidden bg-brand-50">
        <Image
          src={cover || placeholder}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.is_featured && (
          <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-white shadow">
            ★
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="font-mono text-[10px] text-gray-400">{t.sku}: {product.sku}</span>
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-brand-600">
          {product.name}
        </h3>
        {product.colors.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c}
                className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700"
              >
                {colorLabels[c] || c}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex flex-wrap gap-x-3 gap-y-0.5 pt-2 text-[11px] text-gray-500">
          <span>{t.box_quantity}: {product.box_quantity}</span>
          <span>{t.weight}: {product.weight_g}g</span>
        </div>
      </div>
    </Link>
  );
}
