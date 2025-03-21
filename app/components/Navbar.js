'use client';
import { useAuth } from '@/app/providers/AuthProvider';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MiniUsageStats from './MiniUsageStats';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const menuItems = [
    { name: 'Create Post', href: '/dashboard', icon: '📝' },
    { name: 'Post Library', href: '/library', icon: '📚' },
    { name: 'Calendar', href: '/calendar', icon: '📅' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
    { name: 'Feedback', href: '/feedback', icon: '💭' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center px-4 z-[100] shadow-sm">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`p-2 rounded-lg mr-4
            ${
              isMobileMenuOpen
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }
            transition-all duration-200`}
          aria-label="Toggle menu"
        >
          <div className="relative w-6 h-5 flex flex-col justify-between">
            <span
              className={`block h-0.5 w-full transform transition-all duration-300 ease-in-out
                ${isMobileMenuOpen ? 'rotate-45 translate-y-2.5 bg-current' : 'bg-current'}`}
            />
            <span
              className={`block h-0.5 w-full transition-all duration-300 ease-in-out
                ${isMobileMenuOpen ? 'opacity-0 bg-current' : 'opacity-100 bg-current'}`}
            />
            <span
              className={`block h-0.5 w-full transform transition-all duration-300 ease-in-out
                ${isMobileMenuOpen ? '-rotate-45 -translate-y-2 bg-current' : 'bg-current'}`}
            />
          </div>
        </button>
        <div className="flex-1 text-center font-semibold text-gray-800">PhantomWriter</div>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[90] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <nav
        className={`fixed left-0 h-screen bg-white border-r border-gray flex flex-col shadow-lg z-[95]
         transform transition-transform duration-300 ease-in-out
         ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
         top-16 lg:top-0
         h-[calc(100vh-4rem)] lg:h-screen
          w-64`}
      >
        {/* Logo, Name, and Stats Section */}
        <div className="p-4 border-b border-gray">
          <div className="flex items-center justify-center mb-4">
            <Image src="/globe.svg" alt="PhantomWriter Logo" width={40} height={40} />
          </div>
          <h1 className="text-xl font-semibold text-center text-gray-800">PhantomWriter</h1>
          {user && (
            <>
              <p className="mt-2 text-sm text-center text-gray-600">
                Welcome, {user.name || 'User'}
              </p>
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
                  className={`flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-orange-500 hover:text-white transition-colors ${
                    pathname === item.href ? 'bg-orange-500 text-white' : ''
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
        <div className="p-4 border-t border-gray">
          <div className="text-xs text-center text-gray-600 mb-4">
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
    </>
  );
}
