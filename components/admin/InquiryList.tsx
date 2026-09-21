'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Inquiry } from '@/lib/types';
import { FaTrash, FaEnvelopeOpen, FaEnvelope } from 'react-icons/fa6';

export default function InquiryList({ initial }: { initial: Inquiry[] }) {
  const supabase = createClient();
  const [rows, setRows] = useState(initial);
  const [onlyUnread, setOnlyUnread] = useState(false);

  const filtered = useMemo(
    () => (onlyUnread ? rows.filter((r) => !r.is_read) : rows),
    [rows, onlyUnread],
  );

  async function toggleRead(r: Inquiry) {
    const { error } = await supabase.from('inquiries').update({ is_read: !r.is_read }).eq('id', r.id);
    if (error) return alert(error.message);
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, is_read: !x.is_read } : x)));
  }

  async function remove(r: Inquiry) {
    if (!confirm(`Delete inquiry from "${r.name}" (${r.contact})?`)) return;
    const { error } = await supabase.from('inquiries').delete().eq('id', r.id);
    if (error) return alert(error.message);
    setRows((rs) => rs.filter((x) => x.id !== r.id));
  }

  const unreadCount = rows.filter((r) => !r.is_read).length;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOnlyUnread((v) => !v)}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            onlyUnread ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Unread only ({unreadCount})
        </button>
        <span className="text-xs text-gray-400">Newest first</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Message</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-400">
                  No inquiries yet.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className={`align-top hover:bg-gray-50 ${r.is_read ? 'opacity-60' : ''}`}>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-600">{r.sku ?? '—'}</td>
                  <td className="px-3 py-2 font-medium">{r.name}</td>
                  <td className="px-3 py-2">
                    <a
                      href={`https://wa.me/${r.contact.replace(/[^\d]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-700 hover:underline"
                      title="Reply via WhatsApp"
                    >
                      {r.contact}
                    </a>
                  </td>
                  <td className="max-w-xs px-3 py-2 text-xs text-gray-600">{r.message ?? '—'}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleRead(r)}
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${
                        r.is_read ? 'bg-gray-100 text-gray-500' : 'bg-brand-100 text-brand-700'
                      }`}
                    >
                      {r.is_read ? <FaEnvelopeOpen /> : <FaEnvelope />}
                      {r.is_read ? 'Read' : 'New'}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => remove(r)} className="rounded p-1.5 text-red-500 hover:bg-red-50">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
