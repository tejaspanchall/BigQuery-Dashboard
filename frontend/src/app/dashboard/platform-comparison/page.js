'use client';

import { useEffect, useState } from 'react';
import { fetchMetrics } from '@/lib/utils/api';
import DateRangePicker from '@/components/ui/DateRangePicker';
import useDateRangeStore from '@/lib/store/dateRange';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const MetricRow = ({ title, meta, google, format = 'number', loading }) => {
  const formatValue = (val) => {
    if (loading) return 'Loading...';
    if (val === null || val === undefined) return 'N/A';
    
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

  return (
    <div className="grid grid-cols-3 gap-4 py-4 border-b border-primary-900/10 last:border-0">
      <div className="text-sm text-primary-900">{title}</div>
      <div className="text-sm font-medium text-primary-900">{formatValue(meta)}</div>
      <div className="text-sm font-medium text-primary-900">{formatValue(google)}</div>
    </div>
  );
};

const ComparisonCard = ({ title, metrics = [], loading }) => (
  <div className="bg-white rounded-xl p-6 border border-primary-900/10 hover:border-primary-900/20 transition-all duration-300 shadow-sm hover:shadow">
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-primary-900/10">
        <ChartBarIcon className="w-5 h-5 text-primary-900" />
        <h3 className="text-sm font-medium text-primary-900">{title}</h3>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-xs uppercase tracking-wider text-primary-900 font-medium">Metric</div>
        <div className="text-xs uppercase tracking-wider text-primary-900 font-medium">Meta</div>
        <div className="text-xs uppercase tracking-wider text-primary-900 font-medium">Google</div>
      </div>
      <div className="space-y-2">
        {metrics.map((metric, index) => (
          <MetricRow
            key={index}
            {...metric}
            loading={loading}
          />
        ))}
      </div>
    </div>
  </div>
);

export default function PlatformComparisonPage() {
  const { startDate, endDate } = useDateRangeStore();
  const [metrics, setMetrics] = useState({
    meta: {
      adSpend: { loading: true },
      clicks: { loading: true },
      impressions: { loading: true },
      ctr: { loading: true },
      conversions: { loading: true },
    },
    google: {
      adSpend: { loading: true },
      clicks: { loading: true },
      impressions: { loading: true },
      ctr: { loading: true },
      conversions: { loading: true },
    },
  });

  useEffect(() => {
    const fetchPlatformMetrics = async () => {
      setMetrics((prev) => ({
        meta: {
          adSpend: { loading: true },
          clicks: { loading: true },
          impressions: { loading: true },
          ctr: { loading: true },
          conversions: { loading: true },
        },
        google: {
          adSpend: { loading: true },
          clicks: { loading: true },
          impressions: { loading: true },
          ctr: { loading: true },
          conversions: { loading: true },
        },
      }));

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
        ] = await Promise.all([
          fetchMetrics('/api/meta/adspend', startDate, endDate),
          fetchMetrics('/api/meta/clicks', startDate, endDate),
          fetchMetrics('/api/meta/impressions', startDate, endDate),
          fetchMetrics('/api/meta/ctr', startDate, endDate),
          fetchMetrics('/api/meta/conversions', startDate, endDate),
          fetchMetrics('/api/google/adspend', startDate, endDate),
          fetchMetrics('/api/google/clicks', startDate, endDate),
          fetchMetrics('/api/google/impressions', startDate, endDate),
          fetchMetrics('/api/google/ctr', startDate, endDate),
          fetchMetrics('/api/google/conversions', startDate, endDate),
        ]);

        setMetrics({
          meta: {
            adSpend: { value: metaAdSpend.amount, loading: false },
            clicks: { value: metaClicks.count, loading: false },
            impressions: { value: metaImpressions.count, loading: false },
            ctr: { value: metaCTR.ratio, loading: false },
            conversions: { value: metaConversions.count, loading: false },
          },
          google: {
            adSpend: { value: googleAdSpend.amount, loading: false },
            clicks: { value: googleClicks.count, loading: false },
            impressions: { value: googleImpressions.count, loading: false },
            ctr: { value: googleCTR.ratio, loading: false },
            conversions: { value: googleConversions.count, loading: false },
          },
        });
      } catch (error) {
        console.error('Error fetching platform metrics:', error);
        setMetrics((prev) => ({
          meta: {
            adSpend: { error: true, loading: false },
            clicks: { error: true, loading: false },
            impressions: { error: true, loading: false },
            ctr: { error: true, loading: false },
            conversions: { error: true, loading: false },
          },
          google: {
            adSpend: { error: true, loading: false },
            clicks: { error: true, loading: false },
            impressions: { error: true, loading: false },
            ctr: { error: true, loading: false },
            conversions: { error: true, loading: false },
          },
        }));
      }
    };

    fetchPlatformMetrics();
  }, [startDate, endDate]);

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="border-b border-primary-900/10 -mx-20 px-20 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-primary-900">Platform Comparison</h1>
            <p className="text-sm text-primary-600 mt-1">Compare performance metrics across platforms</p>
          </div>
          <DateRangePicker />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-10">
        {/* Performance Metrics */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-5 bg-primary-900 rounded-full" />
            <h2 className="text-base font-medium text-primary-900">Performance Metrics</h2>
          </div>
          <ComparisonCard
            title="Key Metrics Comparison"
            metrics={[
              {
                title: "Ad Spend",
                meta: metrics.meta.adSpend.value,
                google: metrics.google.adSpend.value,
                format: "currency",
                loading: metrics.meta.adSpend.loading || metrics.google.adSpend.loading,
              },
              {
                title: "Clicks",
                meta: metrics.meta.clicks.value,
                google: metrics.google.clicks.value,
                loading: metrics.meta.clicks.loading || metrics.google.clicks.loading,
              },
              {
                title: "Impressions",
                meta: metrics.meta.impressions.value,
                google: metrics.google.impressions.value,
                loading: metrics.meta.impressions.loading || metrics.google.impressions.loading,
              },
              {
                title: "Conversions",
                meta: metrics.meta.conversions.value,
                google: metrics.google.conversions.value,
                loading: metrics.meta.conversions.loading || metrics.google.conversions.loading,
              },
            ]}
          />
        </section>
      </div>
    </div>
  );
} 