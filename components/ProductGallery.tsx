'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types';

interface Props {
  product: Product;
  colorLabels: Record<string, string>;
  labels: { sku: string; colors: string; box_quantity: string; weight: string; cbm: string; category: string };
}

export default function ProductGallery({ product, colorLabels, labels }: Props) {
  const images = product.images?.length ? product.images : [
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
      'elegant gold jewelry product photo on white background, studio lighting',
    )}&image_size=portrait_4_3`,
  ];
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [product.id]);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-brand-100 bg-brand-50">
        <Image
          src={images[active]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                i === active ? 'border-brand-500' : 'border-transparent'
              }`}
            >
              <Image src={src} alt={`thumb-${i}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <Spec label={labels.box_quantity} value={`${product.box_quantity} PCS`} />
        <Spec label={labels.weight} value={`${product.weight_g} g`} />
        <Spec label={labels.cbm} value={`${product.cbm} m³`} />
      </div>

      {product.colors.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500">{labels.colors}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {product.colors.map((c) => (
              <span key={c} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                {colorLabels[c] || c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
      <p className="text-[10px] uppercase text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}
