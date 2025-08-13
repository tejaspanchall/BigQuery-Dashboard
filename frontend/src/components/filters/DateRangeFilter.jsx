import { useState } from 'react'
import { CalendarIcon } from '@heroicons/react/24/outline'

export default function DateRangeFilter({ onDateChange }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleDateChange = () => {
    if (startDate && endDate) {
      onDateChange({ startDate, endDate })
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <CalendarIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value)
            handleDateChange()
          }}
          className="pl-10 pr-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500 sm:text-sm [color-scheme:dark]"
        />
      </div>
      <span className="text-gray-400">to</span>
      <div className="relative">
        <CalendarIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value)
            handleDateChange()
          }}
          className="pl-10 pr-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500 sm:text-sm [color-scheme:dark]"
        />
      </div>
    </div>
  )
} 