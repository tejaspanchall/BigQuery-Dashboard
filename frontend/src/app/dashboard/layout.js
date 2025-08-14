'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartBarIcon,
  ArrowsRightLeftIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
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
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-primary-100 fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto px-20">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold text-primary-900">
                BigQuery Dashboard
              </h1>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:flex md:space-x-8">
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

            {/* Logout Button */}
            <div className="flex items-center">
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-primary-100">
          <div className="flex flex-wrap px-2 pb-3 pt-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`w-1/2 py-2 px-3 text-base font-medium ${
                    isActive
                      ? 'text-primary-900'
                      : 'text-primary-500 hover:text-primary-700'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-10 px-20">
        {children}
      </main>
    </div>
  );
} 