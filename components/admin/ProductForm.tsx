'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Category, Product } from '@/lib/types';
import { FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa6';

interface Props {
  initial?: Product | null;
  categories: Category[];
  labels: {
    sku: string; sku_help: string; name: string; description: string;
    colors: string; colors_help: string; custom_color: string; add_color: string;
    box_quantity: string; weight_g: string; cbm: string;
    category: string; subcategory: string;
    images: string; images_help: string; upload: string;
    featured: string; published: string;
    submit: string; updating: string; cancel: string;
  };
  colorOptions: { value: string; label: string }[];
}

const BUCKET = 'product-images';

export default function ProductForm({ initial, categories, labels, colorOptions }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    sku: initial?.sku ?? '',
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    colors: initial?.colors ?? [],
    box_quantity: initial?.box_quantity ?? 0,
    weight_g: initial?.weight_g ?? 0,
    cbm: initial?.cbm ?? 0,
    category_id: initial?.category_id ?? '',
    images: initial?.images ?? [],
    is_featured: initial?.is_featured ?? false,
    is_published: initial?.is_published ?? true,
  });
  const [customColor, setCustomColor] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rootCategories = categories.filter((c) => !c.parent_id);
  const subCategories = categories.filter((c) => c.parent_id === form.category_id);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleColor(c: string) {
    setForm((f) => ({
      ...f,
      colors: f.colors.includes(c) ? f.colors.filter((x) => x !== c) : [...f.colors, c],
    }));
  }

  function addCustomColor() {
    const v = customColor.trim();
    if (!v) return;
    setForm((f) => (f.colors.includes(v) ? f : { ...f, colors: [...f.colors, v] }));
    setCustomColor('');
  }

  async function uploadFiles(files: FileList) {
    setUploading(true);
    setError(null);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });
      if (upErr) {
        setError(upErr.message);
        continue;
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }
    setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    setUploading(false);
  }

  function removeImage(url: string) {
    setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description || null,
      colors: form.colors,
      box_quantity: Number(form.box_quantity),
      weight_g: Number(form.weight_g),
      cbm: Number(form.cbm),
      category_id: form.category_id || null,
      images: form.images,
      is_featured: form.is_featured,
      is_published: form.is_published,
    };

    if (!payload.sku || !payload.name) {
      setError('SKU and Name are required.');
      setSaving(false);
      return;
    }

    let res;
    if (initial?.id) {
      res = await supabase.from('products').update(payload).eq('id', initial.id);
    } else {
      res = await supabase.from('products').insert(payload);
    }

    setSaving(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    router.push('/admin/products');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700">
          <FaArrowLeft /> Back
        </Link>
      </div>

      {/* SKU + Name */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={labels.sku} help={labels.sku_help}>
          <input
            type="text" required value={form.sku}
            onChange={(e) => update('sku', e.target.value)}
            className="form-input"
            placeholder="YL-NC-001"
          />
        </Field>
        <Field label={labels.name}>
          <input
            type="text" required value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="form-input"
          />
        </Field>
      </div>

      <Field label={labels.description}>
        <textarea
          rows={3} value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className="form-input"
        />
      </Field>

      {/* Colors */}
      <Field label={labels.colors} help={labels.colors_help}>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((c) => (
            <button
              key={c.value} type="button"
              onClick={() => toggleColor(c.value)}
              className={`rounded-full border px-3 py-1 text-xs ${
                form.colors.includes(c.value)
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-gray-600 hover:border-brand-300'
              }`}
            >
              {c.label}
            </button>
          ))}
          {form.colors.filter((c) => !colorOptions.some((o) => o.value === c)).map((c) => (
            <span key={c} className="inline-flex items-center gap-1 rounded-full border border-brand-500 bg-brand-50 px-3 py-1 text-xs text-brand-700">
              {c}
              <button type="button" onClick={() => toggleColor(c)} className="text-brand-500">×</button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text" value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomColor(); } }}
            className="form-input max-w-[200px]"
            placeholder={labels.custom_color}
          />
          <button type="button" onClick={addCustomColor} className="rounded-md bg-gray-100 px-3 text-sm hover:bg-gray-200">
            {labels.add_color}
          </button>
        </div>
      </Field>

      {/* Box / weight / CBM */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={labels.box_quantity}>
          <input type="number" min={0} step={1} value={form.box_quantity}
            onChange={(e) => update('box_quantity', Number(e.target.value))} className="form-input" />
        </Field>
        <Field label={labels.weight_g}>
          <input type="number" min={0} step={0.001} value={form.weight_g}
            onChange={(e) => update('weight_g', Number(e.target.value))} className="form-input" />
        </Field>
        <Field label={labels.cbm}>
          <input type="number" min={0} step={0.0001} value={form.cbm}
            onChange={(e) => update('cbm', Number(e.target.value))} className="form-input" />
        </Field>
      </div>

      {/* Categories */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={labels.category}>
          <select
            value={form.category_id}
            onChange={(e) => update('category_id', e.target.value)}
            className="form-input"
          >
            <option value="">—</option>
            {rootCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name_zh} / {c.name_en}</option>
            ))}
          </select>
        </Field>
        <Field label={labels.subcategory}>
          <select
            value={form.category_id}
            onChange={(e) => update('category_id', e.target.value)}
            className="form-input"
            disabled={subCategories.length === 0}
          >
            <option value="">{subCategories.length === 0 ? '—' : '—'}</option>
            {subCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name_zh} / {c.name_en}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Images */}
      <Field label={labels.images} help={labels.images_help}>
        <input
          ref={fileRef}
          type="file" accept="image/*" multiple
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          className="block text-sm"
          disabled={uploading}
        />
        {uploading && <p className="mt-1 text-xs text-gray-500">Uploading…</p>}
        {form.images.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {form.images.map((url, i) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                <img src={url} alt={`img-${i}`} className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-gold px-1 text-[9px] text-white">Cover</span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-1 top-1 rounded bg-white/80 p-1 text-red-500 hover:bg-white"
                >
                  <FaTrash className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Field>

      {/* Toggles */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_featured}
            onChange={(e) => update('is_featured', e.target.checked)} />
          {labels.featured}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_published}
            onChange={(e) => update('is_published', e.target.checked)} />
          {labels.published}
        </label>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving || uploading} className="btn-primary">
          {saving ? labels.updating : labels.submit}
        </button>
        <Link href="/admin/products" className="btn-ghost">
          {labels.cancel}
        </Link>
      </div>
    </form>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
      {help && <p className="mt-1 text-xs text-gray-400">{help}</p>}
    </div>
  );
}
