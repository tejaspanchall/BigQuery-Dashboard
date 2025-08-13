'use client';

import { Fragment, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  ChartBarIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/auth';

const navigation = [
  { name: 'Overview', href: '/dashboard/overview', icon: HomeIcon },
  { name: 'Platform Comparison', href: '/dashboard/platform-comparison', icon: ChartBarIcon },
  { name: 'Campaign Drilldown', href: '/dashboard/campaign-drilldown', icon: CurrencyDollarIcon },
  { name: 'Orders & Refunds', href: '/dashboard/orders-refunds', icon: ShoppingCartIcon },
];

const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: '#1a1a1a' }}>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4" style={{ background: '#1a1a1a' }}>
                  <div className="flex h-16 shrink-0 items-center">
                    <h2 className="text-xl font-semibold text-gray-100">Marketing KPIs</h2>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className={clsx(
                                  pathname === item.href
                                    ? 'bg-gray-800 text-gray-100'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100',
                                  'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                                )}
                              >
                                <item.icon
                                  className={clsx(
                                    pathname === item.href ? 'text-gray-100' : 'text-gray-400 group-hover:text-gray-100',
                                    'h-6 w-6 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-800 px-6 pb-4" style={{ background: '#1a1a1a' }}>
          <div className="flex h-16 shrink-0 items-center">
            <h2 className="text-xl font-semibold text-gray-100">Marketing KPIs</h2>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={clsx(
                          pathname === item.href
                            ? 'bg-gray-800 text-gray-100'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100',
                          'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                        )}
                      >
                        <item.icon
                          className={clsx(
                            pathname === item.href ? 'text-gray-100' : 'text-gray-400 group-hover:text-gray-100',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8" style={{ background: '#1a1a1a' }}>
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-800 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-100"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="-m-1.5 flex items-center p-1.5">
                  <span className="sr-only">Open user menu</span>
                  <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md py-2 shadow-lg ring-1 ring-gray-800 focus:outline-none" style={{ background: '#1a1a1a' }}>
                    {userNavigation.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <a
                            href={item.href}
                            className={clsx(
                              active ? 'bg-gray-800' : '',
                              'block px-3 py-1 text-sm leading-6 text-gray-200'
                            )}
                          >
                            {item.name}
                          </a>
                        )}
                      </Menu.Item>
                    ))}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={clsx(
                            active ? 'bg-gray-800' : '',
                            'block w-full text-left px-3 py-1 text-sm leading-6 text-gray-200'
                          )}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        <main className="py-10 min-h-screen" style={{ background: '#1a1a1a' }}>
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
} 