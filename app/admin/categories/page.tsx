import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminShell from '@/components/admin/AdminShell';
import CategoryManager from '@/components/admin/CategoryManager';
import type { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Categories · Admin',
};

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data } = await supabase.from('categories').select('*').order('sort_order');

  return (
    <AdminShell title="Categories" active="categories">
      <CategoryManager initial={(data as Category[]) || []} />
    </AdminShell>
  );
}
