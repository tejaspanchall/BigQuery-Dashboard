import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const MetricCard = ({ title, value, change, format = 'number', loading = false }) => {
  const formatValue = (val) => {
    if (loading) return '-';
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

  const getChangeColor = () => {
    if (!change) return 'text-primary-500';
    return change > 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-primary-100">
      <h3 className="text-sm font-medium text-primary-500 mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-primary-900">
          {formatValue(value)}
        </span>
      </div>
      {loading && (
        <div className="animate-pulse mt-2">
          <div className="h-2 bg-primary-100 rounded"></div>
        </div>
      )}
    </div>
  );
};

export default MetricCard; 