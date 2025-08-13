'use client';

import { Suspense } from 'react';
import DateRangeFilter from '@/components/filters/DateRangeFilter';
import KpiCard from '@/components/common/KpiCard';
import LineChart from '@/components/charts/LineChart';
import { useQuery } from '@tanstack/react-query';
import { getDailyKPIs, formatCurrency, formatNumber, formatPercentage } from '@/lib/api';
import { useState } from 'react';
import { subDays } from 'date-fns';

function Overview() {
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });

  const { data: kpiData, isLoading } = useQuery({
    queryKey: ['kpis', dateRange.startDate, dateRange.endDate],
    queryFn: () => getDailyKPIs(dateRange.startDate, dateRange.endDate),
  });

  const calculateTrend = (data, key) => {
    if (!data || data.length < 2) return 0;
    const current = data[data.length - 1][key];
    const previous = data[data.length - 2][key];
    return ((current - previous) / previous) * 100;
  };

  const chartData = kpiData ? {
    labels: kpiData.map(d => d.date),
    datasets: [
      {
        label: 'Revenue',
        data: kpiData.map(d => d.net_revenue),
        borderColor: 'rgb(229, 231, 235)', // Light gray
        tension: 0.1,
      },
      {
        label: 'Spend',
        data: kpiData.map(d => d.total_spend),
        borderColor: 'rgb(156, 163, 175)', // Medium gray
        tension: 0.1,
      },
      {
        label: 'Orders',
        data: kpiData.map(d => d.orders),
        borderColor: 'rgb(107, 114, 128)', // Dark gray
        tension: 0.1,
      },
    ],
  } : null;

  if (isLoading) {
    return <div className="text-gray-200">Loading...</div>;
  }

  const latestData = kpiData?.[kpiData.length - 1] || {};

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-100">Overview</h1>
        <DateRangeFilter
          onDateChange={({ startDate, endDate }) => setDateRange({ startDate, endDate })}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Net Revenue"
          value={latestData.net_revenue}
          trend={true}
          trendValue={calculateTrend(kpiData, 'net_revenue')}
          formatter={formatCurrency}
        />
        <KpiCard
          title="Total Spend"
          value={latestData.total_spend}
          trend={true}
          trendValue={calculateTrend(kpiData, 'total_spend')}
          formatter={formatCurrency}
        />
        <KpiCard
          title="Orders"
          value={latestData.orders}
          trend={true}
          trendValue={calculateTrend(kpiData, 'orders')}
          formatter={formatNumber}
        />
        <KpiCard
          title="MER"
          value={latestData.mer}
          trend={true}
          trendValue={calculateTrend(kpiData, 'mer')}
          formatter={formatPercentage}
        />
        <KpiCard
          title="Refunds"
          value={latestData.refunds}
          trend={true}
          trendValue={calculateTrend(kpiData, 'refunds')}
          formatter={formatNumber}
        />
      </div>

      {chartData && (
        <LineChart
          data={chartData}
          title="Daily Trends"
          yAxisLabel="Amount (₹)"
        />
      )}
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={<div className="text-gray-200">Loading...</div>}>
      <Overview />
    </Suspense>
  );
} 