/**
 * Seed script — bulk-insert demo products into Supabase.
 *
 * Usage:
 *   1. Copy .env.local.example to .env.local and fill in your Supabase keys.
 *   2. Run:  npm run seed
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) — the anon key cannot
 * insert because of Row Level Security. Falls back to anon key with a warning.
 *
 * Idempotent: re-running updates existing rows (upsert on SKU).
 * Run the SQL migration first: supabase/migrations/0001_init.sql
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Minimal .env.local loader (no dotenv dependency)
// ---------------------------------------------------------------------------
function loadEnvLocal() {
  const envPath = resolve(ROOT, '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnvLocal();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
let KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  console.error(
    '\n✗ Missing Supabase configuration.\n' +
      '  1. Copy .env.local.example to .env.local\n' +
      '  2. Fill in NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY\n' +
      '  (Project Settings → API in the Supabase dashboard)\n',
  );
  process.exit(1);
}

const usingServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
if (!usingServiceRole) {
  console.warn('⚠ Using anon key — inserts will fail if RLS is enabled. Prefer SUPABASE_SERVICE_ROLE_KEY.');
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

const supabase = {
  from(table) {
    const base = `${URL}/rest/v1/${table}`;
    return {
      select: async (cols) => {
        const res = await fetch(`${base}?select=${encodeURIComponent(cols)}`, { headers });
        if (!res.ok) throw new Error(`REST ${res.status}: ${await res.text()}`);
        return { data: await res.json(), error: null };
      },
      upsert: async (rows, opts = {}) => {
        const url = opts.onConflict ? `${base}?on_conflict=${opts.onConflict}` : base;
        const res = await fetch(url, {
          method: 'POST',
          headers: { ...headers, Prefer: 'return=representation,resolution=merge-duplicates' },
          body: JSON.stringify(rows),
        });
        if (!res.ok) return { data: null, error: { message: `REST ${res.status}: ${await res.text()}` } };
        return { data: await res.json(), error: null };
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Demo image generator (same host is allow-listed in next.config.mjs)
// ---------------------------------------------------------------------------
const img = (prompt, size = 'square') =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${size}`;

// ---------------------------------------------------------------------------
// Demo products — 2 per root category (14 total), all featured/published
// ---------------------------------------------------------------------------
const demoProducts = [
  // 手机链 Phone Charm
  { sku: 'YL-PC-001', name: '彩虹串珠手机链 / Rainbow Beaded Phone Charm', cat: 'phone-charm-beaded',
    colors: ['gold', 'silver', 'rose_gold'], box_quantity: 500, weight_g: 28, cbm: 0.012,
    prompt: 'colorful rainbow beaded phone charm strap with gold clasps, product photography on white background' },
  { sku: 'YL-PC-002', name: '手工编织手机绳 / Handwoven Phone Lanyard', cat: 'phone-charm-woven',
    colors: ['black', 'white', 'red'], box_quantity: 400, weight_g: 22, cbm: 0.010,
    prompt: 'handwoven braided phone lanyard wrist strap in multiple colors, flat lay product photo' },
  // 脚链 Anklet
  { sku: 'YL-AK-001', name: '波西米亚脚链 / Bohemian Anklet', cat: 'anklet',
    colors: ['gold', 'silver'], box_quantity: 600, weight_g: 12, cbm: 0.008,
    prompt: 'delicate bohemian gold anklet with tiny charms, jewelry product photography on cream background' },
  { sku: 'YL-AK-002', name: '串珠脚链 / Beaded Anklet', cat: 'anklet',
    colors: ['blue', 'green', 'white'], box_quantity: 600, weight_g: 10, cbm: 0.008,
    prompt: 'blue and white beaded beach anklet, summer jewelry product photo, soft shadows' },
  // 手链 Bracelet
  { sku: 'YL-BR-001', name: '手工编织手链 / Handmade Braided Bracelet', cat: 'bracelet-handmade',
    colors: ['red', 'black', 'gold'], box_quantity: 500, weight_g: 15, cbm: 0.009,
    prompt: 'handmade braided friendship bracelet with gold bead accent, product photography' },
  { sku: 'YL-BR-002', name: '潘多拉风格手链 / Pandora Style Charm Bracelet', cat: 'bracelet-pandora',
    colors: ['silver', 'rose_gold'], box_quantity: 200, weight_g: 45, cbm: 0.015,
    prompt: 'silver pandora style charm bracelet with crystal beads, luxury jewelry product photo' },
  // 项链 Necklace
  { sku: 'YL-NC-001', name: '珍珠锁骨链 / Pearl Choker Necklace', cat: 'necklace',
    colors: ['white', 'gold'], box_quantity: 300, weight_g: 25, cbm: 0.012,
    prompt: 'elegant faux pearl choker necklace with gold clasp, jewelry product photography on white' },
  { sku: 'YL-NC-002', name: '合金吊坠项链 / Alloy Pendant Necklace', cat: 'necklace',
    colors: ['gold', 'silver'], box_quantity: 400, weight_g: 18, cbm: 0.010,
    prompt: 'minimalist gold pendant necklace with geometric charm, studio jewelry photo' },
  // 戒指 Ring
  { sku: 'YL-RG-001', name: '开口调节戒指 / Adjustable Open Ring', cat: 'ring',
    colors: ['gold', 'silver', 'rose_gold'], box_quantity: 1000, weight_g: 5, cbm: 0.006,
    prompt: 'set of minimalist adjustable gold and silver open rings, jewelry product photography' },
  { sku: 'YL-RG-002', name: '锆石镶嵌戒指 / Zircon Studded Ring', cat: 'ring',
    colors: ['silver', 'gold'], box_quantity: 800, weight_g: 6, cbm: 0.006,
    prompt: 'silver ring with sparkling zircon stone, macro jewelry product photo, black velvet' },
  // 耳环 Earring
  { sku: 'YL-ER-001', name: '珍珠耳钉 / Pearl Stud Earrings', cat: 'earring',
    colors: ['white', 'gold'], box_quantity: 800, weight_g: 4, cbm: 0.005,
    prompt: 'classic pearl stud earrings with gold posts, elegant jewelry product photo' },
  { sku: 'YL-ER-002', name: '长款流苏耳环 / Long Tassel Earrings', cat: 'earring',
    colors: ['red', 'black', 'white'], box_quantity: 600, weight_g: 8, cbm: 0.007,
    prompt: 'long colorful thread tassel statement earrings, fashion jewelry product photography' },
  // 胸针 Brooch
  { sku: 'YL-BC-001', name: '水钻花卉胸针 / Rhinestone Flower Brooch', cat: 'brooch',
    colors: ['gold', 'silver'], box_quantity: 400, weight_g: 14, cbm: 0.009,
    prompt: 'gold rhinestone flower brooch pin with crystal petals, luxury jewelry product photo' },
  { sku: 'YL-BC-002', name: '珍珠复古胸针 / Vintage Pearl Brooch', cat: 'brooch',
    colors: ['white', 'gold'], box_quantity: 300, weight_g: 16, cbm: 0.010,
    prompt: 'vintage style pearl brooch with antique gold finish, jewelry product photography' },
];

async function loadCategoryMap() {
  const { data, error } = await supabase.from('categories').select('id, slug');
  if (error) throw new Error(`Failed to load categories: ${error.message}\n(请先在 Supabase SQL Editor 运行 supabase/migrations/0001_init.sql)`);
  return new Map(data.map((c) => [c.slug, c.id]));
}

async function main() {
  console.log('→ Loading categories…');
  const catMap = await loadCategoryMap();

  const rows = demoProducts.map((p, i) => ({
    sku: p.sku,
    name: p.name,
    description: null,
    colors: p.colors,
    box_quantity: p.box_quantity,
    weight_g: p.weight_g,
    cbm: p.cbm,
    category_id: catMap.get(p.cat) ?? null,
    images: [img(p.prompt), img(`${p.prompt}, alternate angle`)],
    is_featured: true,
    is_published: true,
    sort_order: i,
  }));

  console.log(`→ Upserting ${rows.length} demo products…`);
  const { error } = await supabase
    .from('products')
    .upsert(rows, { onConflict: 'sku' });
  if (error) {
    console.error(`\n✗ Upsert failed: ${error.message}\n`);
    if (error.message.includes('row-level security')) {
      console.error('  提示：请使用 SUPABASE_SERVICE_ROLE_KEY（service_role 绕过 RLS）。');
    }
    process.exit(1);
  }

  console.log(`✓ Done — ${rows.length} demo products inserted/updated.`);
  console.log('  打开前台首页即可看到「产品推荐」区域。\n');
}

main().catch((e) => {
  console.error(`\n✗ ${e.message}\n`);
  process.exit(1);
});
