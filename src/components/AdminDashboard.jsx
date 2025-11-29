import React from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const AdminDashboard = ({ setCurrentPage }) => {
  const [orders, setOrders] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [messages, setMessages] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState('');
  const [selectedMessage, setSelectedMessage] = React.useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const resp = await fetch(`${API_BASE}/api/admin/orders`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await resp.json();
      if (!data.success) {
        // capture auth errors so we can show helpful UI
        setAuthError(data.message || 'Failed to fetch orders');
      } else {
        setOrders(data.orders || []);
        setAuthError('');
      }
    } catch (err) {
      console.error(err);
      setAuthError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const resp = await fetch(`${API_BASE}/api/admin/messages`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await resp.json();
      if (!data.success) {
        setAuthError(data.message || 'Failed to fetch messages');
      } else {
        setMessages(data.messages || []);
        setAuthError('');
      }
    } catch (err) {
      console.error(err);
      setAuthError(err.message || 'Failed to fetch messages');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const resp = await fetch(`${API_BASE}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await resp.json();
      if (!data.success) {
        setAuthError(data.message || 'Failed to fetch users');
      } else {
        setUsers(data.users || []);
        setAuthError('');
      }
    } catch (err) {
      console.error(err);
      setAuthError(err.message || 'Failed to fetch users');
    }
  };

  // fetch a single order from server (populated) and update local state
  const fetchOrderAndPopulate = async (id) => {
    try {
      const token = localStorage.getItem('auth_token');
      const resp = await fetch(`${API_BASE}/api/admin/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await resp.json();
      if (data.success && data.order) {
        // replace in orders array if exists
        setOrders(prev => prev.map(o => String(o._id) === String(id) ? data.order : o));
        return data.order;
      }
    } catch (e) { console.error(e); }
    return null;
  };

  // single useEffect to load both lists on mount
  React.useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchMessages();
  }, []);


  const loadOrder = async (id) => {
    try {
      const token = localStorage.getItem('auth_token');
      const resp = await fetch(`${API_BASE}/api/admin/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await resp.json();
      if (data.success) {
        setSelected(data.order);
        setAuthError('');
      } else {
        setAuthError(data.message || 'Failed to load order');
        // try to populate via helper
        const pop = await fetchOrderAndPopulate(id);
        if (pop) setSelected(pop);
      }
    } catch (err) {
      console.error(err);
      setAuthError(err.message || 'Failed to load order');
    }
  };

  const loadMessage = async (id) => {
    try {
      const token = localStorage.getItem('auth_token');
      const resp = await fetch(`${API_BASE}/api/admin/messages/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await resp.json();
      if (data.success) {
        setSelectedMessage(data.message);
      }
    } catch (err) { console.error(err); }
  };

  const markMessageRead = async (id, read) => {
    try {
      const token = localStorage.getItem('auth_token');
      const resp = await fetch(`${API_BASE}/api/admin/messages/${id}/mark-read`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ read })
      });
      const data = await resp.json();
      if (data.success) {
        await fetchMessages();
        if (selectedMessage && String(selectedMessage._id) === String(id)) setSelectedMessage(data.message);
      }
    } catch (err) { console.error(err); }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const resp = await fetch(`${API_BASE}/api/admin/messages/${id}/delete`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await resp.json();
      if (data.success) {
        await fetchMessages();
        if (selectedMessage && String(selectedMessage._id) === String(id)) setSelectedMessage(null);
      }
    } catch (err) { console.error(err); }
  };

  const updateOrder = async (id, changes) => {
    try {
      const token = localStorage.getItem('auth_token');
      const resp = await fetch(`${API_BASE}/api/admin/orders/${id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(changes)
      });
      const data = await resp.json();
      if (data.success) {
        alert('Order updated');
        await fetchOrders();
        setSelected(data.order);
      } else {
        console.warn('Update failed:', data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter(o =>
    String(o._id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    // account for orders where `user` is just an id string (not populated)
    String((typeof o.user === 'string' ? (users.find(u => String(u._id) === String(o.user))?.name) : o.user?.name) || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String((typeof o.user === 'string' ? (users.find(u => String(u._id) === String(o.user))?.email) : o.user?.email) || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // helper to get a display-friendly user object for an order
  const resolveUserForOrder = (o) => {
    if (!o) return { name: 'Unknown', email: '—' };
    if (!o.user) return { name: 'Unknown', email: '—' };
    // if populated
    if (typeof o.user === 'object' && (o.user.name || o.user.email)) return o.user;
    // if it's an id string, look up in users array
    const found = users.find(u => String(u._id) === String(o.user));
    if (found) return found;
    return { name: 'Unknown', email: '—' };
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-300">Admin Dashboard</h1>
        <button onClick={() => setCurrentPage?.('home')} className="px-3 py-2 bg-green-700 rounded">Back</button>
      </div>

      {authError && (
        <div className="mb-4 p-3 rounded bg-red-900/20 border border-red-700 text-sm text-red-200">
          <strong>Admin fetch error:</strong> {authError}. Please ensure you're logged in as an admin and your token is valid.
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Order ID, Customer Name, or Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none focus:border-green-400"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#07110a] p-4 rounded border border-green-800">
          <div className="text-sm text-gray-400">Total Orders</div>
          <div className="text-2xl font-bold text-green-400">{orders.length}</div>
        </div>
        <div className="bg-[#07110a] p-4 rounded border border-green-800">
          <div className="text-sm text-gray-400">Total Users</div>
          <div className="text-2xl font-bold text-green-400">{users.length}</div>
        </div>
        <div className="bg-[#07110a] p-4 rounded border border-green-800">
          <div className="text-sm text-gray-400">Pending</div>
          <div className="text-2xl font-bold text-yellow-400">{orders.filter(o => o.paymentStatus === 'pending').length}</div>
        </div>
        <div className="bg-[#07110a] p-4 rounded border border-green-800">
          <div className="text-sm text-gray-400">Paid</div>
          <div className="text-2xl font-bold text-green-400">{orders.filter(o => o.paymentStatus === 'paid').length}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Orders ({filteredOrders.length})</h2>
            <button onClick={fetchOrders} className="px-2 py-1 bg-green-700 text-sm rounded">Refresh</button>
          </div>
          <div className="bg-[#07110a] p-4 rounded border border-green-800 max-h-[65vh] overflow-auto space-y-2">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No orders found</div>
            ) : (
              filteredOrders.map(o => {
                const displayUser = resolveUserForOrder(o);
                return (
                    <div
                      key={o._id}
                      onClick={() => loadOrder(o._id)}
                      className="p-4 bg-green-900/10 border border-green-700/50 rounded cursor-pointer hover:bg-green-900/20 hover:border-green-600 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-green-300">📦 {displayUser.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-400">{displayUser.email || '—'}</div>
                          <div className="text-xs text-gray-500 mt-1">Order ID: {o._id}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">₹{Number(o.total || 0).toFixed(2)}</div>
                          <div className="text-xs text-gray-400">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(o.paymentStatus)}`}>
                          Payment: {o.paymentStatus}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(o.status || 'pending')}`}>
                          Status: {o.status || 'pending'}
                        </span>
                      </div>
                    </div>
                
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Messages + Users */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Messages ({messages.length})</h2>
          <div className="bg-[#07110a] p-4 rounded border border-green-800 max-h-[35vh] overflow-auto space-y-2 mb-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-6">No messages</div>
            ) : messages.map(m => (
              <div key={m._id} className={`p-3 rounded cursor-pointer flex justify-between items-start ${m.read ? 'bg-green-900/5 border border-green-800/20' : 'bg-green-900/15 border border-green-700/40'}`} onClick={() => loadMessage(m._id)}>
                <div>
                  <div className="font-semibold text-green-300 truncate max-w-[12rem]">{m.name}</div>
                  <div className="text-xs text-gray-400 truncate">{m.email || m.phone}</div>
                </div>
                <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold mb-3">Users ({users.length})</h2>
          <div className="bg-[#07110a] p-4 rounded border border-green-800 max-h-[30vh] overflow-auto space-y-2">
            {users.map(u => (
              <div key={u._id} className="p-3 bg-green-900/10 border border-green-700/30 rounded">
                <div className="font-semibold text-green-300">{u.name}</div>
                <div className="text-xs text-gray-400 truncate">{u.email}</div>
                <div className="text-xs mt-1">
                  <span className={`px-2 py-1 rounded ${u.role === 'admin' ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Detail Panel */}
      {selected && (
        <div className="mt-8 bg-[#07110a] p-6 rounded border-2 border-green-600 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-green-300">Order Details</h3>
              <div className="text-sm text-gray-400 mt-1">Order ID: {selected._id}</div>
            </div>
            <button onClick={() => setSelected(null)} className="text-2xl text-gray-400 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-green-800">
            <div>
              <div className="text-sm text-gray-400">Customer</div>
              {/* resolve user in case selected.user is just an id */}
              {(() => {
                const su = resolveUserForOrder(selected);
                return (
                  <>
                    <div className="font-bold text-lg">{su.name}</div>
                    <div className="text-sm text-gray-400">{su.email}</div>
                  </>
                );
              })()}
            </div>
            <div>
              <div className="text-sm text-gray-400">Payment Method</div>
              <div className="font-bold text-lg uppercase">{selected.paymentMethod}</div>
              <div className={`text-sm px-2 py-1 rounded w-fit mt-1 ${getStatusColor(selected.paymentStatus)}`}>
                {selected.paymentStatus}
              </div>
            </div>
          </div>

          {/* Delivery Details Section */}
          <div className="mb-6 pb-6 border-b border-green-800">
            <h4 className="text-lg font-bold mb-4 text-green-300">📍 Delivery Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-900/10 p-3 rounded border border-green-800/30">
                <div className="text-sm text-gray-400">Full Name</div>
                <div className="font-semibold text-white">{selected.deliveryName || '—'}</div>
              </div>
              <div className="bg-green-900/10 p-3 rounded border border-green-800/30">
                <div className="text-sm text-gray-400">Phone Number</div>
                <div className="font-semibold text-white">{selected.deliveryPhone || '—'}</div>
              </div>
              <div className="bg-green-900/10 p-3 rounded border border-green-800/30">
                <div className="text-sm text-gray-400">Email Address</div>
                <div className="font-semibold text-white truncate">{selected.deliveryEmail || '—'}</div>
              </div>
              <div className="bg-green-900/10 p-3 rounded border border-green-800/30">
                <div className="text-sm text-gray-400">Location / City</div>
                <div className="font-semibold text-white">{selected.deliveryLocation || '—'}</div>
              </div>
            </div>
            <div className="bg-green-900/10 p-3 rounded border border-green-800/30 mt-4">
              <div className="text-sm text-gray-400">Delivery Address</div>
              <div className="font-semibold text-white mt-2 whitespace-pre-wrap break-words">{selected.deliveryAddress || '—'}</div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-bold mb-3 text-green-300">Items</h4>
            {selected?.items?.map(it => (
              <div key={it.productId} className="flex justify-between py-2 px-3 bg-green-900/10 border border-green-800/30 rounded mb-2">
                <div>
                  <div className="font-semibold">{it.emoji} {it.name}</div>
                  <div className="text-sm text-gray-400">Qty: {it.quantity}</div>
                </div>
                <div>₹{Number(it.price || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-green-800">
            <div className="bg-green-900/10 p-3 rounded">
              <div className="text-sm text-gray-400">Subtotal</div>
              <div className="text-xl font-bold text-green-400">₹{Number(selected.subtotal || 0).toFixed(2)}</div>
            </div>
            <div className="bg-green-900/10 p-3 rounded">
              <div className="text-sm text-gray-400">Tax + Shipping</div>
              <div className="text-xl font-bold text-green-400">₹{(Number(selected.tax || 0) + Number(selected.shipping || 0)).toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-green-900/20 p-4 rounded mb-6 border border-green-700">
            <div className="text-sm text-gray-400">Total Amount</div>
            <div className="text-3xl font-bold text-green-300">₹{Number(selected.total || 0).toFixed(2)}</div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-max">
              <div className="text-sm text-gray-400 mb-2">Update Order Status</div>
              <div className="flex gap-2">
                <button onClick={() => updateOrder(selected._id, { status: 'processing' })} className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 rounded text-sm">Processing</button>
                <button onClick={() => updateOrder(selected._id, { status: 'shipped' })} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm">Shipped</button>
                <button onClick={() => updateOrder(selected._id, { status: 'delivered' })} className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded text-sm">Delivered</button>
              </div>
            </div>
            <div className="flex-1 min-w-max">
              <div className="text-sm text-gray-400 mb-2">Update Payment</div>
              <button onClick={() => updateOrder(selected._id, { paymentStatus: 'paid' })} className="px-3 py-2 bg-green-700 hover:bg-green-600 rounded text-sm">Mark as Paid</button>
            </div>
            <button onClick={() => setSelected(null)} className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-900/50 text-sm">Close</button>
          </div>
        </div>
      )}
      {/* Message Detail Panel */}
      {selectedMessage && (
        <div className="mt-8 bg-[#07110a] p-6 rounded border-2 border-green-600 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-green-300">Message</h3>
              <div className="text-sm text-gray-400 mt-1">From: {selectedMessage.name} — {selectedMessage.email || selectedMessage.phone}</div>
            </div>
            <button onClick={() => setSelectedMessage(null)} className="text-2xl text-gray-400 hover:text-white">✕</button>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-400">Received</div>
            <div className="font-semibold text-white">{new Date(selectedMessage.createdAt).toLocaleString()}</div>
          </div>

          <div className="mb-6">
            <div className="text-sm text-gray-400">Message</div>
            <div className="mt-2 whitespace-pre-wrap text-white bg-green-900/10 p-3 rounded border border-green-800/30">{selectedMessage.message}</div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => markMessageRead(selectedMessage._id, !selectedMessage.read)} className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 rounded text-sm">{selectedMessage.read ? 'Mark Unread' : 'Mark Read'}</button>
            <button onClick={() => deleteMessage(selectedMessage._id)} className="px-3 py-2 bg-red-700 hover:bg-red-600 rounded text-sm">Delete</button>
            <button onClick={() => setSelectedMessage(null)} className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-900/50 text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
