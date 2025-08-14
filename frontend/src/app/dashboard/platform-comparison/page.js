'use client';

import { useEffect, useState } from 'react';
import { fetchMetrics } from '@/lib/utils/api';
import DateRangePicker from '@/components/ui/DateRangePicker';
import MetricCard from '@/components/ui/MetricCard';
import useDateRangeStore from '@/lib/store/dateRange';

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
            ctr: { value: metaCTR.percentage, loading: false },
            conversions: { value: metaConversions.count, loading: false },
          },
          google: {
            adSpend: { value: googleAdSpend.amount, loading: false },
            clicks: { value: googleClicks.count, loading: false },
            impressions: { value: googleImpressions.count, loading: false },
            ctr: { value: googleCTR.percentage, loading: false },
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary-900">Platform Comparison</h2>
        <DateRangePicker />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Meta Metrics */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary-800">Meta</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              title="Ad Spend"
              value={metrics.meta.adSpend.value}
              format="currency"
              loading={metrics.meta.adSpend.loading}
            />
            <MetricCard
              title="Clicks"
              value={metrics.meta.clicks.value}
              loading={metrics.meta.clicks.loading}
            />
            <MetricCard
              title="Impressions"
              value={metrics.meta.impressions.value}
              loading={metrics.meta.impressions.loading}
            />
            <MetricCard
              title="CTR"
              value={metrics.meta.ctr.value}
              format="percentage"
              loading={metrics.meta.ctr.loading}
            />
            <MetricCard
              title="Conversions"
              value={metrics.meta.conversions.value}
              loading={metrics.meta.conversions.loading}
            />
          </div>
        </div>

        {/* Google Metrics */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary-800">Google</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              title="Ad Spend"
              value={metrics.google.adSpend.value}
              format="currency"
              loading={metrics.google.adSpend.loading}
            />
            <MetricCard
              title="Clicks"
              value={metrics.google.clicks.value}
              loading={metrics.google.clicks.loading}
            />
            <MetricCard
              title="Impressions"
              value={metrics.google.impressions.value}
              loading={metrics.google.impressions.loading}
            />
            <MetricCard
              title="CTR"
              value={metrics.google.ctr.value}
              format="percentage"
              loading={metrics.google.ctr.loading}
            />
            <MetricCard
              title="Conversions"
              value={metrics.google.conversions.value}
              loading={metrics.google.conversions.loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 