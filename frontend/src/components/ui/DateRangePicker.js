import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useDateRangeStore from '@/lib/store/dateRange';
import { format } from 'date-fns';

const DateRangePicker = () => {
  const { startDate, endDate, setDateRange } = useDateRangeStore();

  const handleStartDateChange = (date) => {
    // If new start date is after current end date, adjust end date
    if (date > endDate) {
      setDateRange(date, date);
    } else {
      setDateRange(date, endDate);
    }
  };

  const handleEndDateChange = (date) => {
    // If new end date is before current start date, adjust start date
    if (date < startDate) {
      setDateRange(date, date);
    } else {
      setDateRange(startDate, date);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-primary-100 rounded-lg">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-primary-700">Start Date:</label>
        <DatePicker
          selected={startDate}
          onChange={handleStartDateChange}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="dd MMM yyyy"
          className="px-3 py-2 border border-primary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-primary-700">End Date:</label>
        <DatePicker
          selected={endDate}
          onChange={handleEndDateChange}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          dateFormat="dd MMM yyyy"
          className="px-3 py-2 border border-primary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  );
};

export default DateRangePicker; 