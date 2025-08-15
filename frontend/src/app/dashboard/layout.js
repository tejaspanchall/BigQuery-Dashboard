'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChartBarIcon,
  ArrowsRightLeftIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import useAuthStore from '@/lib/store/auth';
import { useState } from 'react';

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard/overview',
    icon: ChartBarIcon,
  },
  {
    name: 'Platform Comparison',
    href: '/dashboard/platform-comparison',
    icon: ArrowsRightLeftIcon,
  },
  {
    name: 'Campaign Drilldown',
    href: '/dashboard/campaign-drilldown',
    icon: MagnifyingGlassIcon,
  },
  {
    name: 'Orders & Refund',
    href: '/dashboard/orders-refund',
    icon: ShoppingBagIcon,
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-primary-100 fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/dashboard/overview" className="hover:opacity-80 transition-opacity">
                <h1 className="text-lg sm:text-xl font-semibold text-primary-900">
                  BigQuery Dashboard
                </h1>
              </Link>
            </div>

            {/* Center Navigation - Desktop */}
            <div className="hidden lg:flex lg:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group inline-flex items-center px-1 text-sm font-medium transition-colors duration-200 h-16 ${
                      isActive
                        ? 'text-primary-900'
                        : 'text-primary-500 hover:text-primary-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 mr-2" />
                      <span>{item.name}</span>
                    </div>
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary-900' 
                        : 'bg-transparent group-hover:bg-primary-300'
                    }`} />
                  </Link>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-primary-500 hover:text-primary-900 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Logout Button - Desktop */}
            <div className="hidden lg:flex lg:items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} border-t border-primary-100`}>
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block rounded-lg py-2 px-3 text-base font-medium ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-primary-500 hover:bg-primary-50 hover:text-primary-900'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full mt-2 flex items-center rounded-lg py-2 px-3 text-base font-medium text-primary-500 hover:bg-primary-50 hover:text-primary-900"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-10 px-4 sm:px-6 lg:px-20">
        {children}
      </main>
    </div>
  );
} 