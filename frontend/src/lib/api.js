import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

export const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

export const getDailyKPIs = async (startDate, endDate) => {
  const response = await api.get('/bigquery/kpis/daily', {
    params: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
  });
  return response.data;
};

export const getPlatformComparison = async (startDate, endDate) => {
  const response = await api.get('/bigquery/platforms/comparison', {
    params: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
  });
  return response.data;
};

export const getCampaignDrilldown = async (startDate, endDate, platform = null) => {
  const response = await api.get('/bigquery/campaigns/drilldown', {
    params: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      ...(platform && { platform }),
    },
  });
  return response.data;
};

export const getOrdersAndRefunds = async (startDate, endDate) => {
  const response = await api.get('/bigquery/orders-refunds', {
    params: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
  });
  return response.data;
};

// Utility function to format currency
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Utility function to format percentages
export const formatPercentage = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Utility function to format large numbers
export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-IN').format(value);
};

// Utility function to export data as CSV
export const exportToCsv = (data, filename) => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      // Handle values that might contain commas
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"`
        : value;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}; 