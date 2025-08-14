import axios from 'axios';
import useAuthStore from '../store/auth';
import { format } from 'date-fns';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Format date to YYYY-MM-DD as expected by the API
export const formatDateForAPI = (date) => {
  return format(date, 'yyyy-MM-dd');
};

export const login = async (password) => {
  const response = await api.post('/api/auth/login', { password });
  return response.data;
};

export const fetchMetrics = async (endpoint, startDate, endDate) => {
  try {
    const response = await api.post(endpoint, {
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
    });

    // Add type checking and default values
    const data = response.data || {};
    
    // Handle different response structures based on endpoint
    if (endpoint.includes('orders')) {
      return { count: Number(data.count) || 0 };
    }
    if (endpoint.includes('revenue') || endpoint.includes('adspend')) {
      return { amount: Number(data.amount) || 0 };
    }
    if (endpoint.includes('mer') || endpoint.includes('ctr')) {
      return { ratio: Number(data.ratio) || 0 };
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching metrics from ${endpoint}:`, error);
    throw error;
  }
};

export default api; 