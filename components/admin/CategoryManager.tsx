'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/types';
import { FaPlus, FaPen, FaTrash, FaCheck, FaXmark, FaGripVertical, FaChevronDown } from 'react-icons/fa6';

interface Props {
  initial: Category[];
  bucketName?: string;
}

interface DraftRow {
  id?: string;
  slug: string;
  name_zh: string;
  name_en: string;
  parent_id: string | null;
  image_url: string | null;
  is_published: boolean;
  sort_order: number;
}

const BUCKET = 'product-images'; // reuse the same bucket for category thumbnails

export default function CategoryManager({ initial }: Props) {
  const supabase = createClient();
  const [rows, setRows] = useState<Category[]>(initial);
  const [editing, setEditing] = useState<DraftRow | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initial.filter((c) => !c.parent_id).map((c) => [c.id, true])),
  );
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => setRows(initial), [initial]);

  const roots = useMemo(() => rows.filter((r) => !r.parent_id).sort(bySort), [rows]);
  const childrenOf = (id: string | null) => rows.filter((r) => r.parent_id === id).sort(bySort);

  function bySort(a: Category, b: Category) {
    return a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at);
  }

  function startNew(parent: string | null = null) {
    setEditing({
      slug: '',
      name_zh: '',
      name_en: '',
      parent_id: parent,
      image_url: null,
      is_published: true,
      sort_order: (parent ? childrenOf(parent) : roots).length,
    });
  }

  function startEdit(c: Category) {
    setEditing({ ...c });
  }

  function cancel() {
    setEditing(null);
    setError(null);
  }

  async function saveDraft() {
    if (!editing) return;
    setError(null);
    if (!editing.slug.trim() || !editing.name_zh.trim()) {
      setError('Slug and Chinese name are required.');
      return;
    }
    const slug = editing.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    const payload = {
      slug,
      name_zh: editing.name_zh.trim(),
      name_en: editing.name_en.trim(),
      parent_id: editing.parent_id,
      image_url: editing.image_url,
      is_published: editing.is_published,
      sort_order: editing.sort_order,
    };
    let res;
    if (editing.id) {
      res = await supabase.from('categories').update(payload).eq('id', editing.id);
    } else {
      res = await supabase.from('categories').insert(payload).select('*').single();
    }
    if (res.error) {
      setError(res.error.message);
      return;
    }
    if (editing.id) {
      setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, ...payload } as Category : x)));
    } else if (res.data) {
      setRows((r) => [...r, res.data as Category]);
      if (res.data.parent_id) setExpanded((e) => ({ ...e, [res.data.parent_id]: true }));
    }
    setEditing(null);
  }

  async function remove(c: Category) {
    if (!confirm(`Delete "${c.name_zh}"? Sub-categories will be unlinked (not deleted).`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', c.id);
    if (error) {
      setError(error.message);
      return;
    }
    setRows((r) =>
      r.filter((x) => x.id !== c.id).map((x) => (x.parent_id === c.id ? { ...x, parent_id: null } : x)),
    );
  }

  async function uploadImage(file: File) {
    if (!editing) return;
    const ext = file.name.split('.').pop();
    const path = `cat-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
    });
    if (error) {
      setError(error.message);
      return;
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    setEditing((d) => (d ? { ...d, image_url: data.publicUrl } : d));
  }

  // ---- Drag & drop reorder (within same parent level) ---------------------
  function onDragStart(id: string) {
    setDragId(id);
  }
  function onDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
  }
  async function onDrop(targetId: string, parentId: string | null) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const siblings = childrenOf(parentId);
    const fromIdx = siblings.findIndex((s) => s.id === dragId);
    const toIdx = siblings.findIndex((s) => s.id === targetId);
    if (fromIdx === -1 || toIdx === -1) {
      setDragId(null);
      return;
    }
    const reordered = [...siblings];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updates = reordered.map((c, i) => ({ id: c.id, sort_order: i }));
    // optimistic
    setRows((r) =>
      r.map((c) => {
        const idx = updates.findIndex((u) => u.id === c.id);
        return idx >= 0 ? { ...c, sort_order: updates[idx].sort_order } : c;
      }),
    );
    setDragId(null);
    // persist batch
    await Promise.all(
      updates.map((u) => supabase.from('categories').update({ sort_order: u.sort_order }).eq('id', u.id)),
    );
  }

  // ---- Render -------------------------------------------------------------
  function Row({ c, level }: { c: Category; level: number }) {
    const kids = childrenOf(c.id);
    const isExpanded = expanded[c.id];
    return (
      <li>
        <div
          draggable
          onDragStart={() => onDragStart(c.id)}
          onDragOver={(e) => onDragOver(e, c.id)}
          onDrop={() => onDrop(c.id, c.parent_id)}
          className={`flex items-center gap-2 rounded-md border border-gray-100 bg-white px-3 py-2 ${
            dragId === c.id ? 'opacity-50' : 'hover:bg-gray-50'
          }`}
          style={{ marginInlineStart: `${level * 1.5}rem` }}
        >
          <FaGripVertical className="cursor-grab text-gray-300" />

          <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-md bg-brand-50">
            {c.image_url ? (
              <img src={c.image_url} alt={c.name_zh} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] text-brand-400">
                {c.name_zh.slice(0, 1)}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => kids.length > 0 && setExpanded((e) => ({ ...e, [c.id]: !e[c.id] }))}
            className={`text-gray-400 ${kids.length > 0 ? 'hover:text-brand-600' : 'invisible'}`}
          >
            <FaChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">{c.name_zh}</p>
            <p className="text-xs text-gray-400">
              <span className="font-mono">{c.slug}</span>
              {c.name_en && <span className="ms-2">· {c.name_en}</span>}
            </p>
          </div>

          <span
            className={`rounded px-2 py-0.5 text-[10px] ${
              c.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {c.is_published ? 'Live' : 'Hidden'}
          </span>

          <button onClick={() => startNew(c.id)} className="rounded p-1.5 text-gray-500 hover:bg-brand-50 hover:text-brand-700" title="Add sub-category">
            <FaPlus />
          </button>
          <button onClick={() => startEdit(c)} className="rounded p-1.5 text-gray-500 hover:bg-brand-50 hover:text-brand-700" title="Edit">
            <FaPen />
          </button>
          <button onClick={() => remove(c)} className="rounded p-1.5 text-red-500 hover:bg-red-50" title="Delete">
            <FaTrash />
          </button>
        </div>

        {isExpanded && kids.length > 0 && (
          <ul className="mt-1 space-y-1">
            {kids.map((k) => (
              <Row key={k.id} c={k} level={level + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Tip: drag the grip handle to reorder. Adding a sub-category keeps the parent expanded.
        </p>
        <button onClick={() => startNew(null)} className="btn-primary inline-flex items-center gap-1">
          <FaPlus /> Add root category
        </button>
      </div>

      {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {roots.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-400">
          No categories yet. Click “Add root category” to start.
        </p>
      ) : (
        <ul className="space-y-1">
          {roots.map((r) => (
            <Row key={r.id} c={r} level={0} />
          ))}
        </ul>
      )}

      {/* Editor drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30">
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editing.id ? 'Edit category' : 'New category'}
                {editing.parent_id && (
                  <span className="ms-2 text-xs text-gray-400">
                    (sub of {rows.find((r) => r.id === editing.parent_id)?.name_zh ?? '—'})
                  </span>
                )}
              </h2>
              <button onClick={cancel} className="text-gray-400 hover:text-gray-700">
                <FaXmark />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="form-label">Slug (URL)</label>
                <input
                  className="form-input"
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  placeholder="phone-charm"
                />
              </div>
              <div>
                <label className="form-label">中文名称</label>
                <input
                  className="form-input"
                  value={editing.name_zh}
                  onChange={(e) => setEditing({ ...editing, name_zh: e.target.value })}
                  placeholder="手机链"
                />
              </div>
              <div>
                <label className="form-label">English name</label>
                <input
                  className="form-input"
                  value={editing.name_en}
                  onChange={(e) => setEditing({ ...editing, name_en: e.target.value })}
                  placeholder="Phone Charm"
                />
              </div>
              <div>
                <label className="form-label">Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
                  className="block text-sm"
                />
                {editing.image_url && (
                  <div className="mt-2 h-24 w-24 overflow-hidden rounded-lg border border-gray-200">
                    <img src={editing.image_url} alt="preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.is_published}
                  onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })}
                />
                Published (visible on storefront)
              </label>
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={saveDraft} className="btn-primary inline-flex items-center gap-1">
                <FaCheck /> Save
              </button>
              <button onClick={cancel} className="btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
