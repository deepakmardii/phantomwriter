'use client';
import { useAuth } from '../providers/AuthProvider';
import Navbar from './Navbar';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <div className="flex">
      {user && !isAdminRoute && <Navbar />}
      <main className={`flex-1 min-h-screen ${user && !isAdminRoute ? 'ml-64' : ''}`}>
        {children}
      </main>
    </div>
  );
}
