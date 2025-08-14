import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useDateRangeStore from '@/lib/store/dateRange';
import { CalendarIcon } from '@heroicons/react/24/outline';

const DateRangePicker = () => {
  const { startDate, endDate, setDateRange } = useDateRangeStore();

  const handleStartDateChange = (date) => {
    if (date > endDate) {
      setDateRange(date, date);
    } else {
      setDateRange(date, endDate);
    }
  };

  const handleEndDateChange = (date) => {
    if (date < startDate) {
      setDateRange(date, date);
    } else {
      setDateRange(startDate, date);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border border-primary-200 p-2">
      <CalendarIcon className="h-5 w-5 text-primary-400" />
      <div className="flex items-center">
        <DatePicker
          selected={startDate}
          onChange={handleStartDateChange}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="dd MMM yyyy"
          className="w-32 text-sm text-primary-900 focus:outline-none"
        />
        <span className="mx-2 text-primary-400">to</span>
        <DatePicker
          selected={endDate}
          onChange={handleEndDateChange}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          dateFormat="dd MMM yyyy"
          className="w-32 text-sm text-primary-900 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default DateRangePicker; 