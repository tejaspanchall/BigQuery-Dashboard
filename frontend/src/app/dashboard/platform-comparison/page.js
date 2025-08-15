'use client';

import { useEffect, useState } from 'react';
import { fetchMetrics, fetchCTR, fetchClicks, fetchImpressions, fetchConversions } from '@/lib/utils/api';
import DateRangePicker from '@/components/ui/DateRangePicker';
import useDateRangeStore from '@/lib/store/dateRange';

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
  <div className="bg-white rounded-xl overflow-hidden border border-primary-900/10">
    <table className="w-full">
      <thead>
        <tr className="border-b border-primary-900/10">
          <th className="text-left p-4 text-xs font-medium text-primary-600">Metrics</th>
          <th className="text-right p-4 text-xs font-medium text-primary-600">Meta</th>
          <th className="text-right p-4 text-xs font-medium text-primary-600">Google</th>
          <th className="text-right p-4 text-xs font-medium text-primary-600">Shopify</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-primary-900/10">
          <td className="p-4 text-sm text-primary-900">Ad Spend / Revenue</td>
          <td className="p-4 text-sm text-right text-primary-900">{formatValue(data.meta.adSpend?.amount, 'currency', loading)}</td>
          <td className="p-4 text-sm text-right text-primary-900">{formatValue(data.google.adSpend?.amount, 'currency', loading)}</td>
          <td className="p-4 text-sm text-right text-primary-900">{formatValue(data.shopify.revenue?.amount, 'currency', loading)}</td>
        </tr>
        <tr className="border-b border-primary-900/10">
          <td className="p-4 text-sm text-primary-900">Clicks / Orders</td>
          <td className="p-4 text-sm text-right text-primary-900">{formatValue(data.meta.clicks?.count, 'number', loading)}</td>
          <td className="p-4 text-sm text-right text-primary-900">{formatValue(data.google.clicks?.count, 'number', loading)}</td>
          <td className="p-4 text-sm text-right text-primary-900">{formatValue(data.shopify.orders?.count, 'number', loading)}</td>
        </tr>
        <tr className="border-b border-primary-900/10">
          <td className="p-4 text-sm text-primary-900">Impressions</td>
          <td className="p-4 text-sm text-right text-primary-900">{formatValue(data.meta.impressions?.count, 'number', loading)}</td>
          <td className="p-4 text-sm text-right text-primary-900">{formatValue(data.google.impressions?.count, 'number', loading)}</td>
          <td className="p-4 text-sm text-right text-primary-900">-</td>
        </tr>
        <tr className="border-b border-primary-900/10">
          <td className="p-4 text-sm text-primary-900">CTR</td>
          <td className="p-4 text-sm text-right text-primary-900">{formatValue(data.meta.ctr?.ratio, 'percentage', loading)}</td>
          <td className="p-4 text-sm text-right text-primary-900">{formatValue(data.google.ctr?.ratio, 'percentage', loading)}</td>
          <td className="p-4 text-sm text-right text-primary-900">-</td>
        </tr>
        <tr>
          <td className="p-4 text-sm text-primary-900">Conversions</td>
          <td className="p-4 text-sm text-right text-primary-900">{formatValue(data.meta.conversions?.count, 'number', loading)}</td>
          <td className="p-4 text-sm text-right text-primary-900">{formatValue(data.google.conversions?.count, 'number', loading)}</td>
          <td className="p-4 text-sm text-right text-primary-900">-</td>
        </tr>
      </tbody>
    </table>
  </div>
);

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
    <div className="space-y-6 sm:space-y-10">
      {/* Header Section */}
      <div className="border-b border-primary-900/10 -mx-4 sm:-mx-6 lg:-mx-20 px-4 sm:px-6 lg:px-20 pb-4 sm:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-primary-900">Platform Comparison</h1>
            <p className="text-xs sm:text-sm text-primary-600 mt-1">Compare performance metrics across platforms</p>
          </div>
          <DateRangePicker />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <ComparisonTable data={metrics} loading={isLoading} />
      </div>
    </div>
  );
} 