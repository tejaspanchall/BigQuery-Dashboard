'use client';

import { useEffect, useState } from 'react';
import { fetchMetrics, fetchCTR, fetchClicks, fetchImpressions, fetchConversions } from '@/lib/utils/api';
import DateRangePicker from '@/components/ui/DateRangePicker';
import useDateRangeStore from '@/lib/store/dateRange';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatValue = (val, format = 'number', loading = false) => {
  if (loading) return 'Loading...';
  if (val === null || val === undefined) return 'Loading...';
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(val);
    case 'percentage':
      return `${val.toFixed(2)}%`;
    default:
      return new Intl.NumberFormat('en-IN').format(val);
  }
};

const ComparisonTable = ({ data, loading }) => (
  <div className="bg-white rounded-xl overflow-x-auto border border-primary-900/10">
    <table className="w-full min-w-[640px]">
      <thead>
        <tr className="border-b border-primary-900/10">
          <th className="text-left p-3 sm:p-4 text-xs font-medium text-primary-600">Metrics</th>
          <th className="text-right p-3 sm:p-4 text-xs font-medium text-primary-600">Meta</th>
          <th className="text-right p-3 sm:p-4 text-xs font-medium text-primary-600">Google</th>
          <th className="text-right p-3 sm:p-4 text-xs font-medium text-primary-600">Shopify</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-primary-900/10">
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-primary-900">Ad Spend / Revenue</td>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right text-primary-900">{formatValue(data.meta.adSpend?.amount, 'currency', loading)}</td>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right text-primary-900">{formatValue(data.google.adSpend?.amount, 'currency', loading)}</td>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right text-primary-900">{formatValue(data.shopify.revenue?.amount, 'currency', loading)}</td>
        </tr>
        <tr className="border-b border-primary-900/10">
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-primary-900">Clicks / Orders</td>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right text-primary-900">{formatValue(data.meta.clicks?.count, 'number', loading)}</td>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right text-primary-900">{formatValue(data.google.clicks?.count, 'number', loading)}</td>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right text-primary-900">{formatValue(data.shopify.orders?.count, 'number', loading)}</td>
        </tr>
        <tr className="border-b border-primary-900/10">
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-primary-900">Impressions</td>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right text-primary-900">{formatValue(data.meta.impressions?.count, 'number', loading)}</td>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right text-primary-900">{formatValue(data.google.impressions?.count, 'number', loading)}</td>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right text-primary-900">-</td>
        </tr>
        <tr className="border-b border-primary-900/10">
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-primary-900">CTR</td>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right text-primary-900">{formatValue(data.meta.ctr?.ratio, 'percentage', loading)}</td>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right text-primary-900">{formatValue(data.google.ctr?.ratio, 'percentage', loading)}</td>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right text-primary-900">-</td>
        </tr>
        <tr>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-primary-900">Conversions</td>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right text-primary-900">{formatValue(data.meta.conversions?.count, 'number', loading)}</td>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right text-primary-900">{formatValue(data.google.conversions?.count, 'number', loading)}</td>
          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right text-primary-900">-</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const MetaVsGoogleChart = ({ data, loading }) => {
  const [selectedMetric, setSelectedMetric] = useState('Ad Spend');
  const metrics = ['Ad Spend', 'Clicks', 'Impressions', 'Conversions']; // Removed CTR

  if (loading) {
    return (
      <div className="h-[300px] sm:h-[400px] flex items-center justify-center bg-white rounded-xl p-3 sm:p-6 border border-primary-900/10">
        <p className="text-xs sm:text-sm text-primary-600">Loading chart data...</p>
      </div>
    );
  }

  const formatValue = (value, metric) => {
    if (metric === 'Ad Spend') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (metric === 'CTR') {
      return `${value.toFixed(2)}%`;
    }
    return new Intl.NumberFormat('en-IN').format(value);
  };

  const getMetricData = () => {
    let metaData = [];
    let googleData = [];

    switch (selectedMetric) {
      case 'Ad Spend': {
        // Aggregate daily spend for Meta
        const metaDailySpend = {};
        (data.meta.adSpend?.daily_data || []).forEach(item => {
          if (!metaDailySpend[item.date]) {
            metaDailySpend[item.date] = 0;
          }
          metaDailySpend[item.date] += Number(item.spend) || 0;
        });
        metaData = Object.entries(metaDailySpend).map(([date, spend]) => ({ date, spend }));

        // Aggregate daily spend for Google
        const googleDailySpend = {};
        (data.google.adSpend?.daily_data || []).forEach(item => {
          if (!googleDailySpend[item.date]) {
            googleDailySpend[item.date] = 0;
          }
          googleDailySpend[item.date] += Number(item.spend) || 0;
        });
        googleData = Object.entries(googleDailySpend).map(([date, spend]) => ({ date, spend }));
        break;
      }
      case 'Clicks':
        metaData = data.meta.clicks?.daily_data || [];
        googleData = data.google.clicks?.daily_data || [];
        break;
      case 'Impressions':
        metaData = data.meta.impressions?.daily_data || [];
        googleData = data.google.impressions?.daily_data || [];
        break;
      case 'CTR':
        metaData = data.meta.ctr?.daily_data || [];
        googleData = data.google.ctr?.daily_data || [];
        break;
      case 'Conversions':
        metaData = data.meta.conversions?.daily_data || [];
        googleData = data.google.conversions?.daily_data || [];
        break;
    }

    // Get all unique dates
    const allDates = new Set([
      ...metaData.map(d => d.date),
      ...googleData.map(d => d.date),
    ]);

    // Create chart data
    return Array.from(allDates).sort().map(date => {
      const metaItem = metaData.find(d => d.date === date);
      const googleItem = googleData.find(d => d.date === date);

      const getValue = (item) => {
        if (!item) return 0;
        switch (selectedMetric) {
          case 'Ad Spend': return item.spend || 0;
          case 'Clicks': return item.clicks || 0;
          case 'Impressions': return item.impressions || 0;
          case 'CTR': return item.ctr || 0;
          case 'Conversions': return item.conversions || 0;
          default: return 0;
        }
      };

      return {
        date,
        Meta: getValue(metaItem),
        Google: getValue(googleItem),
      };
    });
  };

  return (
    <div className="bg-white rounded-xl p-3 sm:p-6 border border-primary-900/10">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h3 className="text-xs sm:text-sm font-medium text-primary-900">Meta vs Google Comparison</h3>
          <div className="flex flex-wrap gap-2">
            {metrics.map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-lg transition-colors ${
                  selectedMetric === metric
                    ? 'bg-primary-900 text-white'
                    : 'bg-gray-100 text-primary-600 hover:bg-gray-200'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[300px] sm:h-[400px] -mx-2 sm:-mx-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={getMetricData()}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#6B7280', fontSize: '10px' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { 
                  day: '2-digit', 
                  month: window.innerWidth < 640 ? '2-digit' : 'short' 
                })}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tick={{ fill: '#6B7280', fontSize: '10px' }}
                tickFormatter={(value) => formatValue(value, selectedMetric)}
                width={60}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
                formatter={(value, name) => [formatValue(value, selectedMetric), name]}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { 
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              <Line 
                type="monotone" 
                dataKey="Meta" 
                stroke="#1877F2" 
                strokeWidth={2} 
                dot={false} 
              />
              <Line 
                type="monotone" 
                dataKey="Google" 
                stroke="#34A853" 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const PlatformCharts = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-white rounded-xl p-4 sm:p-6 border border-primary-900/10">
        <p className="text-sm text-primary-600">Loading chart data...</p>
      </div>
    );
  }

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

  const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value);
  const formatPercentage = (value) => `${value.toFixed(2)}%`;

  // Prepare data for different comparisons
  const shopifyVsMetaData = [
    {
      name: 'Conversions vs Orders',
      'Meta Conversions': data.meta.conversions?.count || 0,
      'Shopify Orders': data.shopify.orders?.count || 0,
    }
  ];

  const shopifyVsGoogleData = [
    {
      name: 'Conversions vs Orders',
      'Google Conversions': data.google.conversions?.count || 0,
      'Shopify Orders': data.shopify.orders?.count || 0,
    }
  ];

  const metaVsGoogleData = [
    {
      name: 'Ad Spend',
      'Meta': data.meta.adSpend?.amount || 0,
      'Google': data.google.adSpend?.amount || 0,
    },
    {
      name: 'Clicks',
      'Meta': data.meta.clicks?.count || 0,
      'Google': data.google.clicks?.count || 0,
    },
    {
      name: 'Impressions',
      'Meta': data.meta.impressions?.count || 0,
      'Google': data.google.impressions?.count || 0,
    },
    {
      name: 'Conversions',
      'Meta': data.meta.conversions?.count || 0,
      'Google': data.google.conversions?.count || 0,
    },
  ];

  const renderChart = (chartData, title, isMetaVsGoogle = false) => (
    <div className="bg-white rounded-xl p-3 sm:p-6 border border-primary-900/10">
      <h3 className="text-xs sm:text-sm font-medium text-primary-900 mb-4 sm:mb-6">{title}</h3>
      <div className="h-[250px] sm:h-[300px] -mx-2 sm:-mx-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: '10px' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: '10px' }} 
              width={60}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem',
                fontSize: '12px',
              }}
              formatter={(value, name, props) => {
                return [formatNumber(value), name];
              }}
            />
            <Legend iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            {Object.keys(chartData[0]).filter(key => key !== 'name').map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={
                  key.includes('Meta') || key === 'Meta' ? '#1877F2' : 
                  key.includes('Google') || key === 'Google' ? '#34A853' : 
                  '#95BF47'
                }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Meta vs Google Comparison */}
      <MetaVsGoogleChart data={data} loading={loading} />
      
      {/* Shopify Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {renderChart(shopifyVsMetaData, 'Shopify Orders vs Meta Conversions')}
        {renderChart(shopifyVsGoogleData, 'Shopify Orders vs Google Conversions')}
      </div>
    </div>
  );
};

export default function PlatformComparisonPage() {
  const { startDate, endDate } = useDateRangeStore();
  const [metrics, setMetrics] = useState({
    meta: {
      adSpend: null,
      clicks: null,
      impressions: null,
      ctr: null,
      conversions: null,
    },
    google: {
      adSpend: null,
      clicks: null,
      impressions: null,
      ctr: null,
      conversions: null,
    },
    shopify: {
      orders: null,
      revenue: null,
    }
  });

  useEffect(() => {
    const fetchPlatformMetrics = async () => {
      setMetrics({
        meta: {
          adSpend: null,
          clicks: null,
          impressions: null,
          ctr: null,
          conversions: null,
        },
        google: {
          adSpend: null,
          clicks: null,
          impressions: null,
          ctr: null,
          conversions: null,
        },
        shopify: {
          orders: null,
          revenue: null,
        }
      });

      try {
        const [
          metaAdSpend,
          metaClicks,
          metaImpressions,
          metaCTR,
          metaConversions,
          googleAdSpend,
          googleClicks,
          googleImpressions,
          googleCTR,
          googleConversions,
          shopifyOrders,
          shopifyRevenue,
        ] = await Promise.all([
          fetchMetrics('/api/meta/adspend', startDate, endDate),
          fetchClicks('/api/meta/clicks', startDate, endDate),
          fetchImpressions('/api/meta/impressions', startDate, endDate),
          fetchCTR('/api/meta/ctr', startDate, endDate),
          fetchConversions('/api/meta/conversions', startDate, endDate),
          fetchMetrics('/api/google/adspend', startDate, endDate),
          fetchClicks('/api/google/clicks', startDate, endDate),
          fetchImpressions('/api/google/impressions', startDate, endDate),
          fetchCTR('/api/google/ctr', startDate, endDate),
          fetchConversions('/api/google/conversions', startDate, endDate),
          fetchMetrics('/api/shopify/orders', startDate, endDate),
          fetchMetrics('/api/shopify/net-revenue', startDate, endDate),
        ]);

        setMetrics({
          meta: {
            adSpend: metaAdSpend,
            clicks: metaClicks,
            impressions: metaImpressions,
            ctr: metaCTR,
            conversions: metaConversions,
          },
          google: {
            adSpend: googleAdSpend,
            clicks: googleClicks,
            impressions: googleImpressions,
            ctr: googleCTR,
            conversions: googleConversions,
          },
          shopify: {
            orders: shopifyOrders,
            revenue: shopifyRevenue,
          }
        });
      } catch (error) {
        console.error('Error fetching platform metrics:', error);
        setMetrics({
          meta: {
            adSpend: { error: true },
            clicks: { error: true },
            impressions: { error: true },
            ctr: { error: true },
            conversions: { error: true },
          },
          google: {
            adSpend: { error: true },
            clicks: { error: true },
            impressions: { error: true },
            ctr: { error: true },
            conversions: { error: true },
          },
          shopify: {
            orders: { error: true },
            revenue: { error: true },
          }
        });
      }
    };

    fetchPlatformMetrics();
  }, [startDate, endDate]);

  const isLoading = !metrics.meta.adSpend || !metrics.google.adSpend || !metrics.shopify.revenue;

  return (
    <div className="space-y-4 sm:space-y-10">
      {/* Header Section */}
      <div className="border-b border-primary-900/10 -mx-4 sm:-mx-6 lg:-mx-20 px-4 sm:px-6 lg:px-20 pb-3 sm:pb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold text-primary-900">Platform Comparison</h1>
            <p className="text-xs sm:text-sm text-primary-600 mt-1">Compare performance metrics across platforms</p>
          </div>
          <DateRangePicker />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4 sm:space-y-6">
        <ComparisonTable data={metrics} loading={isLoading} />
        <PlatformCharts data={metrics} loading={isLoading} />
      </div>
    </div>
  );
} 