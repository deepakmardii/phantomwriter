'use client';
import { useAuth } from '../providers/AuthProvider';
import Navbar from './Navbar';

export default function LayoutWrapper({ children }) {
  const { user } = useAuth();

  return (
    <div className="flex">
      {user && <Navbar />}
      <main className={`flex-1 min-h-screen ${user ? 'ml-64' : ''}`}>{children}</main>
    </div>
  );
}
