import { useState } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'

export default function DataTable({ columns, data, title, onExportCsv }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-base font-semibold leading-6 text-gray-100">{title}</h2>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-100 shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-gray-700"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-100 cursor-pointer hover:bg-gray-800"
                      onClick={() => requestSort(column.key)}
                    >
                      <div className="group inline-flex">
                        {column.label}
                        <span className="ml-2 flex-none rounded text-gray-400">
                          {sortConfig.key === column.key ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            )
                          ) : (
                            <ChevronUpIcon className="h-4 w-4 invisible group-hover:visible" />
                          )}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 bg-gray-900">
                {sortedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-800">
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-300"
                      >
                        {column.formatter
                          ? column.formatter(row[column.key])
                          : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 