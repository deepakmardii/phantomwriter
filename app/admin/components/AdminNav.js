'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navigation = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Posts', href: '/admin/posts' },
  { name: 'Feedback', href: '/admin/feedback' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 min-h-screen bg-gray-800 text-white p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>
      <div className="flex flex-col h-[calc(100vh-8rem)] justify-between">
        <div className="space-y-1">
          {navigation.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-2 rounded-md ${
                  isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="w-full px-4 py-2 mt-4 text-gray-300 hover:bg-gray-700 rounded-md text-left"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
