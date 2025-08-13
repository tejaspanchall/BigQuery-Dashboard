'use client';

import { Inter } from 'next/font/google'
import ClientProviders from '@/components/providers/ClientProviders'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
