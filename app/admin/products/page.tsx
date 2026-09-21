import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminShell from '@/components/admin/AdminShell';
import ProductList from '@/components/admin/ProductList';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <AdminShell title="Products" active="products">
      <ProductList products={(data as Product[]) || []} />
    </AdminShell>
  );
}
