'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

const AuthContext = createContext({});

// Configure axios defaults
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Configure axios with token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    } else {
      // Clear axios headers if no token
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated and not on login page, redirect to login
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login');
      }
      // If authenticated and on login page, redirect to dashboard
      else if (isAuthenticated && pathname === '/login') {
        router.push('/dashboard/overview');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 