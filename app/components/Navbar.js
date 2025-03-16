'use client';
import { useAuth } from '@/app/providers/AuthProvider';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MiniUsageStats from './MiniUsageStats';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    { name: 'Create Post', href: '/dashboard', icon: '📝' },
    { name: 'Post Library', href: '/library', icon: '📚' },
    { name: 'Calendar', href: '/calendar', icon: '📅' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
    { name: 'Feedback', href: '/feedback', icon: '💭' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Logo, Name, and Stats Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-center mb-4">
          <Image
            src="/globe.svg"
            alt="PhantomWriter Logo"
            width={40}
            height={40}
            className="dark:invert"
          />
        </div>
        <h1 className="text-xl font-semibold text-center text-white">PhantomWriter</h1>
        {user && (
          <>
            <p className="mt-2 text-sm text-center text-gray-400">Welcome, {user.name || 'User'}</p>
            <MiniUsageStats />
          </>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-3">
          {menuItems.map(item => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-2 rounded-lg text-white hover:bg-gray-700 transition-colors ${
                  pathname === item.href ? 'bg-gray-700' : ''
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-center text-gray-400 mb-4">
          © 2024 PhantomWriter
          <br />
          All rights reserved
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <span className="mr-2">🚪</span>
          Logout
        </button>
      </div>
    </nav>
  );
}
