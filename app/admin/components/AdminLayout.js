'use client';

import { AdminProvider } from '../context/AdminContext';
import AdminNav from './AdminNav';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminProvider>
        <div className="flex">
          <AdminNav />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </AdminProvider>
    </div>
  );
}
