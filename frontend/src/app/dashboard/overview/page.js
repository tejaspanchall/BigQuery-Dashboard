'use client';

import { useEffect, useState } from 'react';
import { fetchMetrics } from '@/lib/utils/api';
import DateRangePicker from '@/components/ui/DateRangePicker';
import MetricCard from '@/components/ui/MetricCard';
import useDateRangeStore from '@/lib/store/dateRange';
import { ArrowTrendingUpIcon, CurrencyDollarIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

const StatisticCard = ({ icon: Icon, label, value, loading, subtext = null }) => (
  <div className="bg-white rounded-xl shadow-sm border border-primary-100 p-6 transition-all duration-200 hover:shadow-md">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary-500" />
          <h3 className="text-sm font-medium text-primary-500">{label}</h3>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-semibold text-primary-900">
            {loading ? (
              <div className="animate-pulse h-8 w-24 bg-primary-100 rounded"></div>
            ) : (
              value
            )}
          </div>
          {subtext && (
            <div className="mt-2 text-sm text-primary-600">{subtext}</div>
          )}
        </div>
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
      }));

      try {
        const [orders, revenue, mer, metaAdSpend, googleAdSpend] = await Promise.all([
          fetchMetrics('/api/shopify/orders', startDate, endDate),
          fetchMetrics('/api/shopify/net-revenue', startDate, endDate),
          fetchMetrics('/api/shopify/mer', startDate, endDate),
          fetchMetrics('/api/meta/adspend', startDate, endDate),
          fetchMetrics('/api/google/adspend', startDate, endDate),
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
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setMetrics((prev) => ({
          orders: { ...prev.orders, loading: false, error: true },
          revenue: { ...prev.revenue, loading: false, error: true },
          mer: { ...prev.mer, loading: false, error: true },
          metaAdSpend: { ...prev.metaAdSpend, loading: false, error: true },
          googleAdSpend: { ...prev.googleAdSpend, loading: false, error: true },
        }));
      }
    };

    fetchAllMetrics();
  }, [startDate, endDate]);

  const getTotalAdSpend = () => {
    if (metrics.metaAdSpend.loading || metrics.googleAdSpend.loading) return null;
    return metrics.metaAdSpend.value + metrics.googleAdSpend.value;
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white border-b border-primary-100 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-primary-900">Overview</h1>
          <DateRangePicker />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Key Metrics Section */}
        <section>
          <h2 className="text-lg font-semibold text-primary-800 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatisticCard
              icon={ShoppingCartIcon}
              label="Total Orders"
              value={metrics.orders.loading ? null : metrics.orders.value.toLocaleString('en-IN')}
              loading={metrics.orders.loading}
            />
            <StatisticCard
              icon={CurrencyDollarIcon}
              label="Net Revenue"
              value={metrics.revenue.loading ? null : formatCurrency(metrics.revenue.value)}
              loading={metrics.revenue.loading}
            />
            <StatisticCard
              icon={ArrowTrendingUpIcon}
              label="Marketing Efficiency Ratio (MER)"
              value={metrics.mer.loading ? null : `${metrics.mer.value.toFixed(2)}%`}
              loading={metrics.mer.loading}
              subtext={metrics.mer.details ? `Total Spend: ${formatCurrency(metrics.mer.details.totalSpend)}` : null}
            />
          </div>
        </section>

        {/* Ad Platform Performance */}
        <section>
          <h2 className="text-lg font-semibold text-primary-800 mb-4">Ad Platform Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-primary-100 p-6">
              <h3 className="text-sm font-medium text-primary-500 mb-4">Meta Advertising</h3>
              <div className="space-y-4">
                <MetricCard
                  title="Ad Spend"
                  value={metrics.metaAdSpend.value}
                  format="currency"
                  loading={metrics.metaAdSpend.loading}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-primary-100 p-6">
              <h3 className="text-sm font-medium text-primary-500 mb-4">Google Advertising</h3>
              <div className="space-y-4">
                <MetricCard
                  title="Ad Spend"
                  value={metrics.googleAdSpend.value}
                  format="currency"
                  loading={metrics.googleAdSpend.loading}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 