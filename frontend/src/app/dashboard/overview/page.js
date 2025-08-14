'use client';

import { useEffect, useState } from 'react';
import { fetchMetrics, fetchCTR } from '@/lib/utils/api';
import DateRangePicker from '@/components/ui/DateRangePicker';
import MetricCard from '@/components/ui/MetricCard';
import useDateRangeStore from '@/lib/store/dateRange';
import { 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const StatisticCard = ({ icon: Icon, label, value, loading, trend }) => (
  <div className="bg-white rounded-xl p-6 border border-primary-100/40 hover:border-primary-200/60 transition-all duration-300 shadow-sm hover:shadow">
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-primary-600">
          <Icon className="w-5 h-5" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div>
          <div className="text-2xl font-semibold text-primary-900">
            {loading ? 'Loading...' : value}
          </div>
          {trend && !loading && (
            <div className="mt-1 text-sm text-primary-500">
              vs. last period
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const PlatformCard = ({ title, metrics = [], loading }) => (
  <div className="bg-white rounded-xl p-6 border border-primary-100/40 hover:border-primary-200/60 transition-all duration-300 shadow-sm hover:shadow">
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ChartBarIcon className="w-5 h-5 text-primary-600" />
        <h3 className="text-sm font-medium text-primary-600">{title}</h3>
      </div>
      <div className="space-y-4 pt-2">
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

      try {
        const [orders, revenue, mer, metaAdSpend, googleAdSpend, metaCTR, googleCTR] = await Promise.all([
          fetchMetrics('/api/shopify/orders', startDate, endDate),
          fetchMetrics('/api/shopify/net-revenue', startDate, endDate),
          fetchMetrics('/api/shopify/mer', startDate, endDate),
          fetchMetrics('/api/meta/adspend', startDate, endDate),
          fetchMetrics('/api/google/adspend', startDate, endDate),
          fetchCTR('/api/meta/ctr', startDate, endDate),
          fetchCTR('/api/google/ctr', startDate, endDate),
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
      }
    };

    fetchAllMetrics();
  }, [startDate, endDate]);

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="border-b border-primary-900/10 -mx-20 px-20 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-primary-900">Overview</h1>
            <p className="text-sm text-primary-500 mt-1">Track your key metrics and performance</p>
          </div>
          <DateRangePicker />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-10">
        {/* Key Metrics Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-5 bg-primary-900 rounded-full" />
            <h2 className="text-base font-medium text-primary-900">Key Metrics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-5 bg-primary-900 rounded-full" />
            <h2 className="text-base font-medium text-primary-900">Ad Platform Performance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
} 