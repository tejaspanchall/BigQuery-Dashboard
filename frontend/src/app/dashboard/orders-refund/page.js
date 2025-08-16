'use client';

import { useState, useEffect, useMemo } from 'react';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { 
  ArrowDownTrayIcon, 
  FunnelIcon,
  ShoppingBagIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import useDateRangeStore from '@/lib/store/dateRange';
import { 
  fetchDailyShopify, 
  fetchShopifyOrders, 
  fetchShopifyReturns, 
  exportShopifyOrders 
} from '@/lib/utils/api';

const SummaryCard = ({ title, value, loading, icon: Icon }) => {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-primary-900/10 hover:border-primary-900/20 transition-all duration-300 shadow-sm hover:shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-primary-600 truncate">{title}</p>
          <h3 className="text-base sm:text-lg font-semibold text-primary-900 mt-1 truncate">
            {loading ? 'Loading...' : value.toLocaleString('en-IN')}
          </h3>
        </div>
        {Icon && (
          <div className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-50 ml-3 flex-shrink-0">
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-900" />
          </div>
        )}
      </div>
    </div>
  );
};

const ExportCard = ({ onExport, loading }) => {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-primary-900/10 hover:border-primary-900/20 transition-all duration-300 shadow-sm hover:shadow">
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2 text-primary-900">
          <ArrowDownTrayIcon className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-medium">Export Orders</span>
        </div>
        <button
          onClick={() => onExport()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Exporting...' : 'Export to Excel'}
        </button>
      </div>
    </div>
  );
};

const OrdersContent = ({ orders, loading }) => {
  if (!orders?.length && !loading) {
    return <EmptyState />;
  }

  return <OrdersList orders={orders} />;
};

const FiltersCard = ({ filters, setFilters, showFilters, setShowFilters }) => {
  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
          showFilters 
            ? 'bg-primary-100 border-primary-300 text-primary-900' 
            : 'bg-white border-primary-200 text-primary-600 hover:border-primary-300'
        }`}
      >
        <FunnelIcon className="w-5 h-5" />
        <span>Filters</span>
      </button>

      {showFilters && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg border border-primary-200 shadow-lg z-50 p-4">
          <div className="space-y-3">
            <select
              value={filters.financial_status}
              onChange={(e) => setFilters(prev => ({ ...prev, financial_status: e.target.value }))}
              className="w-full text-sm rounded-lg border-primary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Financial Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={filters.fulfillment_status}
              onChange={(e) => setFilters(prev => ({ ...prev, fulfillment_status: e.target.value }))}
              className="w-full text-sm rounded-lg border-primary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Fulfillment Status</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="partial">Partial</option>
              <option value="unfulfilled">Unfulfilled</option>
            </select>
            <select
              value={filters.payment_gateway}
              onChange={(e) => setFilters(prev => ({ ...prev, payment_gateway: e.target.value }))}
              className="w-full text-sm rounded-lg border-primary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Payment Methods</option>
              <option value="Razorpay Secure">Razorpay</option>
              <option value="Cash on Delivery (COD)">COD</option>
            </select>
            <select
              value={filters.refund_status}
              onChange={(e) => setFilters(prev => ({ ...prev, refund_status: e.target.value }))}
              className="w-full text-sm rounded-lg border-primary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Refund Status</option>
              <option value="refunded">Refunded</option>
              <option value="not_refunded">Not Refunded</option>
            </select>
            <input
              type="text"
              value={filters.customer_email}
              onChange={(e) => setFilters(prev => ({ ...prev, customer_email: e.target.value }))}
              placeholder="Filter by customer email"
              className="w-full text-sm rounded-lg border-primary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="bg-white rounded-xl p-6 sm:p-12 border border-primary-900/10 hover:border-primary-900/20 transition-all duration-300 shadow-sm hover:shadow text-center">
    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-50 mb-3 sm:mb-4">
      <ShoppingBagIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-900" />
    </div>
    <h3 className="text-base sm:text-lg font-medium text-primary-900 mb-2">No Orders Data</h3>
    <p className="text-xs sm:text-sm text-primary-600 max-w-sm mx-auto">
      Select a date range to view orders and refund data.
    </p>
  </div>
);

const OrdersList = ({ orders }) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  const sortedOrders = useMemo(() => {
    if (!sortConfig.key) return orders;

    return [...orders].sort((a, b) => {
      if (a[sortConfig.key] === null) return 1;
      if (b[sortConfig.key] === null) return -1;
      
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle date fields
      if (sortConfig.key === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      // Handle numeric fields
      if (['total_price', 'subtotal_price', 'total_discounts', 'total_tax', 'refund_amount'].includes(sortConfig.key)) {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [orders, sortConfig]);

  const requestSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '⋮';
    }
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  return (
    <div className="relative">
      <div className="max-h-[600px] overflow-auto rounded-lg border border-primary-900/10">
        <table className="w-full">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-primary-900/10">
              <th onClick={() => requestSort('created_at')} className="px-4 py-3 text-left text-xs font-medium text-primary-900 cursor-pointer hover:bg-primary-50">
                Created Date {getSortIcon('created_at')}
              </th>
              <th onClick={() => requestSort('id')} className="px-4 py-3 text-left text-xs font-medium text-primary-900 cursor-pointer hover:bg-primary-50">
                Order ID {getSortIcon('id')}
              </th>
              <th onClick={() => requestSort('order_number')} className="px-4 py-3 text-left text-xs font-medium text-primary-900 cursor-pointer hover:bg-primary-50">
                Order # {getSortIcon('order_number')}
              </th>
              <th onClick={() => requestSort('total_price')} className="px-4 py-3 text-left text-xs font-medium text-primary-900 cursor-pointer hover:bg-primary-50">
                Total Price {getSortIcon('total_price')}
              </th>
              <th onClick={() => requestSort('subtotal_price')} className="px-4 py-3 text-left text-xs font-medium text-primary-900 cursor-pointer hover:bg-primary-50">
                Subtotal {getSortIcon('subtotal_price')}
              </th>
              <th onClick={() => requestSort('total_discounts')} className="px-4 py-3 text-left text-xs font-medium text-primary-900 cursor-pointer hover:bg-primary-50">
                Discounts {getSortIcon('total_discounts')}
              </th>
              <th onClick={() => requestSort('total_tax')} className="px-4 py-3 text-left text-xs font-medium text-primary-900 cursor-pointer hover:bg-primary-50">
                Tax {getSortIcon('total_tax')}
              </th>
              <th onClick={() => requestSort('financial_status')} className="px-4 py-3 text-left text-xs font-medium text-primary-900 cursor-pointer hover:bg-primary-50">
                Status {getSortIcon('financial_status')}
              </th>
              <th onClick={() => requestSort('fulfillment_status')} className="px-4 py-3 text-left text-xs font-medium text-primary-900 cursor-pointer hover:bg-primary-50">
                Fulfillment {getSortIcon('fulfillment_status')}
              </th>
              <th onClick={() => requestSort('payment_gateway')} className="px-4 py-3 text-left text-xs font-medium text-primary-900 cursor-pointer hover:bg-primary-50">
                Payment Gateway {getSortIcon('payment_gateway')}
              </th>
              <th onClick={() => requestSort('refund_amount')} className="px-4 py-3 text-left text-xs font-medium text-primary-900 cursor-pointer hover:bg-primary-50">
                Refund {getSortIcon('refund_amount')}
              </th>
              <th onClick={() => requestSort('customer_email')} className="px-4 py-3 text-left text-xs font-medium text-primary-900 cursor-pointer hover:bg-primary-50">
                Customer Email {getSortIcon('customer_email')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-primary-900/10">
            {sortedOrders.map(order => (
              <tr key={order.id} className="hover:bg-primary-50/50 transition-colors">
                <td className="px-4 py-3 text-sm text-primary-900 whitespace-nowrap">{order.created_at}</td>
                <td className="px-4 py-3 text-sm text-primary-900 whitespace-nowrap">{order.id}</td>
                <td className="px-4 py-3 text-sm text-primary-900 whitespace-nowrap">{order.order_number}</td>
                <td className="px-4 py-3 text-sm text-primary-900 whitespace-nowrap">₹{order.total_price.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-primary-900 whitespace-nowrap">₹{order.subtotal_price.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-primary-900 whitespace-nowrap">₹{order.total_discounts.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-primary-900 whitespace-nowrap">₹{order.total_tax.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    order.financial_status === 'paid' ? 'bg-green-100 text-green-800' :
                    order.financial_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.financial_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    order.fulfillment_status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                    order.fulfillment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.fulfillment_status || 'Unfulfilled'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-primary-900 whitespace-nowrap">{order.payment_gateway}</td>
                <td className="px-4 py-3 text-sm text-primary-900 whitespace-nowrap">
                  {order.refund_amount !== 0 ? `₹${Math.abs(order.refund_amount).toFixed(2)}` : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-primary-900 whitespace-nowrap">{order.customer_email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-primary-600 p-4 text-center border-t border-primary-900/10 bg-white rounded-b-lg">
        Showing {orders.length} orders
      </div>
    </div>
  );
};

export default function OrdersRefundPage() {
  const { startDate, endDate } = useDateRangeStore();
  const [ordersData, setOrdersData] = useState({ data: [] });
  const [summaryData, setSummaryData] = useState({ total_orders: 0, return_orders: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    financial_status: 'all',
    fulfillment_status: 'all',
    payment_gateway: 'all',
    customer_email: '',
    refund_status: 'all'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, totalOrdersResponse, returnsResponse] = await Promise.all([
        fetchDailyShopify(startDate, endDate),
        fetchShopifyOrders(startDate, endDate),
        fetchShopifyReturns(startDate, endDate)
      ]);

      setOrdersData(ordersResponse);
      setSummaryData({
        total_orders: totalOrdersResponse.total_orders,
        return_orders: returnsResponse.return_orders
      });
    } catch (error) {
      console.error('Error fetching orders data:', error);
      setOrdersData({ data: [] });
      setSummaryData({ total_orders: 0, return_orders: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportShopifyOrders(startDate, endDate, filters);
    } catch (error) {
      console.error('Error exporting orders:', error);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Filter orders based on selected filters
  const filteredOrders = useMemo(() => {
    return ordersData.data.filter(order => {
      let matches = true;
      if (filters.financial_status !== 'all') {
        matches = matches && order.financial_status === filters.financial_status;
      }
      if (filters.fulfillment_status !== 'all') {
        matches = matches && order.fulfillment_status === filters.fulfillment_status;
      }
      if (filters.payment_gateway !== 'all') {
        matches = matches && order.payment_gateway === filters.payment_gateway;
      }
      if (filters.customer_email.trim() !== '') {
        matches = matches && order.customer_email.toLowerCase().includes(filters.customer_email.toLowerCase().trim());
      }
      if (filters.refund_status !== 'all') {
        matches = matches && (
          filters.refund_status === 'refunded' 
            ? order.refund_amount !== 0 
            : order.refund_amount === 0
        );
      }
      return matches;
    });
  }, [ordersData.data, filters]);

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Header Section */}
      <div className="border-b border-primary-900/10 -mx-4 sm:-mx-6 lg:-mx-20 px-4 sm:px-6 lg:px-20 pb-4 sm:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-primary-900">Orders & Refunds</h1>
            <p className="text-xs sm:text-sm text-primary-600 mt-1">Track and manage your orders and refunds</p>
          </div>
          <div className="w-full sm:w-auto">
            <DateRangePicker />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Summary and Export Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Summary Cards */}
          <div className="sm:col-span-2 grid grid-cols-2 gap-4">
            <SummaryCard
              title="Total Orders"
              value={summaryData.total_orders}
              loading={loading}
              icon={ShoppingBagIcon}
            />
            <SummaryCard
              title="Return Orders"
              value={summaryData.return_orders}
              loading={loading}
              icon={ArrowPathIcon}
            />
          </div>

          {/* Export Card */}
          <ExportCard onExport={handleExport} loading={exporting} />
        </div>

        {/* Orders List Header and Filters */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-primary-900 rounded-full" />
            <h2 className="text-sm sm:text-base font-medium text-primary-900">Orders List</h2>
          </div>
          <FiltersCard
            filters={filters}
            setFilters={setFilters}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
        </div>

        {/* Orders List Content */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900"></div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <OrdersContent orders={filteredOrders} loading={loading} />
          </div>
        )}
      </div>
    </div>
  );
} 