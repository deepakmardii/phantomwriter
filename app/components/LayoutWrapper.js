'use client';
import { useAuth } from '../providers/AuthProvider';
import Navbar from './Navbar';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <div className="flex min-h-screen">
      {user && !isAdminRoute && <Navbar />}
      <main
        className={`flex-1 transition-[margin] duration-300 ease-in-out
          ${user && !isAdminRoute ? 'lg:ml-64' : ''}
          p-4 lg:p-8`}
      >
        {children}
      </main>
    </div>
  );
}
