import { create } from 'zustand';
import { startOfMonth, endOfMonth } from 'date-fns';

// Set default dates to November 2024
const defaultStartDate = new Date(2024, 10, 1); // Month is 0-based, so 10 is November
const defaultEndDate = new Date(2024, 10, 30); // Last day of November 2024

const useDateRangeStore = create((set) => ({
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  setDateRange: (startDate, endDate) => set({ startDate, endDate }),
}));

export default useDateRangeStore; 