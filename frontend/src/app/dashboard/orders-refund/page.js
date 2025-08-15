'use client';

import DateRangePicker from '@/components/ui/DateRangePicker';
import { ShoppingBagIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const SummaryCard = ({ title, value, icon: Icon, loading }) => (
  <div className="bg-white rounded-xl p-4 sm:p-6 border border-primary-900/10 hover:border-primary-900/20 transition-all duration-300 shadow-sm hover:shadow">
    <div className="flex items-start justify-between">
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2 text-primary-900">
          <Icon className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-medium">{title}</span>
        </div>
        <div className="text-lg sm:text-2xl font-semibold text-primary-900">
          {loading ? 'Loading...' : value}
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="bg-white rounded-xl p-6 sm:p-12 border border-primary-900/10 hover:border-primary-900/20 transition-all duration-300 shadow-sm hover:shadow text-center">
    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-50 mb-3 sm:mb-4">
      <ShoppingBagIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-900" />
    </div>
    <h3 className="text-base sm:text-lg font-medium text-primary-900 mb-2">No Orders Data</h3>
    <p className="text-xs sm:text-sm text-primary-600 max-w-sm mx-auto">
      Select a date range to view orders and refund data.
    </p>
  </div>
);

export default function OrdersRefundPage() {
  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Header Section */}
      <div className="border-b border-primary-900/10 -mx-4 sm:-mx-6 lg:-mx-20 px-4 sm:px-6 lg:px-20 pb-4 sm:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-primary-900">Orders & Refund</h1>
            <p className="text-xs sm:text-sm text-primary-600 mt-1">Track orders and refund metrics</p>
          </div>
          <DateRangePicker />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 sm:space-y-10">
        {/* Summary Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-1 h-5 bg-primary-900 rounded-full" />
            <h2 className="text-sm sm:text-base font-medium text-primary-900">Summary</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <SummaryCard
              title="Total Orders"
              value="Loading..."
              icon={ShoppingBagIcon}
              loading={true}
            />
            <SummaryCard
              title="Total Refunds"
              value="Loading..."
              icon={ArrowPathIcon}
              loading={true}
            />
          </div>
        </section>

        {/* Orders List */}
        <section>
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-1 h-5 bg-primary-900 rounded-full" />
            <h2 className="text-sm sm:text-base font-medium text-primary-900">Orders List</h2>
          </div>
          <EmptyState />
        </section>
      </div>
    </div>
  );
} 