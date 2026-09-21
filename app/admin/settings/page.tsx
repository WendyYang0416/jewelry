import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminShell from '@/components/admin/AdminShell';
import SettingsForm from '@/components/admin/SettingsForm';
import type { SiteSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Settings · Admin',
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data } = await supabase.from('site_settings').select('*').limit(1);
  if (!data || data.length === 0) {
    redirect('/admin');
  }

  return (
    <AdminShell title="Site settings" active="settings">
      <SettingsForm initial={data[0] as SiteSettings} />
    </AdminShell>
  );
}
