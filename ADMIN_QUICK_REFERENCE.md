# Admin Dashboard Quick Reference Guide

## 🚀 Quick Start

### Login to Admin Dashboard
1. Home Page → "🔐 Admin Dashboard" button
2. Enter admin credentials
3. Dashboard loads with latest data

---

## 📊 Dashboard Tab (Original)

### What You See
- **Stats Cards**: Total orders, users, pending, paid
- **Recent Orders**: List of latest orders with status
- **Messages**: Customer inquiries and feedback
- **Users**: Registered customers list

### Actions Available
- **Search Orders**: Filter by order ID, customer name, or email
- **Update Order Status**: Click order → Change "processing/shipped/delivered"
- **Mark Payment**: Click "Mark as Paid" for pending payments
- **View Messages**: Click message to read full content
- **Manage Messages**: Mark as read/unread or delete
- **View Users**: See customer info and roles

---

## 📈 Analytics Tab

### Key Metrics Dashboard

**Top Left - Revenue:**
- Shows: ₹ Total Revenue
- Shows: Number of total orders
- Example: ₹1,25,000 from 50 orders

**Top Second - Order Value:**
- Shows: ₹ Average Order Value
- Shows: % Order completion rate
- Example: ₹2,500 per order, 95% delivered

**Top Third - Users:**
- Shows: Total registered users
- Shows: New users this month
- Example: 500 total, 45 new

**Top Right - Active Users:**
- Shows: Active in last 7 days
- Shows: User retention rate
- Example: 350 active, 70% retention

### Charts & Analysis

**Order Status Distribution:**
- Processing (blue bar)
- Shipped (purple bar)
- Delivered (green bar)
- Cancelled (red bar)

**Payment Status:**
- Paid (green - completed)
- Pending (yellow - awaiting payment)
- Failed (red - payment issue)

**Top 5 Products:**
| Product Name | Units Sold | Revenue |
|---|---|---|
| Indoor Plant | 45 | ₹22,500 |
| Care Kit | 32 | ₹15,000 |
| Planter | 28 | ₹8,400 |
| Flowering | 20 | ₹12,000 |
| Succulent | 15 | ₹7,500 |

**Customer Lifetime Value:**
- Average: ₹3,500 per customer
- Highest: ₹25,000 (VIP customer)
- Lowest: ₹500 (new customer)

### Date Range Filtering
- **Last 7 Days**: Current week data only
- **Last 30 Days**: Monthly view (default)
- **Last 90 Days**: Quarterly view
- **All Time**: Complete business history

### Export Reports
- Click "📥 Export Orders Report" → Downloads `orders-report-[date].csv`
- Click "📥 Export Users Report" → Downloads `users-report-[date].csv`
- Open in Excel for analysis and sharing

---

## 📦 Inventory Tab

### Stock Status Indicators

**Status Colors:**
- 🟢 **In Stock** (green badge) - More than threshold units
- 🟡 **Low Stock** (yellow badge) - Less than threshold units
- 🔴 **Out of Stock** (red badge) - Zero units available

### Inventory Summary Cards
- **Total Products**: How many products exist
- **In Stock**: Ready to sell items count
- **Low Stock**: Items below threshold
- **Out of Stock**: Items with 0 units

### Low Stock Alerts
**Alert Box Shows:**
- Total items with low stock
- Top 5 products below threshold
- Current units remaining for each
- Example: "⚠️ 3 products have stock below 5 units"

### Managing Stock

#### How to Update Stock:
1. Find product in list (or search by name)
2. Click "Edit Stock" button
3. Enter new stock quantity
4. Click "Save" to confirm
5. Page refreshes with updated stock

#### Adjusting Low Stock Threshold:
1. See "Low Stock Threshold" input box (default: 5)
2. Change number to any value you want
3. Alerts update automatically
4. Saved to current session

#### Example Workflow:
```
You receive 20 units of "Monstera Plant"
Current stock: 2 units
New stock: 2 + 20 = 22 units
Click Edit Stock → Enter 22 → Save
Status changes: 🔴 Low Stock → 🟢 In Stock
```

### Search & Filter
- **Search Box**: Type product name to filter
- **Real-time Filter**: Results update as you type
- **Refresh Button**: Reload stock data from server

---

## 🎯 Marketing Tab

### Three Marketing Tools Available

---

### 💰 Discount Codes

**Create New Discount:**

1. **Enter Code Name**
   - Example: `SUMMER20`, `NEWUSER10`, `HOLIDAY50`
   - Auto-converts to uppercase
   - Unique code (can't duplicate)

2. **Select Discount Type**
   - **Percentage (%)** - Example: 20% off = ₹100 item becomes ₹80
   - **Fixed Amount (₹)** - Example: ₹500 off = ₹1000 item becomes ₹500

3. **Set Discount Value**
   - If %: Enter 5 for 5%, 20 for 20%, etc.
   - If ₹: Enter 100 for ₹100 off, 500 for ₹500 off, etc.

4. **Set Maximum Uses**
   - Example: 100 = This code can be used 100 times total
   - After 100 uses, code becomes invalid

5. **Set Expiry Date** (Optional)
   - Click date picker, select end date
   - Code auto-disables after this date
   - Good for time-limited promotions

6. **Minimum Order Value** (Optional)
   - Example: ₹500 = Customer must spend ₹500 or more
   - Discount only applies to qualifying orders

7. **Create Discount Code**
   - Click big "Create Discount Code" button
   - Code is active immediately
   - Shows confirmation message

**Track Discount Usage:**

| Code | Discount | Usage | Expires | Status |
|---|---|---|---|---|
| SUMMER20 | 20% | 45/100 (45%) | Aug 31 | Active |
| WELCOME10 | ₹100 | 150/200 (75%) | Sep 15 | Active |
| EXPIRED50 | 50% | 50/50 (100%) | Jan 1 | Expired |

**Key Indicators:**
- 🟢 Active = Currently usable
- 🟡 80%+ Used = Almost exhausted
- 🔴 Expired = No longer valid
- Shows days remaining for active codes

**Delete Old Codes:**
- Click "Delete" button on any code
- Removes code permanently
- Customers can't use deleted codes

---

### 📧 Email Campaigns

**Create Campaign:**

1. **Campaign Name**
   - Example: "Summer Sale Promo", "New Products Announcement"
   - For your reference only

2. **Email Subject**
   - What customers see in inbox
   - Example: "🌿 Exclusive 20% Off Plants This Weekend!"
   - Should be catchy and relevant

3. **Target Audience** (Select One)
   - **All Users** - Send to every customer
   - **New Customers (30 days)** - Only customers who joined last month
   - **Inactive (30+ days)** - Customers who haven't bought in 30 days
   - **VIP (High Value)** - Top spenders, regular customers

4. **Email Template/Content**
   - Write your email message here
   - Can include:
     - HTML formatting
     - Links to products
     - Images
     - Discount code mentions
   - Example:
     ```
     Hi {{customer_name}},
     
     We have amazing new plants in stock!
     
     Use code NEWPLANTS for 15% off your first order.
     
     Shop Now →
     ```

5. **Send Campaign**
   - Click "Send Campaign" button
   - Email sent to selected audience
   - You get confirmation message

**Campaign History:**
- Shows all campaigns sent
- Shows date sent
- Shows recipient segment
- Can review past campaigns

---

### ⭐ Featured Products

**What are Featured Products?**
- Products highlighted on homepage
- Get more visibility
- Drive sales for popular items
- Limited slots (recommend 5-8)

**Manage Featured Products:**
1. See grid of currently featured products
2. Each card shows:
   - Product name
   - Product price
   - "Remove from Featured" button

3. **To Remove Product:**
   - Click "Remove from Featured"
   - Product disappears from featured section
   - Still searchable in shop

4. **To Add Product:**
   - Go to shop/inventory
   - Mark product as featured
   - Appears in featured section

**Best Practices:**
- Change featured products monthly
- Show seasonal/trending items
- Feature best-sellers
- Rotate new arrivals
- Feature on-sale items

---

## 🔄 Navigation Tips

### Quick Navigation
- **Top tabs** switch between sections
- **Active tab** is highlighted in green
- Each section keeps its own state
- Search/filters reset when switching tabs

### Loading States
- Data loads automatically when you open a section
- "Loading..." spinner appears while fetching
- Click "Refresh" button to reload manually
- Error messages show if something fails

---

## 📱 Mobile Friendly

All features work on:
- Desktop (full view)
- Tablet (optimized layout)
- Mobile (responsive design)

---

## ⚡ Performance Tips

1. **Analytics Section:**
   - Use date filtering to load less data
   - Export reports for offline analysis
   - Use browser search (Ctrl+F) to find metrics

2. **Inventory Section:**
   - Search for product names to find faster
   - Set threshold based on your needs
   - Update stock frequently

3. **Marketing Section:**
   - Create campaigns when convenient
   - Track discount usage regularly
   - Refresh featured products monthly

---

## 🆘 Troubleshooting

### Data Not Loading?
- **Solution**: Click "Refresh" button
- Check internet connection
- Verify you're logged in as admin
- Check browser console for errors

### Can't Update Stock?
- **Solution**: Verify product exists
- Check you have admin permissions
- Try entering number again
- Refresh page and retry

### Discount Code Not Creating?
- **Solution**: Fill all required fields (code, type, value, max uses)
- Check code is unique (not used before)
- Ensure numbers are valid (no letters in price)

### Email Campaign Not Sending?
- **Solution**: Verify email template is filled
- Check recipient segment selected
- Ensure email template has content
- Check for typos in email address fields

---

## 📊 Best Practices

1. **Daily:**
   - Check pending orders (Dashboard tab)
   - Review new messages (Dashboard tab)
   - Monitor low-stock alerts (Inventory tab)

2. **Weekly:**
   - Review sales analytics (Analytics tab)
   - Check top-selling products
   - Update inventory levels

3. **Monthly:**
   - Send targeted email campaigns (Marketing tab)
   - Review customer acquisition metrics
   - Analyze revenue trends
   - Rotate featured products

4. **Quarterly:**
   - Export full business reports
   - Analyze customer lifetime value trends
   - Plan promotional strategies
   - Review pricing and discounts

---

## 🎯 Use Cases

### Use Case 1: Summer Sale Campaign
1. Go to **Marketing** → **Discounts**
2. Create code: SUMMER30 (30% off)
3. Set max uses: 500
4. Set expiry: End of summer
5. Go to **Campaigns**
6. Send email to "All Users" with sale details
7. Watch sales spike! 📈

### Use Case 2: Re-engage Inactive Users
1. Go to **Marketing** → **Campaigns**
2. Select "Inactive (30+ days)" audience
3. Write special offer email
4. Create discount code just for them
5. Include code in email
6. Send and track results

### Use Case 3: Stock Running Low?
1. Go to **Inventory**
2. See "Low Stock" alert
3. Identify items to restock
4. Contact supplier
5. Update stock levels as items arrive
6. Alert automatically clears when stock is replenished

### Use Case 4: Feature Best Sellers
1. Go to **Analytics**
2. View "Top Selling Products"
3. Go to **Marketing** → **Featured**
4. Remove old featured products
5. Add top sellers to featured
6. Homepage now shows hot items

---

## 📞 Support Channels

- 📧 Email: support@yourplants.com
- 💬 Chat: In-app chat support
- 📞 Phone: Customer service hotline
- 📚 Docs: See full documentation

---

**Version:** 1.0  
**Last Updated:** Today  
**Status:** ✅ Active

Happy administrating! 🌿✨
