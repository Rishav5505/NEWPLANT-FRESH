# Admin Dashboard - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard                          │
│                     (React Component)                       │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
        ┌──────▼──────────┐         ┌────────▼──────────┐
        │  Navigation Tab │         │  Admin Main State │
        │   Switching     │         │  (Orders, Users)  │
        └──────┬──────────┘         └────────┬──────────┘
               │                              │
    ┌──────────┼──────────┬──────────┬────────┘
    │          │          │          │
    ▼          ▼          ▼          ▼
┌─────────┬────────┬──────────┬──────────────┐
│Dashboard│Analytics│Inventory│ Marketing   │
│  Tab    │  Tab   │   Tab    │    Tab      │
└────┬────┴───┬────┴──────┬───┴──────┬───────┘
     │        │           │          │
     ▼        ▼           ▼          ▼
  Orders   Revenue    Products   Discounts
  Users    Stats      Stock      Campaigns
  Messages  Trends    Alerts     Featured
```

---

## Component Hierarchy

```
AdminDashboard (Main Container)
├── State Management
│   ├── orders, users, messages arrays
│   ├── selected, selectedMessage
│   ├── activeSection, searchQuery
│   ├── loading, authError
│   └── adminToken
│
├── useEffect Hooks
│   ├── Fetch orders on mount/activeSection
│   ├── Fetch users on mount
│   ├── Fetch messages on mount
│   └── Store active section in DOM
│
├── Helper Functions
│   ├── fetchOrders()
│   ├── fetchUsers()
│   ├── fetchMessages()
│   ├── loadOrder()
│   ├── loadMessage()
│   ├── updateOrder()
│   ├── deleteMessage()
│   ├── markMessageRead()
│   ├── getStatusColor()
│   └── resolveUserForOrder()
│
└── Conditional Rendering
    ├── {activeSection === 'dashboard' && <Dashboard Content>}
    ├── {activeSection === 'analytics' && <AnalyticsDashboard />}
    ├── {activeSection === 'inventory' && <InventoryManagement />}
    ├── {activeSection === 'marketing' && <MarketingManagement />}
    ├── {selected && <Order Detail Modal>}
    └── {selectedMessage && <Message Detail Modal>}
```

---

## Data Flow Architecture

### Analytics Module
```
adminToken (auth)
    ↓
fetchAnalyticsData()
    ├── fetch /api/admin/orders
    │   └── orders array
    │       ├── calculateRevenueStats(orders)
    │       │   └── totalRevenue, avgOrderValue, etc.
    │       ├── getOrderStatusDistribution(orders)
    │       │   └── {processing, shipped, delivered, cancelled}
    │       ├── getPaymentStatusDistribution(orders)
    │       │   └── {paid, pending, failed}
    │       ├── getTopProducts(orders, 5)
    │       │   └── [{name, count, revenue}, ...]
    │       └── filterByDateRange(orders, dateRange)
    │           └── filtered orders by selected period
    │
    └── fetch /api/admin/users
        └── users array
            ├── calculateCustomerStats(users)
            │   └── totalUsers, activeUsers, etc.
            └── getCustomerLTV(orders, users)
                └── {avgLTV, maxLTV, minLTV}
```

### Inventory Module
```
adminToken (auth)
    ↓
fetchProducts()
    ├── fetch /api/products
    │   └── products array
    │       ├── filter by lowStockThreshold
    │       │   └── lowStockItems []
    │       └── filter by searchTerm
    │           └── filteredProducts []
    │
    └── handleStockUpdate(productId)
        ├── validate input
        └── PUT /api/admin/products/{id}
            └── stock updated
```

### Marketing Module
```
adminToken (auth)
    │
    ├─► Discount Management
    │   ├── getDiscounts() → fetch /api/admin/discounts
    │   ├── createDiscount() → POST /api/admin/discounts
    │   ├── updateDiscount() → PUT /api/admin/discounts/{id}
    │   ├── deleteDiscount() → DELETE /api/admin/discounts/{id}
    │   └── generateCode() → Create random code
    │
    ├─► Campaign Management
    │   ├── getCampaigns() → fetch /api/admin/campaigns
    │   └── sendCampaign() → POST /api/admin/campaigns/email
    │
    └─► Featured Products
        ├── getFeaturedProducts() → fetch /api/admin/featured-products
        └── setFeatured() → PUT /api/admin/featured-products/{id}
```

---

## State Management Strategy

### Local Component State (AdminDashboard)
```javascript
// Auth & Data
const [adminToken] = useState(localStorage.getItem('auth_token'));

// Main Dashboard Data
const [orders, setOrders] = useState([]);
const [users, setUsers] = useState([]);
const [messages, setMessages] = useState([]);

// UI State
const [activeSection, setActiveSection] = useState('dashboard');
const [searchQuery, setSearchQuery] = useState('');
const [selected, setSelected] = useState(null);
const [selectedMessage, setSelectedMessage] = useState(null);
const [loading, setLoading] = useState(false);
const [authError, setAuthError] = useState('');
```

### Derived State (Computed Values)
```javascript
const filteredOrders = orders.filter(o => 
  String(o._id).toLowerCase().includes(searchQuery.toLowerCase())
);
```

### Props Passed to New Components
```javascript
<AnalyticsDashboard adminToken={adminToken} />
<InventoryManagement adminToken={adminToken} />
<MarketingManagement adminToken={adminToken} />
```

### Sub-Component State (Individual Components)
Each new component manages its own internal state:
- Analytics: dateRange, orders, users, loading
- Inventory: products, lowStockItems, editingProduct
- Marketing: discounts, campaigns, newDiscount, newCampaign, activeTab

---

## API Contract Specification

### Headers Required
```javascript
{
  'Authorization': `Bearer ${adminToken}`,
  'Content-Type': 'application/json'  // For POST/PUT
}
```

### Request/Response Format

#### GET /api/admin/orders
**Response:**
```javascript
{
  success: true,
  orders: [
    {
      _id: "507f1f77bcf86cd799439011",
      userId: "507f1f77bcf86cd799439012",
      user: { name: "John", email: "john@example.com" },
      total: 2500,
      items: [{ name: "Plant", price: 500, quantity: 5 }],
      status: "processing",
      paymentStatus: "paid",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### GET /api/admin/users
**Response:**
```javascript
{
  success: true,
  users: [
    {
      _id: "507f1f77bcf86cd799439012",
      name: "John Doe",
      email: "john@example.com",
      phone: "+91-9876543210",
      role: "customer",
      lastLogin: "2024-01-15T10:30:00Z",
      createdAt: "2024-01-01T10:30:00Z"
    }
  ]
}
```

#### PUT /api/admin/products/{id}
**Request:**
```javascript
{
  stock: 25
}
```
**Response:**
```javascript
{
  success: true,
  product: {
    _id: "507f1f77bcf86cd799439013",
    name: "Monstera Plant",
    price: 500,
    stock: 25
  }
}
```

#### POST /api/admin/discounts
**Request:**
```javascript
{
  code: "SUMMER20",
  type: "percentage",
  value: 20,
  maxUses: 100,
  expiryDate: "2024-08-31",
  minOrderValue: 500,
  applicableProducts: [],
  isActive: true,
  createdAt: "2024-01-15T10:30:00Z"
}
```
**Response:**
```javascript
{
  success: true,
  discount: {
    _id: "507f1f77bcf86cd799439014",
    code: "SUMMER20",
    type: "percentage",
    value: 20,
    maxUses: 100,
    usedCount: 0,
    expiryDate: "2024-08-31",
    minOrderValue: 500,
    isActive: true,
    createdAt: "2024-01-15T10:30:00Z"
  }
}
```

---

## Error Handling Strategy

### Try-Catch Blocks
```javascript
try {
  const response = await fetch(endpoint, options);
  if (!response.ok) throw new Error('API Error');
  const data = await response.json();
  if (!data.success) setAuthError(data.message);
  // Process data
} catch (error) {
  console.error('Error:', error);
  setAuthError(error.message || 'Failed to fetch data');
  alert('Error message for user');
}
```

### Error States
- **Network Error**: Connection failed, show retry message
- **Auth Error**: Invalid token, redirect to login
- **Server Error**: 500+, show generic error message
- **Not Found**: 404, resource doesn't exist
- **Validation Error**: 400, user input invalid

### User Feedback
- Toast notifications for success/error
- Error messages displayed in alert boxes
- Loading spinners during fetches
- Empty states when no data

---

## Performance Optimizations

### Data Fetching
```javascript
// Parallel requests instead of sequential
const [ordersRes, usersRes] = await Promise.all([
  fetch('/api/admin/orders', ...),
  fetch('/api/admin/users', ...)
]);
```

### Date Range Filtering
```javascript
// Reduce data size by filtering on client
const filteredOrders = filterByDateRange(orders, dateRange);
// Only calculate stats for filtered data
calculateRevenueStats(filteredOrders);
```

### Search Optimization
```javascript
// Simple filter loop for small datasets
const filtered = items.filter(item => 
  item.name.toLowerCase().includes(query.toLowerCase())
);
// For large datasets, implement debounce:
const debouncedSearch = useCallback(
  debounce((query) => setSearchQuery(query), 300),
  []
);
```

### CSV Export
```javascript
// Client-side generation to avoid server load
const blob = new Blob([csv], { type: 'text/csv' });
// Direct download trigger
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = `report-${Date.now()}.csv`;
```

---

## Security Considerations

### Authentication
- ✅ Bearer token stored in localStorage
- ✅ Token required in Authorization header
- ✅ Admin-only endpoints protected

### Data Validation
- ✅ Confirm before deleting items
- ✅ Validate form inputs client-side
- ✅ Server-side validation required
- ✅ XSS protection via React JSX

### CORS & HTTPS
- ✅ API endpoints use HTTPS in production
- ✅ CORS headers configured on backend
- ✅ Credentials included in fetch options

### Best Practices
- ❌ Don't store sensitive data in localStorage
- ❌ Don't expose API keys in frontend code
- ❌ Don't trust client-side validation alone
- ✅ Always validate on server
- ✅ Implement rate limiting on API
- ✅ Log admin actions for audit trail

---

## File Dependencies

### AdminDashboard.jsx
```
Imports:
├── React (core)
├── AnalyticsDashboard.jsx
├── InventoryManagement.jsx
└── MarketingManagement.jsx
```

### AnalyticsDashboard.jsx
```
Imports:
├── React (core)
└── adminAnalytics.js
    └── Utility functions
```

### InventoryManagement.jsx
```
Imports:
├── React (core)
└── No external dependencies
```

### MarketingManagement.jsx
```
Imports:
├── React (core)
└── adminMarketingManager.js
    └── API handlers
```

### Utils
```
adminAnalytics.js
├── calculateRevenueStats()
├── calculateCustomerStats()
├── getOrderStatusDistribution()
├── getPaymentStatusDistribution()
├── getTopProducts()
├── getCustomerLTV()
├── exportToCSV()
├── checkInventoryAlerts()
└── createNotification()

adminMarketingManager.js
├── discountManager
├── emailCampaignManager
└── featuredProductsManager
```

---

## Styling Approach

### Tailwind CSS Utility Classes
```
Layout: flex, grid, gap, px, py, mb, mt
Colors: bg-slate-800, text-green-400, border-blue-600
Effects: backdrop-blur, shadow-lg, opacity
Responsive: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
Animations: animate-spin, transition-all
```

### Color Scheme
```
Primary: Green (#10b981) - Success, active
Secondary: Blue (#3b82f6) - Info, secondary actions
Warning: Yellow (#eab308) - Alerts, low stock
Error: Red (#ef4444) - Errors, deleted items
Dark Background: Slate-800/900 - Modern look
```

---

## Testing Strategy

### Unit Tests Needed
```
adminAnalytics.js:
- calculateRevenueStats() with sample orders
- calculateCustomerStats() with sample users
- getTopProducts() sorts correctly
- exportToCSV() generates valid CSV
- filterByDateRange() filters correctly

adminMarketingManager.js:
- discountManager.generateCode() creates unique codes
- API calls construct correct payloads
- Error handling returns appropriate errors
```

### Integration Tests
```
AnalyticsDashboard:
- Fetches and displays orders correctly
- Date range filtering works
- Export button generates CSV
- Loading states show/hide

InventoryManagement:
- Stock levels display correctly
- Low stock alerts trigger
- Inline edit saves to server
- Search filters products

MarketingManagement:
- Discount form validates inputs
- Campaign form sends email
- Featured products CRUD works
```

### E2E Tests
```
Admin workflow:
1. Login as admin
2. Navigate all 4 tabs
3. Create discount code
4. Update inventory stock
5. Send email campaign
6. Export reports
7. Verify data consistency
```

---

## Deployment Checklist

- [ ] All API endpoints implemented on backend
- [ ] Database schemas created for Discounts, Campaigns
- [ ] Authentication middleware working
- [ ] CORS headers configured
- [ ] Environment variables set (.env file)
- [ ] All components tested individually
- [ ] Integration testing completed
- [ ] Error handling verified
- [ ] Performance optimized
- [ ] Security review passed
- [ ] Documentation complete
- [ ] Admin training completed

---

## Maintenance & Monitoring

### Key Metrics to Monitor
- API response times
- Error rates per endpoint
- Feature usage statistics
- Database query performance

### Regular Tasks
- Daily: Monitor errors in logs
- Weekly: Review admin activity logs
- Monthly: Check API performance metrics
- Quarterly: Update security policies

### Backup Strategy
- Daily database backups
- Monthly full backups
- Test restore procedures quarterly

---

**Architecture Version:** 1.0  
**Last Updated:** Today  
**Maintainer:** Development Team
