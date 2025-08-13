import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import { clsx } from 'clsx'

export default function KpiCard({ title, value, trend, trendValue, formatter }) {
  const formattedValue = formatter ? formatter(value) : value
  const formattedTrendValue = formatter ? formatter(Math.abs(trendValue)) : Math.abs(trendValue)
  
  return (
    <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        {trend && trendValue !== 0 && (
          <div
            className={clsx(
              'flex items-center rounded-full px-2 py-1 text-xs font-medium',
              trendValue > 0
                ? 'bg-gray-700 text-green-400'
                : 'bg-gray-700 text-red-400'
            )}
          >
            {trendValue > 0 ? (
              <ArrowUpIcon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            )}
            <span className="sr-only">
              {trendValue > 0 ? 'Increased by' : 'Decreased by'}
            </span>
            <span className="ml-1">{formattedTrendValue}</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-3xl font-semibold text-gray-100">{formattedValue}</p>
    </div>
  )
} 