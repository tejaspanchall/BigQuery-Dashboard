'use client';

import { Suspense } from 'react';
import DateRangeFilter from '@/components/filters/DateRangeFilter';
import DataTable from '@/components/tables/DataTable';
import { useQuery } from '@tanstack/react-query';
import { getOrdersAndRefunds, formatCurrency, formatNumber, exportToCsv } from '@/lib/api';
import { useState } from 'react';
import { subDays } from 'date-fns';

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'order_id', label: 'Order ID' },
  { 
    key: 'total_price', 
    label: 'Total Price',
    formatter: formatCurrency,
  },
  { 
    key: 'total_tax', 
    label: 'Total Tax',
    formatter: formatCurrency,
  },
  { 
    key: 'net_revenue', 
    label: 'Net Revenue',
    formatter: formatCurrency,
  },
  { key: 'financial_status', label: 'Financial Status' },
  { key: 'fulfillment_status', label: 'Fulfillment Status' },
  { 
    key: 'refund_amount', 
    label: 'Refund Amount',
    formatter: formatCurrency,
  },
];

function OrdersAndRefunds() {
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders-refunds', dateRange.startDate, dateRange.endDate],
    queryFn: () => getOrdersAndRefunds(dateRange.startDate, dateRange.endDate),
  });

  if (isLoading) {
    return <div className="text-gray-200">Loading...</div>;
  }

  const handleExportCsv = () => {
    if (ordersData) {
      exportToCsv(ordersData, 'orders-and-refunds');
    }
  };

  // Calculate summary metrics
  const summary = ordersData?.reduce((acc, order) => {
    return {
      total_orders: acc.total_orders + 1,
      total_revenue: acc.total_revenue + order.net_revenue,
      total_refunds: acc.total_refunds + (order.financial_status === 'refunded' ? 1 : 0),
      refund_amount: acc.refund_amount + order.refund_amount,
    };
  }, {
    total_orders: 0,
    total_revenue: 0,
    total_refunds: 0,
    refund_amount: 0,
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-100">Orders & Refunds</h1>
        <DateRangeFilter
          onDateChange={({ startDate, endDate }) => setDateRange({ startDate, endDate })}
        />
      </div>

      {ordersData && summary && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">Total Orders</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-100">
                {formatNumber(summary.total_orders)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">Total Revenue</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-100">
                {formatCurrency(summary.total_revenue)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">Total Refunds</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-100">
                {formatNumber(summary.total_refunds)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">Refund Amount</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-100">
                {formatCurrency(summary.refund_amount)}
              </p>
            </div>
          </div>

          {/* Orders Table */}
          <DataTable
            columns={columns}
            data={ordersData}
            title="Orders List"
            onExportCsv={handleExportCsv}
          />
        </div>
      )}
    </div>
  );
}

export default function OrdersAndRefundsPage() {
  return (
    <Suspense fallback={<div className="text-gray-200">Loading...</div>}>
      <OrdersAndRefunds />
    </Suspense>
  );
} 