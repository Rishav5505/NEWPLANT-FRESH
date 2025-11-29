import React from 'react';
import { formatINR } from '../utils/priceUtils';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const MyOrders = ({ setCurrentPage }) => {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedOrder, setSelectedOrder] = React.useState(null);

  React.useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Please login to view orders');
        setCurrentPage?.('home');
        return;
      }

      // Fetch user's orders from the /api/my-orders endpoint
      const resp = await fetch(`${API_BASE}/api/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-900/30 border-yellow-700 text-yellow-300',
      'processing': 'bg-blue-900/30 border-blue-700 text-blue-300',
      'shipped': 'bg-purple-900/30 border-purple-700 text-purple-300',
      'delivered': 'bg-green-900/30 border-green-700 text-green-300',
      'paid': 'bg-green-900/30 border-green-700 text-green-300',
      'failed': 'bg-red-900/30 border-red-700 text-red-300'
    };
    return colors[status] || 'bg-gray-900/30 border-gray-700 text-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] to-[#051108] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-green-300">📦 Your Orders</h1>
          <button 
            onClick={() => setCurrentPage?.('home')} 
            className="px-4 py-2 bg-green-700 rounded hover:bg-green-600 text-white"
          >
            ← Back
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[#07110a] p-8 rounded-lg border border-green-700 text-center">
            <p className="text-2xl mb-4">📭</p>
            <p className="text-gray-300 text-lg">No orders found</p>
            <button 
              onClick={() => setCurrentPage?.('home')} 
              className="mt-4 px-4 py-2 bg-green-600 rounded text-white hover:bg-green-500"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-2">
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 rounded-lg border cursor-pointer transition ${
                      selectedOrder?._id === order._id
                        ? 'bg-green-900/20 border-green-600'
                        : 'bg-[#07110a] border-green-800 hover:border-green-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-green-300">Order #{order._id?.slice(-8)}</div>
                        <div className="text-xs text-gray-400">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">₹{Number(order.total || 0).toFixed(2)}</div>
                        <div className="text-xs text-gray-400">{order.items?.length || 0} items</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(order.status || 'pending')}`}>
                        {order.status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Detail */}
            {selectedOrder && (
              <div className="bg-[#07110a] p-6 rounded-lg border border-green-700">
                <h3 className="text-xl font-bold text-green-300 mb-4">Order Details</h3>

                <div className="space-y-4 mb-4 pb-4 border-b border-green-800">
                  <div>
                    <div className="text-sm text-gray-400">Delivery To</div>
                    <div className="font-semibold text-white">{selectedOrder.deliveryName || '—'}</div>
                    <div className="text-sm text-gray-400">{selectedOrder.deliveryPhone || '—'}</div>
                    <div className="text-sm text-gray-400">{selectedOrder.deliveryEmail || '—'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Address</div>
                    <div className="text-sm text-white whitespace-pre-wrap break-words">{selectedOrder.deliveryAddress || '—'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Location</div>
                    <div className="font-semibold text-white">{selectedOrder.deliveryLocation || '—'}</div>
                  </div>
                </div>

                <h4 className="font-bold text-green-300 mb-2">Items</h4>
                <div className="space-y-2 mb-4 pb-4 border-b border-green-800">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="text-green-400">₹{Number(item.price || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{Number(selectedOrder.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Tax</span>
                    <span>₹{Number(selectedOrder.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Shipping</span>
                    <span>₹{Number(selectedOrder.shipping || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-300 pt-2 border-t border-green-800">
                    <span>Total</span>
                    <span>₹{Number(selectedOrder.total || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Payment</span>
                    <span className="font-semibold uppercase">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status || 'pending')}`}>
                      {selectedOrder.status || 'pending'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
