import { redirect } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { createClient } from '@/lib/supabase/server';
import AdminShell from '@/components/admin/AdminShell';
import ProductForm from '@/components/admin/ProductForm';
import type { Category, Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const [{ data: prod }, { data: cats }] = await Promise.all([
    supabase.from('products').select('*').eq('id', params.id).single(),
    supabase.from('categories').select('*').order('sort_order'),
  ]);

  if (!prod) redirect('/admin/products');

  const dict = await getDictionary(defaultLocale);
  const colorOptions = (Object.keys(dict.color) as (keyof typeof dict.color)[]).map((k) => ({
    value: k,
    label: dict.color[k],
  }));

  return (
    <AdminShell title={`${dict.admin.edit_product}: ${(prod as Product).sku}`} active="products">
      <ProductForm
        initial={prod as Product}
        categories={(cats as Category[]) || []}
        labels={{
          sku: dict.form.sku, sku_help: dict.form.sku_help,
          name: dict.form.name, description: dict.form.description,
          colors: dict.form.colors, colors_help: dict.form.colors_help,
          custom_color: dict.form.custom_color, add_color: dict.form.add_color,
          box_quantity: dict.form.box_quantity, weight_g: dict.form.weight_g, cbm: dict.form.cbm,
          category: dict.form.category, subcategory: dict.form.subcategory,
          images: dict.form.images, images_help: dict.form.images_help, upload: dict.form.upload,
          featured: dict.form.featured, published: dict.form.published,
          submit: dict.form.submit, updating: dict.form.updating, cancel: dict.admin.cancel,
        }}
        colorOptions={colorOptions}
      />
    </AdminShell>
  );
}
