import { Inter } from 'next/font/google';
import './globals.css';
import 'react-datepicker/dist/react-datepicker.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'BigQuery Dashboard',
  description: 'Analytics dashboard for BigQuery data',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-primary-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
