// Growth features: Deal of the Day, bestseller/rating stats, product Q&A, loyalty tiers.
const mongoose = require('mongoose');
const Plant = require('../models/Plant');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Question = require('../models/Question');

const DEAL_DISCOUNT = 0.2; // extra 20% off today's deal
const GIFT_WRAP_FEE = 49;

const TIERS = [
  { name: 'Seedling', min: 0, rate: 0.05 },
  { name: 'Sapling', min: 3000, rate: 0.07 },
  { name: 'Evergreen', min: 10000, rate: 0.1 },
];

const isId = (id) => mongoose.Types.ObjectId.isValid(String(id));

// ---------- Deal of the Day ----------
// Deterministic per IST calendar day, so every server instance agrees on the same deal.
const istDayKey = (now = Date.now()) => new Date(now + 5.5 * 3600000).toISOString().slice(0, 10);
const dealEndsAt = (now = Date.now()) => {
  const ist = new Date(now + 5.5 * 3600000);
  ist.setUTCHours(24, 0, 0, 0);
  return new Date(ist.getTime() - 5.5 * 3600000);
};
let dealCache = { key: null, deal: null };

async function getTodayDeal() {
  const key = istDayKey();
  if (dealCache.key === key) return dealCache.deal;
  const pool = await Plant.find({
    category: { $in: ['indoor', 'flowering', 'outdoor'] },
    salePrice: { $gte: 299, $lte: 2499 },
    imageUrl: { $nin: [null, ''] },
    name: { $not: /artificial|seed|booster|fertili/i },
    $or: [{ stockManaged: { $ne: true } }, { stock: { $gt: 0 } }],
  }).sort({ _id: 1 }).select('_id name salePrice oldPrice imageUrl category description stock stockManaged');
  if (!pool.length) {
    dealCache = { key, deal: null };
    return null;
  }
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const p = pool[h % pool.length];
  const deal = { productId: String(p._id), dealPrice: Math.round(p.salePrice * (1 - DEAL_DISCOUNT)), plant: p.toObject() };
  dealCache = { key, deal };
  return deal;
}

// ---------- Sales & rating stats (cached) ----------
let statsCache = { at: 0, data: null };
async function getStats() {
  if (statsCache.data && Date.now() - statsCache.at < 5 * 60000) return statsCache.data;
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const [sold, week, ratings] = await Promise.all([
    Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $unwind: '$items' }, { $group: { _id: { $toString: '$items.productId' }, n: { $sum: '$items.quantity' } } }]),
    Order.aggregate([{ $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: weekAgo } } }, { $unwind: '$items' }, { $group: { _id: { $toString: '$items.productId' }, n: { $sum: '$items.quantity' } } }]),
    Review.aggregate([{ $match: { productId: { $ne: null } } }, { $group: { _id: { $toString: '$productId' }, avg: { $avg: '$rating' }, n: { $sum: 1 } } }]),
  ]);
  const data = {};
  const get = (id) => (data[id] = data[id] || { sold: 0, week: 0, rating: null, reviews: 0 });
  for (const s of sold) if (s._id) get(s._id).sold = s.n;
  for (const s of week) if (s._id) get(s._id).week = s.n;
  for (const r of ratings) if (r._id) Object.assign(get(r._id), { rating: Math.round(r.avg * 10) / 10, reviews: r.n });
  // Top 12 sellers get a "Bestseller" badge
  Object.entries(data)
    .filter(([, v]) => v.sold > 0)
    .sort((a, b) => b[1].sold - a[1].sold)
    .slice(0, 12)
    .forEach(([id]) => (data[id].bestseller = true));
  statsCache = { at: Date.now(), data };
  return data;
}
const invalidateStats = () => { statsCache = { at: 0, data: null }; };

// ---------- Loyalty ----------
async function deliveredSpend(userId) {
  const r = await Order.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(String(userId)), status: 'delivered' } },
    { $group: { _id: null, s: { $sum: { $add: ['$total', { $ifNull: ['$walletUsed', 0] }] } } } },
  ]);
  return r[0]?.s || 0;
}
const tierFor = (spent) => [...TIERS].reverse().find((t) => spent >= t.min) || TIERS[0];

function registerGrowthRoutes(app, { requireAuth, requireAdmin, wrap }) {
  app.get('/api/deal', wrap(async (req, res) => {
    const deal = await getTodayDeal();
    if (!deal) return res.json({ success: true, deal: null });
    res.json({ success: true, deal: { ...deal, endsAt: dealEndsAt(), discountPercent: DEAL_DISCOUNT * 100 } });
  }));

  app.get('/api/stats/plants', wrap(async (req, res) => {
    res.set('Cache-Control', 'public, max-age=120');
    res.json({ success: true, stats: await getStats() });
  }));

  // Loyalty tier for the signed-in user
  app.get('/api/loyalty', requireAuth, wrap(async (req, res) => {
    const spent = await deliveredSpend(req.user._id);
    const tier = tierFor(spent);
    const next = TIERS.find((t) => t.min > spent) || null;
    res.json({ success: true, spent, tier: tier.name, rate: Math.round(tier.rate * 100), next: next ? { name: next.name, min: next.min, rate: Math.round(next.rate * 100), remaining: next.min - spent } : null, tiers: TIERS.map((t) => ({ ...t, rate: Math.round(t.rate * 100) })) });
  }));

  // ---------- Product Q&A ----------
  const shapeQ = (q) => ({ id: q._id, name: q.name, question: q.question, answer: q.answer, answeredAt: q.answeredAt, createdAt: q.createdAt });

  app.get('/api/questions/product/:id', wrap(async (req, res) => {
    if (!isId(req.params.id)) return res.json({ success: true, questions: [] });
    const qs = await Question.find({ plant: req.params.id, answer: { $ne: '' } }).sort({ answeredAt: -1 }).limit(30);
    res.json({ success: true, questions: qs.map(shapeQ) });
  }));

  app.post('/api/questions/product/:id', requireAuth, wrap(async (req, res) => {
    const text = String(req.body?.question || '').trim();
    if (!isId(req.params.id) || !(await Plant.exists({ _id: req.params.id }))) return res.status(404).json({ success: false, message: 'Product not found' });
    if (text.length < 8) return res.status(400).json({ success: false, message: 'Please write a complete question' });
    if (text.length > 500) return res.status(400).json({ success: false, message: 'Please keep it under 500 characters' });
    const recent = await Question.countDocuments({ user: req.user._id, createdAt: { $gte: new Date(Date.now() - 3600000) } });
    if (recent >= 5) return res.status(429).json({ success: false, message: "You've asked a lot of questions — please try again later" });
    const q = await Question.create({ plant: req.params.id, user: req.user._id, name: req.user.name.split(' ')[0], question: text });
    res.json({ success: true, question: shapeQ(q), message: "Thanks! Our plant team will answer soon — answered questions appear on this page." });
  }));

  app.get('/api/admin/questions', requireAdmin, wrap(async (req, res) => {
    const qs = await Question.find().sort({ answeredAt: 1, createdAt: -1 }).limit(300).populate('plant', 'name imageUrl category');
    res.json({ success: true, questions: qs.map((q) => ({ ...shapeQ(q), plant: q.plant ? { id: q.plant._id, name: q.plant.name, image: q.plant.imageUrl, category: q.plant.category } : null })) });
  }));
  app.post('/api/admin/questions/:id/answer', requireAdmin, wrap(async (req, res) => {
    const answer = String(req.body?.answer || '').trim().slice(0, 1500);
    if (!isId(req.params.id) || !answer) return res.status(400).json({ success: false, message: 'Answer is required' });
    const q = await Question.findByIdAndUpdate(req.params.id, { $set: { answer, answeredAt: new Date() } }, { new: true });
    if (!q) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, question: shapeQ(q) });
  }));
  app.delete('/api/admin/questions/:id', requireAdmin, wrap(async (req, res) => {
    if (isId(req.params.id)) await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  }));
}

module.exports = { registerGrowthRoutes, getTodayDeal, invalidateStats, deliveredSpend, tierFor, GIFT_WRAP_FEE };
