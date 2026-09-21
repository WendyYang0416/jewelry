import Link from 'next/link';
import { FaBox, FaLayerGroup, FaGear, FaRightFromBracket, FaHouse } from 'react-icons/fa6';

interface Props {
  title: string;
  active: 'dashboard' | 'products' | 'categories' | 'settings';
  children: React.ReactNode;
}

export default function AdminShell({ title, active, children }: Props) {
  const nav = [
    { key: 'products', label: 'Products', href: '/admin/products', icon: <FaBox /> },
    { key: 'categories', label: 'Categories', href: '/admin/categories', icon: <FaLayerGroup /> },
    { key: 'settings', label: 'Settings', href: '/admin/settings', icon: <FaGear /> },
  ] as const;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 flex-shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col">
        <div className="border-b border-gray-100 px-4 py-5">
          <p className="text-sm font-bold text-brand-700">Yiling Admin</p>
          <p className="text-xs text-gray-400">Yiwu Yiling Accessories</p>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-3 text-sm">
          {nav.map((n) => (
            <Link
              key={n.key}
              href={n.href}
              className={`flex items-center gap-2 rounded-md px-3 py-2 ${
                active === n.key ? 'bg-brand-50 font-medium text-brand-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {n.icon}
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-2">
          <Link href="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-gray-500 hover:bg-gray-50">
            <FaHouse /> View store
          </Link>
          <form action="/admin/logout" method="post">
            <button type="submit" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-gray-500 hover:bg-gray-50">
              <FaRightFromBracket /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-gray-50">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </header>
        <div className="px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
