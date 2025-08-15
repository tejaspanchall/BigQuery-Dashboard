'use client';

import { useEffect, useState } from 'react';
import { fetchMetrics, fetchCTR, fetchTrends } from '@/lib/utils/api';
import DateRangePicker from '@/components/ui/DateRangePicker';
import MetricCard from '@/components/ui/MetricCard';
import useDateRangeStore from '@/lib/store/dateRange';
import { 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const StatisticCard = ({ icon: Icon, label, value, loading, trend }) => (
  <div className="bg-white rounded-xl p-4 sm:p-6 border border-primary-100/40 hover:border-primary-200/60 transition-all duration-300 shadow-sm hover:shadow">
    <div className="flex items-start justify-between">
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2 text-primary-600">
          <Icon className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-medium">{label}</span>
        </div>
        <div>
          <div className="text-lg sm:text-2xl font-semibold text-primary-900">
            {loading ? 'Loading...' : value}
          </div>
          {trend && !loading && (
            <div className="mt-1 text-xs sm:text-sm text-primary-500">
              vs. last period
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const PlatformCard = ({ title, metrics = [], loading }) => (
  <div className="bg-white rounded-xl p-4 sm:p-6 border border-primary-100/40 hover:border-primary-200/60 transition-all duration-300 shadow-sm hover:shadow">
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2">
        <ChartBarIcon className="w-5 h-5 text-primary-600" />
        <h3 className="text-xs sm:text-sm font-medium text-primary-600">{title}</h3>
      </div>
      <div className="space-y-3 sm:space-y-4 pt-2">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            {...metric}
            loading={loading}
          />
        ))}
      </div>
    </div>
  </div>
);

export default function OverviewPage() {
  const { startDate, endDate } = useDateRangeStore();
  const [metrics, setMetrics] = useState({
    orders: { value: 0, loading: true },
    revenue: { value: 0, loading: true },
    mer: { value: 0, details: null, loading: true },
    metaAdSpend: { value: 0, dailyData: [], loading: true },
    googleAdSpend: { value: 0, dailyData: [], loading: true },
    metaCTR: { value: 0, loading: true },
    googleCTR: { value: 0, loading: true },
  });
  const [trendData, setTrendData] = useState({ data: [], loading: true });

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const fetchAllMetrics = async () => {
      setMetrics((prev) => ({
        orders: { ...prev.orders, loading: true },
        revenue: { ...prev.revenue, loading: true },
        mer: { ...prev.mer, loading: true },
        metaAdSpend: { ...prev.metaAdSpend, loading: true },
        googleAdSpend: { ...prev.googleAdSpend, loading: true },
        metaCTR: { ...prev.metaCTR, loading: true },
        googleCTR: { ...prev.googleCTR, loading: true },
      }));
      setTrendData(prev => ({ ...prev, loading: true }));

      try {
        const [
          orders, 
          revenue, 
          mer, 
          metaAdSpend, 
          googleAdSpend, 
          metaCTR, 
          googleCTR,
          trends
        ] = await Promise.all([
          fetchMetrics('/api/shopify/orders', startDate, endDate),
          fetchMetrics('/api/shopify/net-revenue', startDate, endDate),
          fetchMetrics('/api/shopify/mer', startDate, endDate),
          fetchMetrics('/api/meta/adspend', startDate, endDate),
          fetchMetrics('/api/google/adspend', startDate, endDate),
          fetchCTR('/api/meta/ctr', startDate, endDate),
          fetchCTR('/api/google/ctr', startDate, endDate),
          fetchTrends(startDate, endDate),
        ]);

        setMetrics({
          orders: { value: orders.count, loading: false },
          revenue: { value: revenue.amount, loading: false },
          mer: { 
            value: mer.ratio,
            details: mer.details,
            loading: false 
          },
          metaAdSpend: { 
            value: metaAdSpend.amount, 
            dailyData: metaAdSpend.daily_data || [],
            loading: false 
          },
          googleAdSpend: { 
            value: googleAdSpend.amount,
            dailyData: googleAdSpend.daily_data || [],
            loading: false 
          },
          metaCTR: {
            value: metaCTR.ratio,
            loading: false
          },
          googleCTR: {
            value: googleCTR.ratio,
            loading: false
          },
        });

        setTrendData({
          data: trends.data,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setMetrics((prev) => ({
          orders: { ...prev.orders, loading: false, error: true },
          revenue: { ...prev.revenue, loading: false, error: true },
          mer: { ...prev.mer, loading: false, error: true },
          metaAdSpend: { ...prev.metaAdSpend, loading: false, error: true },
          googleAdSpend: { ...prev.googleAdSpend, loading: false, error: true },
          metaCTR: { ...prev.metaCTR, loading: false, error: true },
          googleCTR: { ...prev.googleCTR, loading: false, error: true },
        }));
        setTrendData(prev => ({ ...prev, loading: false, error: true }));
      }
    };

    fetchAllMetrics();
  }, [startDate, endDate]);

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Header Section */}
      <div className="border-b border-primary-900/10 -mx-4 sm:-mx-6 lg:-mx-20 px-4 sm:px-6 lg:px-20 pb-4 sm:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-primary-900">Overview</h1>
            <p className="text-xs sm:text-sm text-primary-500 mt-1">Track your key metrics and performance</p>
          </div>
          <DateRangePicker />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 sm:space-y-10">
        {/* Key Metrics Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-1 h-5 bg-primary-900 rounded-full" />
            <h2 className="text-sm sm:text-base font-medium text-primary-900">Key Metrics</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <StatisticCard
              icon={ShoppingBagIcon}
              label="Total Orders"
              value={metrics.orders.loading ? null : metrics.orders.value.toLocaleString('en-IN')}
              loading={metrics.orders.loading}
              trend
            />
            <StatisticCard
              icon={CurrencyDollarIcon}
              label="Net Revenue"
              value={metrics.revenue.loading ? null : formatCurrency(metrics.revenue.value)}
              loading={metrics.revenue.loading}
              trend
            />
            <StatisticCard
              icon={ArrowTrendingUpIcon}
              label="Marketing Efficiency Ratio (MER)"
              value={metrics.mer.loading ? null : `${metrics.mer.value.toFixed(2)}%`}
              loading={metrics.mer.loading}
              trend
            />
          </div>
        </section>

        {/* Ad Platform Performance */}
        <section>
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-1 h-5 bg-primary-900 rounded-full" />
            <h2 className="text-sm sm:text-base font-medium text-primary-900">Ad Platform Performance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <PlatformCard
              title="Meta Advertising"
              metrics={[
                {
                  title: "Ad Spend",
                  value: metrics.metaAdSpend.value,
                  format: "currency",
                },
                {
                  title: "CTR",
                  value: metrics.metaCTR.value,
                  format: "percentage",
                }
              ]}
              loading={metrics.metaAdSpend.loading || metrics.metaCTR.loading}
            />
            <PlatformCard
              title="Google Advertising"
              metrics={[
                {
                  title: "Ad Spend",
                  value: metrics.googleAdSpend.value,
                  format: "currency",
                },
                {
                  title: "CTR",
                  value: metrics.googleCTR.value,
                  format: "percentage",
                }
              ]}
              loading={metrics.googleAdSpend.loading || metrics.googleCTR.loading}
            />
          </div>
        </section>

        {/* Trend Chart Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-1 h-5 bg-primary-900 rounded-full" />
            <h2 className="text-sm sm:text-base font-medium text-primary-900">Performance Trends</h2>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-primary-100/40 shadow-sm">
            {trendData.loading ? (
              <div className="h-[300px] sm:h-[400px] flex items-center justify-center">
                <p className="text-sm text-primary-500">Loading trend data...</p>
              </div>
            ) : trendData.error ? (
              <div className="h-[300px] sm:h-[400px] flex items-center justify-center">
                <p className="text-sm text-red-500">Error loading trend data</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300} className="sm:hidden">
                  <LineChart
                    data={trendData.data}
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
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                      width={45}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      width={30}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                      }}
                      formatter={(value, name) => {
                        switch (name) {
                          case 'order_count':
                            return [value.toLocaleString('en-IN'), 'Orders'];
                          case 'total_spend':
                            return [`₹${value.toLocaleString('en-IN')}`, 'Ad Spend'];
                          case 'net_revenue':
                            return [`₹${value.toLocaleString('en-IN')}`, 'Revenue'];
                          default:
                            return [value, name];
                        }
                      }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { 
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="total_spend"
                      name="Ad Spend"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="net_revenue"
                      name="Revenue"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="order_count"
                      name="Orders"
                      stroke="#6366F1"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={400} className="hidden sm:block">
                  <LineChart
                    data={trendData.data}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#6B7280' }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: '#6B7280' }}
                      tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fill: '#6B7280' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0.5rem',
                      }}
                      formatter={(value, name) => {
                        switch (name) {
                          case 'order_count':
                            return [value.toLocaleString('en-IN'), 'Orders'];
                          case 'total_spend':
                            return [`₹${value.toLocaleString('en-IN')}`, 'Ad Spend'];
                          case 'net_revenue':
                            return [`₹${value.toLocaleString('en-IN')}`, 'Revenue'];
                          default:
                            return [value, name];
                        }
                      }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { 
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="total_spend"
                      name="Ad Spend"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="net_revenue"
                      name="Revenue"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="order_count"
                      name="Orders"
                      stroke="#6366F1"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
} 