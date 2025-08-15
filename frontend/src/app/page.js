'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/lib/store/auth';
import { login } from '@/lib/utils/api';
import { LockClosedIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(password);
      setToken(data.token);
      router.push('/dashboard/overview'); // Direct redirect to overview
    } catch (err) {
      setError('Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl px-6 py-8 sm:px-12 sm:py-16">
          <div className="mx-auto w-full max-w-md">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary-100 p-2 sm:p-3">
                <LockClosedIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
              </div>
            </div>
            <h1 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold tracking-tight text-primary-900">
              BigQuery Dashboard
            </h1>
            <p className="mt-2 text-center text-xs sm:text-sm text-primary-600">
              Enter your password to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
            <div>
              <label 
                htmlFor="password" 
                className="block text-xs sm:text-sm font-medium text-primary-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-primary-200 px-3 py-2 sm:px-4 sm:py-3 text-sm placeholder-primary-400 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 sm:p-4">
                <div className="flex">
                  <div className="text-xs sm:text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-primary-900 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
