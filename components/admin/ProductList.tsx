'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/types';
import { FaPlus, FaPen, FaTrash, FaStar } from 'react-icons/fa6';

export default function ProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState(products);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((p) => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q));
  }, [rows, query]);

  async function toggle(p: Product, field: 'is_published' | 'is_featured') {
    const supabase = createClient();
    const { error } = await supabase.from('products').update({ [field]: !p[field] }).eq('id', p.id);
    if (error) return alert(error.message);
    setRows((r) => r.map((x) => (x.id === p.id ? { ...x, [field]: !x[field] } : x)));
  }

  async function remove(p: Product) {
    if (!confirm(`Delete ${p.sku}? This cannot be undone.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) return alert(error.message);
    setRows((r) => r.filter((x) => x.id !== p.id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Search by SKU or name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <FaPlus /> New product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Box (PCS)</th>
              <th className="px-3 py-2">Weight (g)</th>
              <th className="px-3 py-2">CBM</th>
              <th className="px-3 py-2">Featured</th>
              <th className="px-3 py-2">Published</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-6 text-center text-gray-400">No products yet.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-xs text-gray-600">{p.sku}</td>
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2 text-gray-600">{p.box_quantity}</td>
                  <td className="px-3 py-2 text-gray-600">{p.weight_g}</td>
                  <td className="px-3 py-2 text-gray-600">{p.cbm}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => toggle(p, 'is_featured')}
                      className={`rounded px-2 py-0.5 text-xs ${p.is_featured ? 'bg-gold text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <FaStar className="inline" /> {p.is_featured ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => toggle(p, 'is_published')}
                      className={`rounded px-2 py-0.5 text-xs ${p.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_published ? 'Live' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-1">
                      <Link href={`/admin/products/${p.id}`} className="rounded p-1.5 text-gray-500 hover:bg-brand-50 hover:text-brand-700">
                        <FaPen />
                      </Link>
                      <button onClick={() => remove(p)} className="rounded p-1.5 text-red-500 hover:bg-red-50">
                        <FaTrash />
                      </button>
                    </div>
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
