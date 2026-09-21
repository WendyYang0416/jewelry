import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminShell from '@/components/admin/AdminShell';
import InquiryList from '@/components/admin/InquiryList';
import type { Inquiry } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Inquiries · Admin',
};

export default async function AdminInquiriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <AdminShell title="Inquiries" active="inquiries">
      <InquiryList initial={(data as Inquiry[]) || []} />
    </AdminShell>
  );
}
