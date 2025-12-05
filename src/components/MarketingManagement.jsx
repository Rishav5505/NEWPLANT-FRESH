import React, { useState, useEffect } from 'react';
import { discountManager, emailCampaignManager, featuredProductsManager } from '../utils/adminMarketingManager';

/**
 * Marketing & Promotions Management Component
 * Create discount codes, manage campaigns, featured products
 */

const MarketingManagement = ({ adminToken }) => {
  const [activeTab, setActiveTab] = useState('discounts'); // 'discounts', 'campaigns', 'featured'
  const [discounts, setDiscounts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Discount form state
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    type: 'percentage', // 'percentage' or 'fixed'
    value: '',
    maxUses: '',
    expiryDate: '',
    minOrderValue: '',
  });

  // Campaign form state
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    template: '',
    recipientSegment: 'all',
  });

  // Fetch discounts
  const fetchDiscounts = async () => {
    try {
      const data = await discountManager.getDiscounts(adminToken);
      setDiscounts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    }
  };

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      const data = await emailCampaignManager.getCampaigns(adminToken);
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  // Fetch featured products
  const fetchFeaturedProducts = async () => {
    try {
      const data = await featuredProductsManager.getFeaturedProducts(adminToken);
      setFeaturedProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  useEffect(() => {
    if (adminToken) {
      if (activeTab === 'discounts') fetchDiscounts();
      else if (activeTab === 'campaigns') fetchCampaigns();
      else if (activeTab === 'featured') fetchFeaturedProducts();
    }
  }, [activeTab, adminToken]);

  // Create discount
  const handleCreateDiscount = async () => {
    if (!newDiscount.code || !newDiscount.value || !newDiscount.maxUses) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await discountManager.createDiscount(newDiscount, adminToken);
      alert('Discount code created successfully!');
      setNewDiscount({
        code: '',
        type: 'percentage',
        value: '',
        maxUses: '',
        expiryDate: '',
        minOrderValue: '',
      });
      fetchDiscounts();
    } catch (error) {
      console.error('Error creating discount:', error);
      alert('Failed to create discount code');
    } finally {
      setLoading(false);
    }
  };

  // Delete discount
  const handleDeleteDiscount = async (discountId) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) return;

    try {
      await discountManager.deleteDiscount(discountId, adminToken);
      alert('Discount deleted successfully!');
      fetchDiscounts();
    } catch (error) {
      console.error('Error deleting discount:', error);
      alert('Failed to delete discount');
    }
  };

  // Send campaign
  const handleSendCampaign = async () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.template) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await emailCampaignManager.sendCampaign(newCampaign, adminToken);
      alert('Campaign sent successfully!');
      setNewCampaign({
        name: '',
        subject: '',
        template: '',
        recipientSegment: 'all',
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2 text-green-300">🎯 Marketing & Promotions</h2>
        <p className="text-green-100">Manage discounts, campaigns, and featured products</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'discounts', label: '💰 Discount Codes', icon: '💰' },
          { id: 'campaigns', label: '📧 Email Campaigns', icon: '📧' },
          { id: 'featured', label: '⭐ Featured Products', icon: '⭐' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition ${
              activeTab === tab.id
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Discounts Tab */}
      {activeTab === 'discounts' && (
        <div className="space-y-6">
          {/* Create Discount Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Create New Discount Code</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Discount Code (e.g., SUMMER20)"
                value={newDiscount.code}
                onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
              />
              <select
                value={newDiscount.type}
                onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
              <input
                type="number"
                placeholder={`${newDiscount.type === 'percentage' ? 'Discount %' : 'Discount Amount'}`}
                value={newDiscount.value}
                onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
              />
              <input
                type="number"
                placeholder="Max Uses"
                value={newDiscount.maxUses}
                onChange={(e) => setNewDiscount({ ...newDiscount, maxUses: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
              />
              <input
                type="date"
                value={newDiscount.expiryDate}
                onChange={(e) => setNewDiscount({ ...newDiscount, expiryDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
              />
              <input
                type="number"
                placeholder="Min Order Value (₹)"
                value={newDiscount.minOrderValue}
                onChange={(e) => setNewDiscount({ ...newDiscount, minOrderValue: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
              />
            </div>
            <button
              onClick={handleCreateDiscount}
              disabled={loading}
              className="mt-4 w-full bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-medium transition"
            >
              {loading ? 'Creating...' : 'Create Discount Code'}
            </button>
          </div>

          {/* Discounts List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Discount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Usage</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Expires</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {discounts.map(discount => {
                  const stats = discountManager.getUsageStats(discount);
                  return (
                    <tr key={discount._id}>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{discount.code}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {discount.usedCount}/{discount.maxUses} ({stats.usagePercentage.toFixed(0)}%)
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {discount.expiryDate ? new Date(discount.expiryDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          stats.isExpired ? 'bg-red-100 text-red-700' :
                          discount.isActive ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {stats.isExpired ? 'Expired' : discount.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDeleteDiscount(discount._id)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Create Campaign Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Create Email Campaign</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Campaign Name"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
              />
              <input
                type="text"
                placeholder="Email Subject Line"
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
              />
              <select
                value={newCampaign.recipientSegment}
                onChange={(e) => setNewCampaign({ ...newCampaign, recipientSegment: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
              >
                <option value="all">All Users</option>
                <option value="new">New Customers (Last 30 days)</option>
                <option value="inactive">Inactive (30+ days)</option>
                <option value="vip">VIP Customers (High Value)</option>
              </select>
              <textarea
                placeholder="Email Template / Message Content"
                value={newCampaign.template}
                onChange={(e) => setNewCampaign({ ...newCampaign, template: e.target.value })}
                rows="8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
              />
            </div>
            <button
              onClick={handleSendCampaign}
              disabled={loading}
              className="mt-4 w-full bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-medium transition"
            >
              {loading ? 'Sending...' : 'Send Campaign'}
            </button>
          </div>

          {/* Campaigns History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4">Campaign History</h3>
            {campaigns.length === 0 ? (
              <p className="text-gray-600">No campaigns sent yet</p>
            ) : (
              <div className="space-y-3">
                {campaigns.map(campaign => (
                  <div key={campaign._id} className="border border-gray-200 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900">{campaign.name}</p>
                        <p className="text-sm text-gray-600">{campaign.subject}</p>
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Featured Products Tab */}
      {activeTab === 'featured' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Featured Products</h3>
          <p className="text-gray-600 mb-4">Manage which products are displayed as featured</p>
          {featuredProducts.length === 0 ? (
            <p className="text-gray-600">No featured products yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredProducts.map(product => (
                <div key={product._id} className="border border-gray-200 p-4 rounded-lg">
                  <p className="font-bold text-gray-900 mb-2">{product.name}</p>
                  <p className="text-sm text-gray-600 mb-3">₹{product.price}</p>
                  <button
                    onClick={() => featuredProductsManager.setFeatured(product._id, false, adminToken)}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-medium"
                  >
                    Remove from Featured
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketingManagement;
