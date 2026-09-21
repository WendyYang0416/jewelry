import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

interface StatCardProps {
  label: string;
  value: number | string;
  accent?: string;
  href?: string;
}

function StatCard({ label, value, accent = 'text-brand-700', href }: StatCardProps) {
  const inner = (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  // Counts
  const [productsAll, productsPub, productsFeat, cats, inquiriesUnread, recentInquiries] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_featured', true),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('inquiries').select('id, name, contact, message, is_read, created_at, products(sku, name_zh, name_en)')
      .order('created_at', { ascending: false }).limit(5),
  ]);

  const recent = (recentInquiries.data as Array<{
    id: string; name: string | null; contact: string | null; message: string | null;
    is_read: boolean; created_at: string;
    products: { sku: string; name_zh: string; name_en: string | null }[] | null;
  }>) || [];
  const inqProduct = (p: (typeof recent)[number]['products']) => (p && p[0]) || null;

  return (
    <AdminShell title="Dashboard" active="dashboard">
      <h1 className="text-xl font-bold text-gray-800">数据看板</h1>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="产品总数" value={productsAll.count ?? 0} href="/admin/products" />
        <StatCard label="已上架" value={productsPub.count ?? 0} accent="text-green-600" href="/admin/products" />
        <StatCard label="首页推荐" value={productsFeat.count ?? 0} accent="text-gold" href="/admin/products" />
        <StatCard label="分类数" value={cats.count ?? 0} href="/admin/categories" />
        <StatCard
          label="未读询价"
          value={inquiriesUnread.count ?? 0}
          accent="text-red-600"
          href="/admin/inquiries"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/products/new" className="btn-primary">+ 新增产品</Link>
        <Link href="/admin/products" className="btn-ghost">产品列表</Link>
        <Link href="/admin/categories" className="btn-ghost">分类管理</Link>
        <Link href="/admin/settings" className="btn-ghost">网站设置</Link>
        <Link href="/admin/inquiries" className="btn-ghost">询价收件箱</Link>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-gray-700">最近询价</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {recent.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">暂无询价记录</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((inq) => (
              <li key={inq.id} className="flex items-start gap-3 px-4 py-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${inq.is_read ? 'bg-gray-200' : 'bg-red-500'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm font-medium text-gray-800">{inq.name || '匿名'}</span>
                    <span className="text-xs text-gray-400">{inq.contact}</span>
                    {inqProduct(inq.products) && (
                      <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[11px] text-brand-700">
                        {inqProduct(inq.products)!.sku} · {inqProduct(inq.products)!.name_en || inqProduct(inq.products)!.name_zh}
                      </span>
                    )}
                    <span className="ms-auto text-[11px] text-gray-400">
                      {new Date(inq.created_at).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  {inq.message && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600">{inq.message}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
