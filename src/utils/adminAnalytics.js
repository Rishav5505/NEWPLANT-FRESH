/**
 * Admin Dashboard Analytics & Insights
 * Charts and statistics for admin dashboard
 */

// Revenue Analytics
export const calculateRevenueStats = (orders) => {
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const completionRate = orders.length > 0 ? (completedOrders / orders.length) * 100 : 0;

  return {
    totalRevenue: totalRevenue.toFixed(2),
    avgOrderValue: avgOrderValue.toFixed(2),
    completedOrders,
    completionRate: completionRate.toFixed(1),
    totalOrders: orders.length,
  };
};

// Customer Analytics
export const calculateCustomerStats = (users) => {
  const activeUsers = users.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  const newUsersThisMonth = users.filter(u => {
    const created = new Date(u.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  return {
    totalUsers: users.length,
    activeUsers,
    newUsersThisMonth,
    userRetention: users.length > 0 ? ((activeUsers / users.length) * 100).toFixed(1) : 0,
  };
};

// Order Status Distribution
export const getOrderStatusDistribution = (orders) => {
  const distribution = {
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  orders.forEach(order => {
    const status = order.status || 'processing';
    if (distribution.hasOwnProperty(status)) {
      distribution[status]++;
    }
  });

  return distribution;
};

// Payment Status
export const getPaymentStatusDistribution = (orders) => {
  const distribution = {
    paid: orders.filter(o => o.paymentStatus === 'paid').length,
    pending: orders.filter(o => o.paymentStatus === 'pending').length,
    failed: orders.filter(o => o.paymentStatus === 'failed').length,
  };

  return distribution;
};

// Top Products
export const getTopProducts = (orders, limit = 5) => {
  const productMap = {};
  
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const key = item.name || item.id;
        if (!productMap[key]) {
          productMap[key] = { name: key, count: 0, revenue: 0 };
        }
        productMap[key].count += item.quantity || 1;
        productMap[key].revenue += item.price * (item.quantity || 1);
      });
    }
  });

  return Object.values(productMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

// Customer Lifetime Value
export const getCustomerLTV = (orders, users) => {
  const userMap = {};
  
  orders.forEach(order => {
    const userId = order.userId;
    if (!userMap[userId]) {
      userMap[userId] = { count: 0, spent: 0 };
    }
    userMap[userId].count += 1;
    userMap[userId].spent += Number(order.total) || 0;
  });

  const values = Object.values(userMap);
  if (values.length === 0) return { avgLTV: 0, maxLTV: 0, minLTV: 0 };

  const avgLTV = values.reduce((sum, v) => sum + v.spent, 0) / values.length;
  const maxLTV = Math.max(...values.map(v => v.spent));
  const minLTV = Math.min(...values.map(v => v.spent));

  return {
    avgLTV: avgLTV.toFixed(2),
    maxLTV: maxLTV.toFixed(2),
    minLTV: minLTV.toFixed(2),
  };
};

// Export data for reports
export const exportToCSV = (data, filename) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Invalid data for export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csv = [headers.join(','), ...data.map(row => headers.map(h => JSON.stringify(row[h])).join(','))].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${Date.now()}.csv`;
  link.click();
};

// Inventory Alerts
export const checkInventoryAlerts = (products) => {
  const lowStockThreshold = 5;
  return products.filter(p => (p.stock || 0) < lowStockThreshold);
};

// Notification System
export const createNotification = (type, message, duration = 5000) => {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
    type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
  }`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, duration);
};
