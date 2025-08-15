import axios from 'axios';
import useAuthStore from '../store/auth';
import { format } from 'date-fns';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const formatDateForAPI = (date) => {
  return format(date, 'yyyy-MM-dd');
};

export const login = async (password) => {
  const response = await api.post('/api/auth/login', { password });
  return response.data;
};

export const fetchDrilldown = async (startDate, endDate) => {
  try {
    const response = await api.post('/api/drilldown', {
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
    });

    // Validate response structure
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format');
    }

    const { success, data, message } = response.data;

    if (!success) {
      throw new Error(message || 'Failed to fetch drilldown data');
    }

    // Validate data structure
    if (!data || !data.google || !data.meta) {
      throw new Error('Invalid data structure in response');
    }

    // Process numeric values to ensure they're numbers
    const processMetrics = (platform) => {
      const metrics = { ...platform };
      const numericFields = ['cost', 'spend', 'impressions', 'clicks', 'ctr', 'average_cpc', 'average_cpm', 'cpc', 'cpm', 'conversions'];
      
      numericFields.forEach(field => {
        if (field in metrics) {
          metrics[field] = Number(metrics[field]);
        }
      });
      
      return metrics;
    };

    return {
      success: true,
      data: {
        google: processMetrics(data.google),
        meta: processMetrics(data.meta)
      }
    };

  } catch (error) {
    console.error('Error fetching drilldown data:', error);
    throw error;
  }
};

export const fetchTrends = async (startDate, endDate) => {
  try {
    const response = await api.post('/api/trends/daily', {
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching trend data:', error);
    throw error;
  }
};

export const fetchClicks = async (endpoint, startDate, endDate) => {
  try {
    const response = await api.post(endpoint, {
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
    });

    const { data } = response.data || {};
    return {
      count: Number(data?.count) || 0,
      daily_data: Array.isArray(data?.daily_data) ? data.daily_data.map(item => ({
        date: item.date,
        clicks: Number(item.clicks) || 0
      })) : []
    };
  } catch (error) {
    console.error(`Error fetching clicks from ${endpoint}:`, error);
    throw error;
  }
};

export const fetchImpressions = async (endpoint, startDate, endDate) => {
  try {
    const response = await api.post(endpoint, {
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
    });

    const { data } = response.data || {};
    return {
      count: Number(data?.count) || 0,
      daily_data: Array.isArray(data?.daily_data) ? data.daily_data.map(item => ({
        date: item.date,
        impressions: Number(item.impressions) || 0
      })) : []
    };
  } catch (error) {
    console.error(`Error fetching impressions from ${endpoint}:`, error);
    throw error;
  }
};

export const fetchMetrics = async (endpoint, startDate, endDate) => {
  try {
    const response = await api.post(endpoint, {
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
    });

    const data = response.data || {};
    
    // Handle different response structures based on endpoint
    if (endpoint.includes('/orders')) {
      return { count: Number(data.total_orders) || 0 };
    }
    if (endpoint.includes('/net-revenue')) {
      return { amount: Number(data.net_revenue) || 0 };
    }
    if (endpoint.includes('/mer')) {
      return { 
        ratio: Number(data.mer) || 0,
        details: {
          netRevenue: Number(data.net_revenue) || 0,
          totalSpend: Number(data.total_spend) || 0,
          metaSpend: Number(data.meta_spend) || 0,
          googleSpend: Number(data.google_spend) || 0
        }
      };
    }
    if (endpoint.includes('adspend')) {
      return {
        amount: Number(data.amount) || 0,
        daily_data: Array.isArray(data.daily_data) ? data.daily_data.map(item => ({
          date: item.date,
          spend: Number(item.spend) || 0
        })) : []
      };
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching metrics from ${endpoint}:`, error);
    throw error;
  }
};

export const fetchCTR = async (endpoint, startDate, endDate) => {
  try {
    const response = await api.post(endpoint, {
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
    });

    const { data } = response.data || {}; // Destructure the nested data
    return {
      ratio: Number(data?.ratio) || 0
    };
  } catch (error) {
    console.error(`Error fetching CTR from ${endpoint}:`, error);
    throw error;
  }
};

export const fetchConversions = async (endpoint, startDate, endDate) => {
  try {
    const response = await api.post(endpoint, {
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
    });

    const { data } = response.data || {};
    return {
      count: Number(data?.count) || 0,
      daily_data: Array.isArray(data?.daily_data) ? data.daily_data.map(item => ({
        date: item.date,
        conversions: Number(item.conversions) || 0
      })) : []
    };
  } catch (error) {
    console.error(`Error fetching conversions from ${endpoint}:`, error);
    throw error;
  }
};

export default api; 