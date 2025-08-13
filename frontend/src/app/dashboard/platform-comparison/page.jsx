'use client';

import { Suspense } from 'react';
import DateRangeFilter from '@/components/filters/DateRangeFilter';
import DataTable from '@/components/tables/DataTable';
import LineChart from '@/components/charts/LineChart';
import { useQuery } from '@tanstack/react-query';
import { getPlatformComparison, formatCurrency, formatNumber, formatPercentage, exportToCsv } from '@/lib/api';
import { useState } from 'react';
import { subDays } from 'date-fns';

const columns = [
  { key: 'platform', label: 'Platform' },
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

function PlatformComparison() {
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });

  const { data: comparisonData, isLoading } = useQuery({
    queryKey: ['platform-comparison', dateRange.startDate, dateRange.endDate],
    queryFn: () => getPlatformComparison(dateRange.startDate, dateRange.endDate),
  });

  const chartData = comparisonData ? {
    labels: comparisonData.map(d => d.platform),
    datasets: [
      {
        label: 'Total Spend',
        data: comparisonData.map(d => d.total_spend),
        backgroundColor: 'rgb(229, 231, 235)', // Light gray
      },
      {
        label: 'CTR',
        data: comparisonData.map(d => d.ctr * 100), // Convert to percentage
        backgroundColor: 'rgb(156, 163, 175)', // Medium gray
      },
    ],
  } : null;

  if (isLoading) {
    return <div className="text-gray-200">Loading...</div>;
  }

  const handleExportCsv = () => {
    if (comparisonData) {
      exportToCsv(comparisonData, 'platform-comparison');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-100">Platform Comparison</h1>
        <DateRangeFilter
          onDateChange={({ startDate, endDate }) => setDateRange({ startDate, endDate })}
        />
      </div>

      {comparisonData && (
        <>
          <DataTable
            columns={columns}
            data={comparisonData}
            title="Platform Performance"
            onExportCsv={handleExportCsv}
          />

          <LineChart
            data={chartData}
            title="Platform Metrics Comparison"
            yAxisLabel="Amount (₹) / Percentage"
          />
        </>
      )}
    </div>
  );
}

export default function PlatformComparisonPage() {
  return (
    <Suspense fallback={<div className="text-gray-200">Loading...</div>}>
      <PlatformComparison />
    </Suspense>
  );
} 