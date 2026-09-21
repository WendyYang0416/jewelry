// Shared TypeScript types used across the storefront and admin panel.

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  colors: string[];
  box_quantity: number; // 箱规 PCS
  weight_g: number; // 重量 g
  cbm: number; // 体积 m³
  category_id: string | null;
  images: string[]; // Supabase Storage public URLs
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name_key: string; // i18n key, fallback to name_zh
  name_zh: string;
  name_en: string;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  company_name_zh: string;
  company_name_en: string;
  intro_zh: string;
  intro_en: string;
  banner_image_url: string | null;
  whatsapp: string;
  wechat: string;
  email: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  product_id: string | null;
  sku: string | null;
  name: string;
  contact: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

export const DEFAULT_COLORS = [
  'gold', // 金色
  'silver', // 银色
  'rose_gold', // 玫瑰金
  'black',
  'white',
  'red',
  'blue',
  'green',
] as const;

export type Color = (typeof DEFAULT_COLORS)[number];
