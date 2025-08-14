'use client';

import DateRangePicker from '@/components/ui/DateRangePicker';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const EmptyState = () => (
  <div className="bg-white rounded-xl p-12 border border-primary-900/10 hover:border-primary-900/20 transition-all duration-300 shadow-sm hover:shadow text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 mb-4">
      <MagnifyingGlassIcon className="w-6 h-6 text-primary-900" />
    </div>
    <h3 className="text-lg font-medium text-primary-900 mb-2">No Campaigns Selected</h3>
    <p className="text-sm text-primary-600 max-w-sm mx-auto">
      Select a campaign from the list to view detailed performance metrics and insights.
    </p>
  </div>
);

export default function CampaignDrilldownPage() {
  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="border-b border-primary-900/10 -mx-20 px-20 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-primary-900">Campaign Drilldown</h1>
            <p className="text-sm text-primary-600 mt-1">Analyze individual campaign performance</p>
          </div>
          <DateRangePicker />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-10">
        {/* Campaign Selection */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-5 bg-primary-900 rounded-full" />
            <h2 className="text-base font-medium text-primary-900">Campaign Analysis</h2>
          </div>
          <EmptyState />
        </section>
      </div>
    </div>
  );
} 