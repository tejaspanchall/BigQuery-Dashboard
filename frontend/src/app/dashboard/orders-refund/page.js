'use client';

import { useState, useEffect } from 'react';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { 
  ShoppingBagIcon, 
  ArrowPathIcon, 
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { 
  fetchDailyShopify, 
  fetchShopifyOrders, 
  fetchShopifyReturns,
  exportShopifyOrders 
} from '@/lib/utils/api';
import useDateRangeStore from '@/lib/store/dateRange';

const SummaryCard = ({ title, value, icon: Icon, loading }) => (
  <div className="bg-white rounded-xl p-4 sm:p-6 border border-primary-900/10 hover:border-primary-900/20 transition-all duration-300 shadow-sm hover:shadow">
    <div className="flex items-start justify-between">
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2 text-primary-900">
          <Icon className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-medium">{title}</span>
        </div>
        <div className="text-lg sm:text-2xl font-semibold text-primary-900">
          {loading ? 'Loading...' : value}
        </div>
      </div>
    </div>
  </div>
);

const ExportCard = ({ onExport, loading }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    financial_status: 'all',
    fulfillment_status: 'all',
    payment_gateway: 'all'
  });

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-primary-900/10 hover:border-primary-900/20 transition-all duration-300 shadow-sm hover:shadow">
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-900">
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span className="text-xs sm:text-sm font-medium">Export Orders</span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-primary-600 hover:text-primary-900"
          >
            <FunnelIcon className="w-5 h-5" />
          </button>
        </div>
        
        {showFilters ? (
          <div className="space-y-3 pt-2">
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
          </div>
        ) : (
          <div className="text-sm text-primary-600">
            Click the filter icon to customize export
          </div>
        )}
        
        <button
          onClick={() => onExport(filters)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Exporting...' : 'Download Excel'}
        </button>
      </div>
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

const OrdersList = ({ orders }) => (
  <div className="bg-white rounded-xl border border-primary-900/10">
    <div className="max-h-[600px] overflow-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-primary-50 z-10">
          <tr className="border-b border-primary-900/10">
            <th className="px-4 py-3 text-left text-xs font-medium text-primary-900">Created Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-primary-900">Processed Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-primary-900">Order ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-primary-900">Order #</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-primary-900">Total Price</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-primary-900">Subtotal</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-primary-900">Discounts</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-primary-900">Tax</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-primary-900">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-primary-900">Fulfillment</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-primary-900">Payment Gateway</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-primary-900">Refund</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-primary-900">Shop URL</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-primary-900">Customer Email</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-primary-900/10">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-primary-50/50 transition-colors">
              <td className="px-4 py-3 text-sm text-primary-900 whitespace-nowrap">{order.created_at}</td>
              <td className="px-4 py-3 text-sm text-primary-900 whitespace-nowrap">{order.processed_at}</td>
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
              <td className="px-4 py-3 text-sm text-primary-900 whitespace-nowrap">{order.shop_url}</td>
              <td className="px-4 py-3 text-sm text-primary-900 whitespace-nowrap">{order.customer_email}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs text-primary-600 p-4 text-center border-t border-primary-900/10">
        Showing {orders.length} orders
      </div>
    </div>
  </div>
);

export default function OrdersRefundPage() {
  const { startDate, endDate } = useDateRangeStore();
  const [ordersData, setOrdersData] = useState({ data: [] });
  const [summaryData, setSummaryData] = useState({ total_orders: 0, return_orders: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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

  const handleExport = async (filters) => {
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

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Header Section */}
      <div className="border-b border-primary-900/10 -mx-4 sm:-mx-6 lg:-mx-20 px-4 sm:px-6 lg:px-20 pb-4 sm:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-primary-900">Orders & Refund</h1>
            <p className="text-xs sm:text-sm text-primary-600 mt-1">Track orders and refund metrics</p>
          </div>
          <DateRangePicker />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 sm:space-y-10">
        {/* Summary Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-1 h-5 bg-primary-900 rounded-full" />
            <h2 className="text-sm sm:text-base font-medium text-primary-900">Summary</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <SummaryCard
              title="Total Orders"
              value={loading ? 'Loading...' : summaryData.total_orders.toLocaleString('en-IN')}
              icon={ShoppingBagIcon}
              loading={loading}
            />
            <SummaryCard
              title="Return Orders"
              value={loading ? 'Loading...' : summaryData.return_orders.toLocaleString('en-IN')}
              icon={ArrowPathIcon}
              loading={loading}
            />
            <ExportCard onExport={handleExport} loading={exporting} />
          </div>
        </section>

        {/* Orders List */}
        <section>
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-1 h-5 bg-primary-900 rounded-full" />
            <h2 className="text-sm sm:text-base font-medium text-primary-900">Orders List</h2>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : !ordersData.data?.length ? (
            <EmptyState />
          ) : (
            <OrdersList orders={ordersData.data} />
          )}
        </section>
      </div>
    </div>
  );
} 