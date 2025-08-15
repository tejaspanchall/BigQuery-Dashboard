'use client';

import { useState, useEffect } from 'react';
import { fetchDrilldown } from '@/lib/utils/api';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ArrowTrendingUpIcon, IdentificationIcon, BuildingStorefrontIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import useDateRangeStore from '@/lib/store/dateRange';

const formatValue = (val, format = 'number', loading = false) => {
  if (loading) return 'Loading...';
  if (val === null || val === undefined) return 'N/A';
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }).format(val);
    case 'percentage':
      return `${val.toFixed(2)}%`;
    case 'text':
      return val.toString();
    default:
      return new Intl.NumberFormat('en-IN').format(val);
  }
};

const DrilldownMetricsCard = ({ title, value, format = 'number', loading = false, icon }) => (
  <div className="bg-white rounded-xl p-5 border border-primary-900/10 hover:border-primary-900/20 transition-all duration-300 shadow-sm hover:shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-primary-600">{title}</p>
        <h3 className="text-lg font-semibold text-primary-900 mt-1">
          {loading ? 'Loading...' : format === 'text' ? value : formatValue(value, format, loading)}
        </h3>
      </div>
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-50">
        {icon}
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="bg-white rounded-xl p-6 sm:p-12 border border-primary-900/10 hover:border-primary-900/20 transition-all duration-300 shadow-sm hover:shadow text-center">
    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-50 mb-3 sm:mb-4">
      <MagnifyingGlassIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-900" />
    </div>
    <h3 className="text-base sm:text-lg font-medium text-primary-900 mb-2">No Data Available</h3>
    <p className="text-xs sm:text-sm text-primary-600 max-w-sm mx-auto">
      Select a date range and platform to view detailed performance metrics and insights.
    </p>
  </div>
);

const DrilldownContent = ({ data, platform, loading }) => {
  // Determine which field names to use based on platform
  const costField = platform === 'google' ? 'cost' : 'spend';
  const cpcField = platform === 'google' ? 'average_cpc' : 'cpc';
  const cpmField = platform === 'google' ? 'average_cpm' : 'cpm';
  const idField = platform === 'google' ? 'customer_id' : 'account_id';
  const nameField = platform === 'google' ? 'customer_descriptive_name' : 'account_name';

  return (
    <div className="space-y-8">
      {/* Platform Identity */}
      <div className="bg-white rounded-xl p-6 border border-primary-900/10 shadow-sm">
        <h3 className="text-lg font-medium text-primary-900 mb-4">Platform Identity</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DrilldownMetricsCard 
            title={platform === 'google' ? "Customer ID" : "Account ID"} 
            value={data?.[idField]}
            format="text"
            loading={loading}
            icon={<IdentificationIcon className="w-4 h-4 text-primary-900" />}
          />
          <DrilldownMetricsCard 
            title={platform === 'google' ? "Customer Name" : "Account Name"} 
            value={data?.[nameField]}
            format="text"
            loading={loading}
            icon={<BuildingStorefrontIcon className="w-4 h-4 text-primary-900" />}
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl p-6 border border-primary-900/10 shadow-sm">
        <h3 className="text-lg font-medium text-primary-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DrilldownMetricsCard 
            title={platform === 'google' ? "Cost" : "Spend"} 
            value={data?.[costField]}
            format="currency"
            loading={loading}
            icon={<CurrencyDollarIcon className="w-4 h-4 text-primary-900" />}
          />
          <DrilldownMetricsCard 
            title="Impressions" 
            value={data?.impressions}
            loading={loading}
            icon={<ArrowTrendingUpIcon className="w-4 h-4 text-primary-900" />} 
          />
          <DrilldownMetricsCard 
            title="Clicks" 
            value={data?.clicks}
            loading={loading}
            icon={<ArrowTrendingUpIcon className="w-4 h-4 text-primary-900" />}
          />
          <DrilldownMetricsCard 
            title="CTR" 
            value={data?.ctr}
            format="percentage"
            loading={loading}
            icon={<ArrowTrendingUpIcon className="w-4 h-4 text-primary-900" />}
          />
          <DrilldownMetricsCard 
            title="CPC" 
            value={data?.[cpcField]}
            format="currency"
            loading={loading}
            icon={<ArrowTrendingUpIcon className="w-4 h-4 text-primary-900" />}
          />
          <DrilldownMetricsCard 
            title="CPM" 
            value={data?.[cpmField]}
            format="currency"
            loading={loading}
            icon={<ArrowTrendingUpIcon className="w-4 h-4 text-primary-900" />}
          />
          <DrilldownMetricsCard 
            title="Conversions" 
            value={data?.conversions}
            loading={loading}
            icon={<ArrowTrendingUpIcon className="w-4 h-4 text-primary-900" />}
          />
        </div>
      </div>
    </div>
  );
};

export default function CampaignDrilldownPage() {
  const { startDate, endDate } = useDateRangeStore();
  const [platform, setPlatform] = useState('google');
  const [metrics, setMetrics] = useState({
    google: null,
    meta: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!startDate || !endDate) return;
      
      setMetrics(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const response = await fetchDrilldown(startDate, endDate);
        
        if (response.success && response.data) {
          setMetrics({
            google: response.data.google,
            meta: response.data.meta,
            loading: false,
            error: null
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setMetrics(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Failed to load drilldown data. Please try again.'
        }));
        console.error('Error fetching drilldown data:', err);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const handlePlatformChange = (e) => {
    setPlatform(e.target.value);
  };

  const renderContent = () => {
    if (metrics.error) {
      return (
        <div className="bg-red-50 rounded-xl p-6 text-center">
          <p className="text-red-600">{metrics.error}</p>
        </div>
      );
    }

    const platformData = metrics[platform];
    if (!platformData && !metrics.loading) {
      return <EmptyState />;
    }

    return <DrilldownContent data={platformData} platform={platform} loading={metrics.loading} />;
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Header Section */}
      <div className="border-b border-primary-900/10 -mx-4 sm:-mx-6 lg:-mx-20 px-4 sm:px-6 lg:px-20 pb-4 sm:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-primary-900">Campaign Drilldown</h1>
            <p className="text-xs sm:text-sm text-primary-600 mt-1">Analyze individual campaign performance</p>
          </div>
          <DateRangePicker />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 sm:space-y-10">
        {/* Platform Data */}
        <section>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-primary-900 rounded-full" />
              <h2 className="text-sm sm:text-base font-medium text-primary-900">
                {platform === 'google' ? 'Google' : 'Meta'} Ads Performance
              </h2>
            </div>
            <select
              value={platform}
              onChange={handlePlatformChange}
              className="pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="google">Google</option>
              <option value="meta">Meta</option>
            </select>
          </div>
          {renderContent()}
        </section>
      </div>
    </div>
  );
} 