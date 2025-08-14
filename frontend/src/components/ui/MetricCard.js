import React from 'react';

const MetricCard = ({ title, value, format = 'number', loading = false }) => {
  const formatValue = (val) => {
    if (loading) return 'Loading...';
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

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-primary-500">{title}</span>
      <span className="text-base font-medium text-primary-900">
        {formatValue(value)}
      </span>
    </div>
  );
};

export default MetricCard; 