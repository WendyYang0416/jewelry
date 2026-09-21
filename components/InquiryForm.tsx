'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  productId: string;
  sku: string;
  t: {
    title: string;
    name: string;
    contact: string;
    message: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
  };
}

export default function InquiryForm({ productId, sku, t }: Props) {
  const [form, setForm] = useState({ name: '', contact: '', message: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Reset when navigating between products (client-side).
  useEffect(() => {
    setForm({ name: '', contact: '', message: '' });
    setState('idle');
    setError(null);
  }, [productId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    setError(null);
    // Create client lazily so this form also works when the page is prerendered.
    const supabase = createClient();
    const { error } = await supabase.from('inquiries').insert({
      product_id: productId,
      sku,
      name: form.name.trim(),
      contact: form.contact.trim(),
      message: form.message.trim() || null,
    });
    if (error) {
      setState('idle');
      setError(t.error);
      return;
    }
    setForm({ name: '', contact: '', message: '' });
    setState('done');
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-xl border border-brand-100 bg-white p-4">
      <p className="text-sm font-semibold text-brand-800">{t.title}</p>
      <p className="mt-0.5 font-mono text-[11px] text-gray-400">{sku}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input
          type="text" required value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder={t.name}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <input
          type="text" required value={form.contact}
          onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
          placeholder={t.contact}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <textarea
        rows={3} value={form.message}
        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        placeholder={t.message}
        className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />

      {error && <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
      {state === 'done' && (
        <p className="mt-2 rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">{t.success}</p>
      )}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-3 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
      >
        {state === 'sending' ? t.sending : t.submit}
      </button>
    </form>
  );
}
