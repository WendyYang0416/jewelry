import './admin.css';

export const metadata = {
  title: 'Admin · Yiwu Yiling Accessories',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">{children}</div>;
}
