import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useDateRangeStore from '@/lib/store/dateRange';
import { CalendarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const DateRangePicker = () => {
  const { startDate, endDate, setDateRange, setPreset, selectedPreset } = useDateRangeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handlePresetChange = (preset) => {
    setPreset(preset);
    if (preset === 'custom') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      setIsOpen(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateRange = () => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    
    switch (selectedPreset) {
      case 'last24Hours':
        return `Last 24 hours · ${start} - ${end}`;
      case 'lastWeek':
        return `Last 7 days · ${start} - ${end}`;
      case 'lastMonth':
        return `Last month · ${start} - ${end}`;
      case 'custom':
        return `Custom · ${start} - ${end}`;
      default:
        return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-700 transition-colors"
      >
        <CalendarIcon className="h-4 w-4 text-gray-500" />
        <span>{formatDateRange()}</span>
        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[400px] bg-white rounded-lg border border-gray-200 shadow-lg z-50">
          <div className="p-2">
            <button
              onClick={() => handlePresetChange('last24Hours')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                selectedPreset === 'last24Hours' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Last 24 hours
            </button>
            <button
              onClick={() => handlePresetChange('lastWeek')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                selectedPreset === 'lastWeek' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Last 7 days
            </button>
            <button
              onClick={() => handlePresetChange('lastMonth')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                selectedPreset === 'lastMonth' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Last month
            </button>
            <button
              onClick={() => handlePresetChange('custom')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                selectedPreset === 'custom' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Custom range
            </button>
          </div>

          {(selectedPreset === 'custom' || showCustomPicker) && (
            <div className="border-t border-gray-200 p-3">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <DatePicker
                      selected={startDate}
                      onChange={handleStartDateChange}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      dateFormat="MMM d, yyyy"
                      className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholderText="Start date"
                      popperClassName="date-picker-popper"
                      popperModifiers={[
                        {
                          name: "preventOverflow",
                          options: {
                            rootBoundary: "viewport",
                            tether: false,
                            altAxis: true
                          }
                        }
                      ]}
                    />
                  </div>
                  <div className="relative">
                    <DatePicker
                      selected={endDate}
                      onChange={handleEndDateChange}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      dateFormat="MMM d, yyyy"
                      className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholderText="End date"
                      popperClassName="date-picker-popper"
                      popperModifiers={[
                        {
                          name: "preventOverflow",
                          options: {
                            rootBoundary: "viewport",
                            tether: false,
                            altAxis: true
                          }
                        }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker; 