'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/lib/store/auth';
import { login } from '@/lib/utils/api';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white px-6 py-8 sm:px-8 sm:py-10 rounded-xl shadow-sm border border-primary-900/10">
          <div>
            <h2 className="text-center text-xl sm:text-2xl font-bold tracking-tight text-primary-900">
              Welcome back!
            </h2>
            <p className="mt-2 text-center text-xs sm:text-sm text-primary-600">
              Sign in to access your dashboard
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
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-primary-200 pl-3 pr-10 py-2 sm:pl-4 sm:pr-12 sm:py-3 text-sm placeholder-primary-400 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 hover:text-primary-600" />
                  ) : (
                    <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400 hover:text-primary-600" />
                  )}
                </button>
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
