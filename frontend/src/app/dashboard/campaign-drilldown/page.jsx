'use client';

import { Suspense } from 'react';
import DateRangeFilter from '@/components/filters/DateRangeFilter';
import DataTable from '@/components/tables/DataTable';
import { useQuery } from '@tanstack/react-query';
import { getCampaignDrilldown, formatCurrency, formatNumber, formatPercentage, exportToCsv } from '@/lib/api';
import { useState } from 'react';
import { subDays } from 'date-fns';

const columns = [
  { key: 'platform', label: 'Platform' },
  { key: 'campaign_name', label: 'Campaign' },
  { 
    key: 'total_spend', 
    label: 'Total Spend',
    formatter: formatCurrency,
  },
  { 
    key: 'total_clicks', 
    label: 'Total Clicks',
    formatter: formatNumber,
  },
  { 
    key: 'total_impressions', 
    label: 'Total Impressions',
    formatter: formatNumber,
  },
  { 
    key: 'ctr', 
    label: 'CTR',
    formatter: formatPercentage,
  },
  { 
    key: 'cpc', 
    label: 'CPC',
    formatter: formatCurrency,
  },
];

function PlatformFilter({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 bg-gray-800 text-gray-100 border-gray-700 focus:ring-2 focus:ring-gray-500 sm:text-sm sm:leading-6"
    >
      <option value="">All Platforms</option>
      <option value="Meta">Meta</option>
      <option value="Google Ads">Google Ads</option>
    </select>
  );
}

function CampaignDrilldown() {
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [platform, setPlatform] = useState('');

  const { data: campaignData, isLoading } = useQuery({
    queryKey: ['campaign-drilldown', dateRange.startDate, dateRange.endDate, platform],
    queryFn: () => getCampaignDrilldown(dateRange.startDate, dateRange.endDate, platform || null),
  });

  if (isLoading) {
    return <div className="text-gray-200">Loading...</div>;
  }

  const handleExportCsv = () => {
    if (campaignData) {
      exportToCsv(campaignData, 'campaign-drilldown');
    }
  };

  // Calculate totals
  const totals = campaignData?.reduce((acc, campaign) => {
    return {
      total_spend: (acc.total_spend || 0) + campaign.total_spend,
      total_clicks: (acc.total_clicks || 0) + campaign.total_clicks,
      total_impressions: (acc.total_impressions || 0) + campaign.total_impressions,
    };
  }, {});

  if (totals) {
    totals.ctr = totals.total_clicks / totals.total_impressions;
    totals.cpc = totals.total_spend / totals.total_clicks;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-100">Campaign Drilldown</h1>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Platform
            </label>
            <PlatformFilter value={platform} onChange={setPlatform} />
          </div>
          <DateRangeFilter
            onDateChange={({ startDate, endDate }) => setDateRange({ startDate, endDate })}
          />
        </div>
      </div>

      {campaignData && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">Total Spend</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-100">
                {formatCurrency(totals.total_spend)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">Total Clicks</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-100">
                {formatNumber(totals.total_clicks)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">Average CTR</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-100">
                {formatPercentage(totals.ctr)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">Average CPC</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-100">
                {formatCurrency(totals.cpc)}
              </p>
            </div>
          </div>

          {/* Campaign Table */}
          <DataTable
            columns={columns}
            data={campaignData}
            title="Campaign Performance"
            onExportCsv={handleExportCsv}
          />
        </div>
      )}
    </div>
  );
}

export default function CampaignDrilldownPage() {
  return (
    <Suspense fallback={<div className="text-gray-200">Loading...</div>}>
      <CampaignDrilldown />
    </Suspense>
  );
} 