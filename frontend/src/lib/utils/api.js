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

export const fetchDailyShopify = async (startDate, endDate) => {
  try {
    const response = await api.post('/api/dailyShopify', {
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
    });

    if (!response.data?.success) {
      throw new Error('Failed to fetch orders data');
    }

    // Process numeric values
    const processedData = (response.data.data || []).map(order => ({
      ...order,
      total_price: Number(order.total_price) || 0,
      subtotal_price: Number(order.subtotal_price) || 0,
      total_discounts: Number(order.total_discounts) || 0,
      total_tax: Number(order.total_tax) || 0,
      refund_amount: Number(order.refund_amount) || 0
    }));

    return {
      success: true,
      data: processedData
    };
  } catch (error) {
    console.error('Error fetching daily Shopify data:', error);
    throw error;
  }
};

export const fetchShopifyOrders = async (startDate, endDate) => {
  try {
    const response = await api.post('/api/shopify/orders', {
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
    });

    return {
      total_orders: Number(response.data?.total_orders) || 0
    };
  } catch (error) {
    console.error('Error fetching Shopify orders:', error);
    throw error;
  }
};

export const fetchShopifyReturns = async (startDate, endDate) => {
  try {
    const response = await api.post('/api/shopify/returns', {
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
    });

    return {
      return_orders: Number(response.data?.return_orders) || 0
    };
  } catch (error) {
    console.error('Error fetching Shopify returns:', error);
    throw error;
  }
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
      const numericFields = [
        'cost', 
        'spend', 
        'impressions', 
        'clicks', 
        'ctr', 
        'cpc', 
        'cpm', 
        'conversions'
      ];
      
      numericFields.forEach(field => {
        if (field in metrics) {
          metrics[field] = Number(metrics[field]);
        }
      });
      
      return metrics;
    };

    // Process Google data
    const processedGoogleData = processMetrics(data.google);

    // Process Meta data - handle both array and single object cases
    const processedMetaData = Array.isArray(data.meta) 
      ? data.meta.map(account => processMetrics(account))
      : processMetrics(data.meta);

    return {
      success: true,
      data: {
        google: processedGoogleData,
        meta: processedMetaData
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

export const exportShopifyOrders = async (startDate, endDate, filters) => {
  try {
    const response = await api.post('/api/shopify/export', {
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
      filters
    }, {
      responseType: 'blob' // Important for file download
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Orders_${formatDateForAPI(startDate)}_${formatDateForAPI(endDate)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting orders:', error);
    throw error;
  }
};

export default api; 