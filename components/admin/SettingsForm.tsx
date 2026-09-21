'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { SiteSettings } from '@/lib/types';
import { FaCheck, FaUpload } from 'react-icons/fa6';

interface Props {
  initial: SiteSettings;
}

const BUCKET = 'product-images';

export default function SettingsForm({ initial }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [form, setForm] = useState<SiteSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setOk(false);
  }

  async function uploadBanner(file: File) {
    setUploading(true);
    setError(null);
    const ext = file.name.split('.').pop();
    const path = `banner-${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
    });
    setUploading(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    update('banner_image_url', data.publicUrl);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setOk(false);
    const { error } = await supabase
      .from('site_settings')
      .update({
        company_name_zh: form.company_name_zh,
        company_name_en: form.company_name_en,
        intro_zh: form.intro_zh,
        intro_en: form.intro_en,
        banner_image_url: form.banner_image_url,
        whatsapp: form.whatsapp,
        wechat: form.wechat,
        email: form.email,
      })
      .eq('id', form.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setOk(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Company</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label">公司名称 (中)</label>
            <input
              className="form-input"
              value={form.company_name_zh}
              onChange={(e) => update('company_name_zh', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Company name (EN)</label>
            <input
              className="form-input"
              value={form.company_name_en}
              onChange={(e) => update('company_name_en', e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label">公司介绍 (中)</label>
            <textarea
              rows={5}
              className="form-input"
              value={form.intro_zh}
              onChange={(e) => update('intro_zh', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Company intro (EN)</label>
            <textarea
              rows={5}
              className="form-input"
              value={form.intro_en}
              onChange={(e) => update('intro_en', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Home banner</h3>
        <div className="flex items-start gap-4">
          <div className="h-24 w-40 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            {form.banner_image_url ? (
              <img src={form.banner_image_url} alt="banner" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-400">No banner</div>
            )}
          </div>
          <div className="flex-1">
            <label className="form-label">Upload new banner</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && uploadBanner(e.target.files[0])}
              className="block text-sm"
              disabled={uploading}
            />
            {uploading && <p className="mt-1 text-xs text-gray-500">Uploading…</p>}
            {form.banner_image_url && (
              <button
                type="button"
                onClick={() => update('banner_image_url', null)}
                className="mt-2 text-xs text-red-500 hover:underline"
              >
                Remove banner
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Contact</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="form-label">WhatsApp</label>
            <input
              className="form-input"
              value={form.whatsapp}
              onChange={(e) => update('whatsapp', e.target.value)}
              placeholder="+86 19548146867"
            />
          </div>
          <div>
            <label className="form-label">WeChat</label>
            <input
              className="form-input"
              value={form.wechat}
              onChange={(e) => update('wechat', e.target.value)}
              placeholder="+86 19548146867"
            />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input
              className="form-input"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="257491320@qq.com"
            />
          </div>
        </div>
      </section>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {ok && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">Saved. Storefront refreshed.</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving || uploading} className="btn-primary inline-flex items-center gap-1">
          <FaCheck /> {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </form>
  );
}
