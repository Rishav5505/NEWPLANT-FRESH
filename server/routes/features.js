// New JeevaLeaf features: wishlist sync, My Garden, product reviews, coupons,
// wallet, newsletter, order cancellation — plus trusted server-side pricing.
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');
const Plant = require('../models/Plant');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const GardenPlant = require('../models/GardenPlant');
const Subscriber = require('../models/Subscriber');
const StockAlert = require('../models/StockAlert');
const crypto = require('crypto');
const { registerGrowthRoutes, getTodayDeal, deliveredSpend, tierFor, GIFT_WRAP_FEE } = require('./growth');

const REFERRAL_REWARD = 100;      // friend's discount and referrer's credit, in ₹
const REFERRAL_MIN_ORDER = 499;

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 79;
const TAX_RATE = 0.05;

const isId = (id) => mongoose.Types.ObjectId.isValid(String(id));
const round = (n) => Math.round(Number(n) || 0);

// Default watering interval guessed from the plant name.
function guessWaterDays(name = '') {
  if (/cactus|succulent|aloe|haworthia|snake|sansevieria|zz|jade|adenium/i.test(name)) return 14;
  if (/fern|peace lily|calathea|bonsai/i.test(name)) return 3;
  if (/jasmin|mogra|hibiscus|rose|flower|marigold|petunia/i.test(name)) return 2;
  return 7;
}

function makeRequireAuth(JWT_SECRET) {
  return async function requireAuth(req, res, next) {
    try {
      const auth = req.headers.authorization || '';
      const token = auth.split(' ')[1];
      if (!token) return res.status(401).json({ success: false, message: 'Please sign in to continue' });
      const data = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(data.id);
      if (!user) return res.status(401).json({ success: false, message: 'Invalid session' });
      req.user = user;
      next();
    } catch {
      return res.status(401).json({ success: false, message: 'Session expired — please sign in again' });
    }
  };
}

// Validate a coupon for a user and subtotal. Returns { coupon, discount } or throws.
async function evaluateCoupon(code, subtotal, user) {
  const normalized = String(code || '').trim().toUpperCase();
  const fail = (m) => { const e = new Error(m); e.status = 400; throw e; };
  const coupon = await Coupon.findOne({ code: normalized });
  if (!coupon) {
    // Friend referral codes work like a one-time coupon for a new customer.
    const referrer = normalized ? await User.findOne({ referralCode: normalized }) : null;
    if (referrer) {
      if (!user) fail('Sign in to use a referral code');
      if (String(referrer._id) === String(user._id)) fail("You can't use your own referral code");
      const prior = await Order.countDocuments({ user: user._id, status: { $ne: 'cancelled' } });
      if (prior > 0) fail('Referral codes are for your first order only');
      if (subtotal < REFERRAL_MIN_ORDER) fail(`Referral codes apply on orders above ₹${REFERRAL_MIN_ORDER}`);
      return { coupon: { code: normalized, isReferral: true, referrer: referrer._id, description: `₹${REFERRAL_REWARD} off from ${referrer.name.split(' ')[0]}` }, discount: Math.min(REFERRAL_REWARD, subtotal) };
    }
  }
  if (!coupon || !coupon.isActive) fail('This coupon code is not valid');
  if (coupon.expiryDate && coupon.expiryDate < new Date()) fail('This coupon has expired');
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) fail('This coupon has reached its usage limit');
  if (subtotal < (coupon.minOrderValue || 0)) fail(`Add items worth ₹${coupon.minOrderValue - subtotal} more to use this coupon`);
  if (coupon.firstOrderOnly && user) {
    const prior = await Order.countDocuments({ user: user._id, status: { $ne: 'cancelled' } });
    if (prior > 0) fail('This coupon is only valid on your first order');
  }
  let discount = coupon.type === 'fixed' ? coupon.value : (subtotal * coupon.value) / 100;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(round(discount), subtotal);
  return { coupon, discount };
}

// Price an order from the catalogue — never trust prices sent by the browser.
async function priceOrder({ user, items, couponCode, useWallet, giftWrap }) {
  const fail = (m) => { const e = new Error(m); e.status = 400; throw e; };
  if (!Array.isArray(items) || items.length === 0) fail('Your basket is empty');
  if (items.length > 50) fail('Too many items in one order');

  const ids = items.map((it) => it.productId ?? it.id).filter(isId);
  const plants = await Plant.find({ _id: { $in: ids } });
  const byId = new Map(plants.map((p) => [String(p._id), p]));
  const deal = await getTodayDeal();

  const lines = items.map((it) => {
    const id = String(it.productId ?? it.id);
    const plant = byId.get(id);
    if (!plant) fail(`“${it.name || 'An item'}” is no longer available — please remove it from your basket`);
    const quantity = Math.max(1, Math.min(20, parseInt(it.quantity, 10) || 1));
    if (plant.stockManaged && plant.stock < quantity) fail(`Only ${plant.stock} of “${it.name || plant.name}” left in stock`);
    const isDeal = deal && deal.productId === id;
    return { productId: id, name: it.name || plant.name, price: isDeal ? deal.dealPrice : plant.salePrice, quantity, image: plant.imageUrl || '', currency: 'INR', deal: isDeal };
  });

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  let discount = 0;
  let coupon = null;
  if (couponCode) ({ coupon, discount } = await evaluateCoupon(couponCode, subtotal, user));
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = round((subtotal - discount) * TAX_RATE);
  const giftWrapFee = giftWrap ? GIFT_WRAP_FEE : 0;
  const gross = subtotal - discount + tax + shipping + giftWrapFee;
  const walletUsed = useWallet && user ? Math.min(round(user.walletBalance), gross) : 0;
  return { lines: lines.map(({ deal: _d, ...l }) => l), subtotal, discount, coupon, shipping, tax, giftWrapFee, walletUsed, total: gross - walletUsed };
}

// Credit 5% cashback once an order is delivered.
async function creditCashback(order) {
  if (order.cashbackCredited) return;
  // Loyalty tier is based on spend from previously delivered orders.
  const tier = tierFor(await deliveredSpend(order.user));
  const amount = round((order.total + (order.walletUsed || 0)) * tier.rate);
  if (amount <= 0) return;
  await User.updateOne(
    { _id: order.user },
    { $inc: { walletBalance: amount }, $push: { walletTransactions: { amount, note: `${Math.round(tier.rate * 100)}% ${tier.name} cashback · order #${String(order._id).slice(-8).toUpperCase()}`, order: order._id } } }
  );
  order.cashbackCredited = true;
}

// Reward the friend who referred this customer, once, when the first order is delivered.
async function creditReferral(order) {
  if (!order.referrer || order.referralRewarded) return;
  await User.updateOne(
    { _id: order.referrer },
    { $inc: { walletBalance: REFERRAL_REWARD }, $push: { walletTransactions: { amount: REFERRAL_REWARD, note: 'Referral reward · a friend received their first order', order: order._id } } }
  );
  order.referralRewarded = true;
}

const escapeHtml = (t) => String(t || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const escapeRegex = (t) => String(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const mailShell = (title, body) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f1e8;padding:24px">
    <div style="background:#16301f;color:#f4f1e8;padding:24px;border-radius:16px 16px 0 0">
      <h1 style="margin:0;font-family:Georgia,serif;font-weight:normal">Jeeva<em style="color:#e07a52">leaf</em></h1>
    </div>
    <div style="background:#fbf9f3;padding:28px;border-radius:0 0 16px 16px;color:#1b1f1a">
      <h2 style="font-family:Georgia,serif;font-weight:normal;margin-top:0">${title}</h2>
      ${body}
    </div>
  </div>`;

const mailButton = (href, label) => `<p><a href="${href}" style="display:inline-block;background:#16301f;color:#f4f1e8;padding:12px 22px;border-radius:999px;text-decoration:none">${label}</a></p>`;

// Email everyone waiting for a product that is back in stock.
async function notifyBackInStock(plant, getTransporter, from, siteUrl) {
  const alerts = await StockAlert.find({ plant: plant._id });
  if (!alerts.length) return 0;
  const transporter = getTransporter();
  if (!transporter) return 0; // keep the requests until email is configured
  let sent = 0;
  for (const a of alerts) {
    try {
      await transporter.sendMail({
        from, to: a.email, subject: `🌿 ${plant.name} is back in stock`,
        html: mailShell("It's back!", `<p>Good news — <b>${escapeHtml(plant.name)}</b> is back in the greenhouse at ₹${plant.salePrice}.</p>${mailButton(`${siteUrl}/product/${plant._id}`, 'Shop now')}`),
      });
      sent++;
      await StockAlert.deleteOne({ _id: a._id });
    } catch (e) { console.error('Back-in-stock email failed:', e.message); }
  }
  return sent;
}

// Morning watering reminders for My Garden (checks hourly, sends once a day around 8 am IST).
function startReminderJob(getTransporter, from, siteUrl) {
  const DAY = 86400000;
  const run = async () => {
    const transporter = getTransporter();
    if (!transporter || mongoose.connection.readyState !== 1) return;
    const istHour = new Date(Date.now() + 5.5 * 3600000).getUTCHours();
    if (istHour !== 8) return;
    const since = new Date(Date.now() - 20 * 3600000);
    const users = await User.find({ reminderEmails: { $ne: false }, $or: [{ lastReminderAt: null }, { lastReminderAt: { $lt: since } }] }).select('name email');
    for (const u of users) {
      const plants = await GardenPlant.find({ user: u._id });
      const thirsty = plants.filter((p) => new Date(p.lastWatered || p.createdAt).getTime() + p.waterEveryDays * DAY <= Date.now());
      if (!thirsty.length) continue;
      try {
        await transporter.sendMail({
          from, to: u.email, subject: `💧 ${thirsty.length} plant${thirsty.length > 1 ? 's are' : ' is'} thirsty today`,
          html: mailShell(`Good morning, ${escapeHtml(u.name.split(' ')[0])}`, `<p>These plants in your garden are due for water:</p><ul>${thirsty.map((p) => `<li>${escapeHtml(p.nickname || p.name)}${p.room ? ` · ${escapeHtml(p.room)}` : ''}</li>`).join('')}</ul>${mailButton(`${siteUrl}/garden`, 'Open My Garden')}<p style="color:#5f645b;font-size:12px">You can turn these reminders off on the My Garden page.</p>`),
        });
        await User.updateOne({ _id: u._id }, { $set: { lastReminderAt: new Date() } });
      } catch (e) { console.error('Reminder email failed:', e.message); }
    }
  };
  setInterval(() => run().catch((e) => console.error('Reminder job error:', e.message)), 3600000);
}

// Return wallet credits and stock when an order is cancelled.
async function releaseOrder(order) {
  if (order.walletUsed > 0) {
    await User.updateOne(
      { _id: order.user },
      { $inc: { walletBalance: order.walletUsed }, $push: { walletTransactions: { amount: order.walletUsed, note: `Refund · cancelled order #${String(order._id).slice(-8).toUpperCase()}`, order: order._id } } }
    );
  }
  for (const it of order.items || []) {
    if (isId(it.productId)) await Plant.updateOne({ _id: it.productId, stockManaged: true }, { $inc: { stock: it.quantity } });
  }
  if (order.couponCode) await Coupon.updateOne({ code: order.couponCode, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
}

// After delivery, add the ordered plants to the customer's garden automatically.
async function addOrderToGarden(order) {
  for (const it of order.items || []) {
    const exists = await GardenPlant.findOne({ user: order.user, productId: String(it.productId) });
    if (!exists) {
      await GardenPlant.create({ user: order.user, name: it.name, image: it.image || '', productId: String(it.productId), waterEveryDays: guessWaterDays(it.name) });
    }
  }
}

async function seedCoupons() {
  const count = await Coupon.estimatedDocumentCount();
  if (count > 0) return;
  await Coupon.create([
    { code: 'WELCOME10', description: '10% off your first order', type: 'percentage', value: 10, maxDiscount: 300, firstOrderOnly: true },
    { code: 'GREEN150', description: '₹150 off orders above ₹1,499', type: 'fixed', value: 150, minOrderValue: 1499 },
  ]);
  console.log('🌱 Seeded starter coupons WELCOME10 and GREEN150');
}

function registerFeatureRoutes(app, { JWT_SECRET, requireAdmin, getTransporter = () => null, mailFrom = '', siteUrl = '' }) {
  const requireAuth = makeRequireAuth(JWT_SECRET);
  const wrap = (fn) => async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  seedCoupons().catch((e) => console.error('Coupon seed failed:', e.message));
  startReminderJob(getTransporter, mailFrom, siteUrl);
  registerGrowthRoutes(app, { requireAuth, requireAdmin, wrap });

  // ---------- Referral program ----------
  app.get('/api/referral', requireAuth, wrap(async (req, res) => {
    const u = req.user;
    if (!u.referralCode) {
      const base = (u.name || 'LEAF').replace(/[^a-z]/gi, '').slice(0, 5).toUpperCase() || 'LEAF';
      for (let i = 0; i < 8 && !u.referralCode; i++) {
        const code = `${base}${crypto.randomInt(100, 1000)}`;
        if (!(await User.exists({ referralCode: code })) && !(await Coupon.exists({ code }))) u.referralCode = code;
      }
      await u.save();
    }
    const [joined, rewarded] = await Promise.all([
      Order.distinct('user', { referrer: u._id }),
      Order.countDocuments({ referrer: u._id, referralRewarded: true }),
    ]);
    res.json({ success: true, code: u.referralCode, reward: REFERRAL_REWARD, minOrder: REFERRAL_MIN_ORDER, friends: joined.length, earned: rewarded * REFERRAL_REWARD });
  }));

  // ---------- Back-in-stock alerts ----------
  app.post('/api/stock-alerts', wrap(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const plantId = String(req.body?.plantId || '');
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 200) return res.status(400).json({ success: false, message: 'Please enter a valid email' });
    if (!isId(plantId) || !(await Plant.exists({ _id: plantId }))) return res.status(404).json({ success: false, message: 'Product not found' });
    await StockAlert.updateOne({ email, plant: plantId }, { $setOnInsert: { email, plant: plantId } }, { upsert: true });
    res.json({ success: true, message: "We'll email you the moment it's back 🌱" });
  }));

  // ---------- Public order tracking (order number + email) ----------
  app.get('/api/track', wrap(async (req, res) => {
    const raw = String(req.query.order || '').trim().replace(/^#/, '');
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!raw || !email) return res.status(400).json({ success: false, message: 'Enter your order number and email' });
    let order = null;
    if (isId(raw)) order = await Order.findById(raw);
    else if (/^[0-9a-f]{8}$/i.test(raw)) {
      // Short order numbers are the last 8 hex characters of the id.
      const candidates = await Order.find({ deliveryEmail: new RegExp(`^${escapeRegex(email)}$`, 'i') }).sort({ createdAt: -1 }).limit(200);
      order = candidates.find((o) => String(o._id).slice(-8).toLowerCase() === raw.toLowerCase()) || null;
    }
    if (!order || String(order.deliveryEmail || '').toLowerCase() !== email) return res.status(404).json({ success: false, message: "We couldn't find an order with those details" });
    res.json({
      success: true,
      order: {
        number: String(order._id).slice(-8).toUpperCase(), status: order.status, paymentStatus: order.paymentStatus,
        createdAt: order.createdAt, statusHistory: order.statusHistory, total: order.total,
        items: (order.items || []).map((i) => ({ name: i.name, quantity: i.quantity, image: i.image })),
        city: order.deliveryLocation,
      },
    });
  }));

  // ---------- Wishlist ----------
  const cleanWish = (w) => ({ id: String(w.id), name: String(w.name || '').slice(0, 200), price: Number(w.price) || 0, image: String(w.image || ''), category: String(w.category || '') });

  app.get('/api/wishlist', requireAuth, wrap(async (req, res) => res.json({ success: true, items: req.user.wishlist })));

  app.post('/api/wishlist', requireAuth, wrap(async (req, res) => {
    if (!req.body?.id) return res.status(400).json({ success: false, message: 'Missing product' });
    const item = cleanWish(req.body);
    if (!req.user.wishlist.some((w) => w.id === item.id)) {
      req.user.wishlist.push(item);
      if (req.user.wishlist.length > 200) req.user.wishlist.shift();
      await req.user.save();
    }
    res.json({ success: true, items: req.user.wishlist });
  }));

  app.delete('/api/wishlist/:id', requireAuth, wrap(async (req, res) => {
    req.user.wishlist = req.user.wishlist.filter((w) => w.id !== req.params.id);
    await req.user.save();
    res.json({ success: true, items: req.user.wishlist });
  }));

  // Merge a guest wishlist into the account (called on sign-in).
  app.post('/api/wishlist/merge', requireAuth, wrap(async (req, res) => {
    const incoming = Array.isArray(req.body?.items) ? req.body.items.slice(0, 200) : [];
    const ids = new Set(req.user.wishlist.map((w) => w.id));
    for (const w of incoming) if (w && w.id && !ids.has(String(w.id))) { req.user.wishlist.push(cleanWish(w)); ids.add(String(w.id)); }
    await req.user.save();
    res.json({ success: true, items: req.user.wishlist });
  }));

  // ---------- My Garden ----------
  const pickGarden = (b) => {
    const out = {};
    for (const k of ['name', 'nickname', 'room', 'image', 'productId']) if (b[k] !== undefined) out[k] = b[k] == null ? '' : String(b[k]);
    if (b.waterEveryDays !== undefined) out.waterEveryDays = Math.max(1, Math.min(60, parseInt(b.waterEveryDays, 10) || 7));
    return out;
  };

  app.get('/api/garden', requireAuth, wrap(async (req, res) => {
    const plants = await GardenPlant.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, plants });
  }));

  app.post('/api/garden', requireAuth, wrap(async (req, res) => {
    const data = pickGarden(req.body || {});
    if (!data.name) return res.status(400).json({ success: false, message: 'Plant name is required' });
    if ((await GardenPlant.countDocuments({ user: req.user._id })) >= 200) return res.status(400).json({ success: false, message: 'Your garden is full (200 plants)' });
    if (data.productId) {
      const dup = await GardenPlant.findOne({ user: req.user._id, productId: data.productId });
      if (dup) return res.status(400).json({ success: false, message: 'This plant is already in your garden' });
    }
    if (!data.waterEveryDays) data.waterEveryDays = guessWaterDays(data.name);
    const plant = await GardenPlant.create({ ...data, user: req.user._id });
    res.json({ success: true, plant });
  }));

  app.put('/api/garden/:id', requireAuth, wrap(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ success: false, message: 'Plant not found' });
    const plant = await GardenPlant.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { $set: pickGarden(req.body || {}) }, { new: true });
    if (!plant) return res.status(404).json({ success: false, message: 'Plant not found' });
    res.json({ success: true, plant });
  }));

  app.post('/api/garden/:id/water', requireAuth, wrap(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ success: false, message: 'Plant not found' });
    const now = new Date();
    const plant = await GardenPlant.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { lastWatered: now }, $push: { history: { $each: [now], $slice: -100 } } },
      { new: true }
    );
    if (!plant) return res.status(404).json({ success: false, message: 'Plant not found' });
    res.json({ success: true, plant });
  }));

  app.delete('/api/garden/:id', requireAuth, wrap(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ success: false, message: 'Plant not found' });
    await GardenPlant.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  }));

  // ---------- Product reviews ----------
  const shapeReview = (r) => ({ id: r._id, name: r.user?.name || 'Customer', avatar: r.user?.profilePhoto || null, rating: r.rating, text: r.text, verified: !!r.verified, createdAt: r.createdAt });

  app.get('/api/reviews/product/:id', wrap(async (req, res) => {
    const pid = String(req.params.id);
    const [reviews, agg] = await Promise.all([
      Review.find({ productId: pid }).sort({ createdAt: -1 }).limit(50).populate('user', 'name profilePhoto'),
      Review.aggregate([{ $match: { productId: pid } }, { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } }]),
    ]);
    res.json({ success: true, reviews: reviews.map(shapeReview), average: agg[0]?.avg || 0, count: agg[0]?.n || 0 });
  }));

  app.post('/api/reviews/product/:id', requireAuth, wrap(async (req, res) => {
    const pid = String(req.params.id);
    if (!isId(pid) || !(await Plant.exists({ _id: pid }))) return res.status(404).json({ success: false, message: 'Product not found' });
    const rating = parseInt(req.body?.rating, 10);
    const text = String(req.body?.text || '').trim().slice(0, 1500);
    if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    if (text.length < 10) return res.status(400).json({ success: false, message: 'Please write at least a sentence' });
    if (await Review.exists({ user: req.user._id, productId: pid })) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    const order = await Order.findOne({ user: req.user._id, status: 'delivered', 'items.productId': { $in: [pid, new mongoose.Types.ObjectId(pid)] } });
    const review = await Review.create({ user: req.user._id, order: order?._id || null, productId: pid, rating, text, verified: !!order });
    await review.populate('user', 'name profilePhoto');
    res.json({ success: true, review: shapeReview(review) });
  }));

  // ---------- Coupons ----------
  app.post('/api/coupons/validate', wrap(async (req, res) => {
    let user = null;
    try {
      const token = (req.headers.authorization || '').split(' ')[1];
      if (token) user = await User.findById(jwt.verify(token, JWT_SECRET).id);
    } catch { /* guest */ }
    const subtotal = Math.max(0, Number(req.body?.subtotal) || 0);
    const { coupon, discount } = await evaluateCoupon(req.body?.code, subtotal, user);
    res.json({ success: true, code: coupon.code, discount, description: coupon.description });
  }));

  // Admin coupon management (used by the Marketing tab)
  const pickCoupon = (b) => {
    const out = {};
    for (const k of ['code', 'description', 'type']) if (b[k] !== undefined) out[k] = String(b[k]);
    for (const k of ['value', 'maxDiscount', 'minOrderValue', 'maxUses']) if (b[k] !== undefined && b[k] !== '') out[k] = b[k] === null ? null : Number(b[k]);
    for (const k of ['isActive', 'firstOrderOnly']) if (b[k] !== undefined) out[k] = !!b[k];
    if (b.expiryDate !== undefined) out.expiryDate = b.expiryDate ? new Date(b.expiryDate) : null;
    return out;
  };
  app.get('/api/admin/discounts', requireAdmin, wrap(async (req, res) => res.json(await Coupon.find().sort({ createdAt: -1 }))));
  app.post('/api/admin/discounts', requireAdmin, wrap(async (req, res) => {
    const data = pickCoupon(req.body || {});
    if (!data.code || data.value == null) return res.status(400).json({ success: false, message: 'Code and value are required' });
    if (await Coupon.exists({ code: data.code.toUpperCase() })) return res.status(400).json({ success: false, message: 'Code already exists' });
    res.json(await Coupon.create(data));
  }));
  app.put('/api/admin/discounts/:id', requireAdmin, wrap(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ success: false, message: 'Not found' });
    res.json(await Coupon.findByIdAndUpdate(req.params.id, { $set: pickCoupon(req.body || {}) }, { new: true }));
  }));
  app.delete('/api/admin/discounts/:id', requireAdmin, wrap(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ success: false, message: 'Not found' });
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  }));

  // ---------- Wallet ----------
  app.get('/api/wallet', requireAuth, wrap(async (req, res) => {
    const tx = [...(req.user.walletTransactions || [])].sort((a, b) => b.createdAt - a.createdAt).slice(0, 100);
    const tier = tierFor(await deliveredSpend(req.user._id));
    res.json({ success: true, balance: req.user.walletBalance || 0, cashbackPercent: Math.round(tier.rate * 100), tier: tier.name, transactions: tx });
  }));

  // ---------- Newsletter ----------
  app.post('/api/newsletter', wrap(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 200) return res.status(400).json({ success: false, message: 'Please enter a valid email' });
    const existed = await Subscriber.exists({ email });
    if (!existed) await Subscriber.create({ email });
    res.json({ success: true, message: existed ? "You're already on the list 🌿" : 'Welcome to the JeevaLeaf circle 🌿' });
  }));
  app.get('/api/admin/subscribers', requireAdmin, wrap(async (req, res) => {
    res.json({ success: true, subscribers: await Subscriber.find().sort({ createdAt: -1 }).limit(1000) });
  }));

  // ---------- Order cancellation ----------
  app.post('/api/orders/:id/cancel', requireAuth, wrap(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ success: false, message: 'Order not found' });
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!['pending', 'processing'].includes(String(order.status).toLowerCase())) return res.status(400).json({ success: false, message: 'This order has already shipped and can no longer be cancelled' });
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled' });
    await releaseOrder(order);
    await order.save();
    res.json({ success: true, order });
  }));
}

module.exports = { registerFeatureRoutes, priceOrder, creditCashback, creditReferral, releaseOrder, addOrderToGarden, guessWaterDays, notifyBackInStock };
