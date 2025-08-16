import { create } from 'zustand';
import { startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from 'date-fns';

// Set default dates to November 2024
const defaultDate = new Date(2024, 10, 30); // November 30, 2024

const useDateRangeStore = create((set) => ({
  startDate: defaultDate,
  endDate: defaultDate,
  selectedPreset: 'last24Hours',
  
  setDateRange: (startDate, endDate) => {
    set(() => ({ 
      startDate, 
      endDate,
      selectedPreset: 'custom' 
    }));
  },

  setPreset: (preset) => {
    const now = defaultDate; // Using November 30, 2024 as reference
    
    switch (preset) {
      case 'last24Hours':
        set(() => ({
          startDate: startOfDay(now),
          endDate: endOfDay(now),
          selectedPreset: preset
        }));
        break;
      case 'lastWeek':
        set(() => ({
          startDate: startOfDay(subDays(now, 6)), // 7 days including today
          endDate: endOfDay(now),
          selectedPreset: preset
        }));
        break;
      case 'lastMonth':
        set(() => ({
          startDate: startOfMonth(now),
          endDate: endOfMonth(now),
          selectedPreset: preset
        }));
        break;
      default:
        set(() => ({
          selectedPreset: preset
        }));
        break;
    }
  }
}));

export default useDateRangeStore; 