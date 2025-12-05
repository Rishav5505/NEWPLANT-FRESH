import React, { useState, useEffect } from 'react';
import {
  calculateRevenueStats,
  calculateCustomerStats,
  getOrderStatusDistribution,
  getPaymentStatusDistribution,
  getTopProducts,
  getCustomerLTV,
  exportToCSV,
} from '../utils/adminAnalytics';

/**
 * Analytics Dashboard Component
 * View sales metrics, customer insights, and export reports
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const AnalyticsDashboard = ({ adminToken }) => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [orderStatusDist, setOrderStatusDist] = useState({});
  const [paymentStatusDist, setPaymentStatusDist] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [ltv, setLtv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30days'); // '7days', '30days', '90days', 'all'

  // Fetch orders and users
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [ordersRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/orders`, {
          headers: { 'Authorization': `Bearer ${adminToken}` },
        }).catch(() => null),
        fetch(`${API_BASE}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${adminToken}` },
        }).catch(() => null),
      ]);

      let ordersData = [];
      let usersData = [];

      // Try to get real data, fallback to mock data
      if (ordersRes && ordersRes.ok) {
        const data = await ordersRes.json();
        ordersData = data.orders || data || [];
      } else {
        // Mock data for testing
        ordersData = [
          { _id: '1', userId: 'user1', total: 2500, status: 'delivered', paymentStatus: 'paid', createdAt: new Date().toISOString(), items: [{ name: 'Monstera', price: 500, quantity: 5 }] },
          { _id: '2', userId: 'user2', total: 1800, status: 'shipped', paymentStatus: 'paid', createdAt: new Date().toISOString(), items: [{ name: 'Rose Kit', price: 900, quantity: 2 }] },
          { _id: '3', userId: 'user3', total: 3200, status: 'processing', paymentStatus: 'pending', createdAt: new Date().toISOString(), items: [{ name: 'Planter', price: 800, quantity: 4 }] },
        ];
      }

      if (usersRes && usersRes.ok) {
        const data = await usersRes.json();
        usersData = data.users || data || [];
      } else {
        // Mock data for testing
        usersData = [
          { _id: 'user1', name: 'John Doe', email: 'john@example.com', phone: '+91-9876543210', role: 'customer', lastLogin: new Date().toISOString(), createdAt: new Date().toISOString() },
          { _id: 'user2', name: 'Jane Smith', email: 'jane@example.com', phone: '+91-9876543211', role: 'customer', lastLogin: new Date().toISOString(), createdAt: new Date().toISOString() },
          { _id: 'user3', name: 'Admin User', email: 'admin@example.com', phone: '+91-9876543212', role: 'admin', lastLogin: new Date().toISOString(), createdAt: new Date().toISOString() },
        ];
      }

      // Filter by date range
      const filteredOrders = filterByDateRange(ordersData, dateRange);

      setOrders(filteredOrders);
      setUsers(usersData);

      // Calculate analytics
      setRevenueStats(calculateRevenueStats(filteredOrders));
      setCustomerStats(calculateCustomerStats(usersData));
      setOrderStatusDist(getOrderStatusDistribution(filteredOrders));
      setPaymentStatusDist(getPaymentStatusDistribution(filteredOrders));
      setTopProducts(getTopProducts(filteredOrders, 5));
      setLtv(getCustomerLTV(filteredOrders, usersData));
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      alert('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by date range
  const filterByDateRange = (data, range) => {
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        return data;
    }

    return data.filter(order => new Date(order.createdAt) >= startDate);
  };

  useEffect(() => {
    if (adminToken) {
      fetchAnalyticsData();
    }
  }, [adminToken, dateRange]);

  // Export reports
  const handleExportOrders = () => {
    const exportData = orders.map(order => ({
      'Order ID': order._id,
      'Customer': order.userId,
      'Total': order.total,
      'Status': order.status,
      'Payment': order.paymentStatus,
      'Date': new Date(order.createdAt).toLocaleDateString(),
    }));
    exportToCSV(exportData, 'orders-report');
  };

  const handleExportUsers = () => {
    const exportData = users.map(user => ({
      'User ID': user._id,
      'Name': user.name,
      'Email': user.email,
      'Phone': user.phone,
      'Joined': new Date(user.createdAt).toLocaleDateString(),
    }));
    exportToCSV(exportData, 'users-report');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-2">📊 Analytics & Reports</h2>
        <p className="text-indigo-100">View sales metrics, customer insights, and business performance</p>
      </div>

      {/* Date Range Filter */}
      <div className="flex gap-2">
        {[
          { id: '7days', label: 'Last 7 Days' },
          { id: '30days', label: 'Last 30 Days' },
          { id: '90days', label: 'Last 90 Days' },
          { id: 'all', label: 'All Time' },
        ].map(range => (
          <button
            key={range.id}
            onClick={() => setDateRange(range.id)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              dateRange === range.id
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Revenue & Customer Stats */}
      {revenueStats && customerStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-600">₹{revenueStats.totalRevenue}</p>
            <p className="text-xs text-gray-500 mt-2">{revenueStats.totalOrders} orders</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-2">Avg Order Value</p>
            <p className="text-3xl font-bold text-green-600">₹{revenueStats.avgOrderValue}</p>
            <p className="text-xs text-gray-500 mt-2">{revenueStats.completionRate}% completed</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 mb-2">Total Users</p>
            <p className="text-3xl font-bold text-purple-600">{customerStats.totalUsers}</p>
            <p className="text-xs text-gray-500 mt-2">{customerStats.newUsersThisMonth} new this month</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <p className="text-sm text-gray-600 mb-2">Active Users</p>
            <p className="text-3xl font-bold text-orange-600">{customerStats.activeUsers}</p>
            <p className="text-xs text-gray-500 mt-2">{customerStats.userRetention}% retention</p>
          </div>
        </div>
      )}

      {/* Order & Payment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Order Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(orderStatusDist).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      status === 'delivered' ? 'bg-green-600' :
                      status === 'shipped' ? 'bg-blue-600' :
                      status === 'processing' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${(count / orders.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Payment Status</h3>
          <div className="space-y-3">
            {Object.entries(paymentStatusDist).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      status === 'paid' ? 'bg-green-600' :
                      status === 'pending' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${(count / orders.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">🏆 Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Units Sold</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topProducts.map((product, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.count} units</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{product.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Lifetime Value */}
      {ltv && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Average Customer LTV</p>
            <p className="text-3xl font-bold text-blue-600">₹{ltv.avgLTV}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-2">Highest Customer Value</p>
            <p className="text-3xl font-bold text-green-600">₹{ltv.maxLTV}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 mb-2">Lowest Customer Value</p>
            <p className="text-3xl font-bold text-purple-600">₹{ltv.minLTV}</p>
          </div>
        </div>
      )}

      {/* Export Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleExportOrders}
          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium transition"
        >
          📥 Export Orders Report
        </button>
        <button
          onClick={handleExportUsers}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition"
        >
          📥 Export Users Report
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
