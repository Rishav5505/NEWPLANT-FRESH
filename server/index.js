require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Order = require('./models/Order');
const Message = require('./models/Message');
const Otp = require('./models/Otp');
const Plant = require('./models/Plant');
const { syncCSVToDatabase, resyncCSV, watchCSVFile, stopWatchingCSVFile } = require('./utils/csvSync');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Payment gateway removed: using simple mock flows for card/upi/netbanking/cod

const MONGO_URI = process.env.MONGO_URI || "";
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-prod";

async function start() {
  if (!MONGO_URI) {
    console.warn('Warning: MONGO_URI not set. Set environment variable to connect to MongoDB.');
  }

  try {
    if (MONGO_URI) await mongoose.connect(MONGO_URI, { autoIndex: true });
    console.log('Connected to MongoDB (if MONGO_URI provided)');
    
    // Sync CSV data to database on startup
    console.log('Starting CSV to database sync...');
    const syncIndoor = await syncCSVToDatabase('indoor');
    console.log('Indoor Plants Sync Result:', syncIndoor);
    
    const syncFlowering = await syncCSVToDatabase('flowering');
    console.log('Flowering Plants Sync Result:', syncFlowering);
    
    const syncPlanters = await syncCSVToDatabase('planters');
    console.log('Planters Sync Result:', syncPlanters);
    
    const syncCareKits = await syncCSVToDatabase('care-kits');
    console.log('Care Kits Sync Result:', syncCareKits);
    
    const syncOutdoor = await syncCSVToDatabase('outdoor');
    console.log('Outdoor Plants Sync Result:', syncOutdoor);
    
    // Start watching CSV file for real-time updates
    watchCSVFile();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }

  // Signup
  app.post('/api/signup', async (req, res) => {
    try {
      const bcrypt = require('bcryptjs');
      const { name, email, password } = req.body;
      if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });

      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

      const hashed = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashed });
      await user.save();

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      const out = user.toObject();
      delete out.password;
      return res.json({ success: true, token, user: out });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Login
  app.post('/api/login', async (req, res) => {
    try {
      const bcrypt = require('bcryptjs');
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(400).json({ success: false, message: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      const out = user.toObject();
      delete out.password;
      return res.json({ success: true, token, user: out });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Protected test route
  app.get('/api/me', async (req, res) => {
    try {
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ success: false, message: 'Missing token' });
      const token = auth.split(' ')[1];
      const data = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(data.id).select('-password');
      return res.json({ success: true, user });
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  });

  // Update current user's profile (protected)
  app.put('/api/me', async (req, res) => {
    try {
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ success: false, message: 'Missing token' });
      const token = auth.split(' ')[1];
      const data = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(data.id);
      if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });

      // Only allow updating specific fields
      const allowed = [
        'name', 'email', 'phone', 'profilePhoto', 'addresses', 'defaultAddressId',
        'paymentMethods', 'defaultPaymentId', 'walletBalance', 'twoFAEnabled'
      ];

      for (let key of allowed) {
        if (req.body[key] !== undefined) {
          user[key] = req.body[key];
        }
      }

      // handle password change separately
      if (req.body.password) {
        const hashed = await bcrypt.hash(req.body.password, 10);
        user.password = hashed;
      }

      await user.save();
      const out = user.toObject();
      delete out.password;
      return res.json({ success: true, user: out });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Create Order (protected)
  app.post('/api/orders', async (req, res) => {
    try {
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ success: false, message: 'Missing token' });
      const token = auth.split(' ')[1];
      const data = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(data.id);
      if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });

      const { items, paymentMethod } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, message: 'No items provided' });

      // sanitize incoming items to expected schema
      const sanitizedItems = items.map((it) => ({
        productId: it.productId !== undefined ? it.productId : (it.id || null),
        name: it.name || '',
        price: Number(it.price) || 0,
        quantity: Number(it.quantity) || 1,
        emoji: it.emoji || '',
        image: it.image || '',
        currency: it.currency || ''
      }));

      const subtotal = sanitizedItems.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
      const tax = +(subtotal * 0.1).toFixed(2);
      const shipping = sanitizedItems.length > 0 ? 5 : 0;
      const total = +(subtotal + tax + shipping).toFixed(2);

      // determine initial payment and order status
      let paymentStatus = 'pending';
      let status = 'pending';
      const pm = (paymentMethod || 'cod').toLowerCase();
      // Cash-on-delivery: payment is pending but order moves to processing immediately
      if (pm === 'cod') {
        paymentStatus = 'pending';
        status = 'processing';
      }
      // other methods start as pending payment and pending processing

      // extract delivery details from request
      const { deliveryName, deliveryPhone, deliveryEmail, deliveryAddress, deliveryLocation } = req.body;

      const order = new Order({
        user: user._id,
        items: sanitizedItems,
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod: pm,
        paymentStatus,
        status,
        deliveryName: deliveryName || '',
        deliveryPhone: deliveryPhone || '',
        deliveryEmail: deliveryEmail || '',
        deliveryAddress: deliveryAddress || '',
        deliveryLocation: deliveryLocation || ''
      });
      await order.save();

      return res.json({ success: true, orderId: order._id, order });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Contact form: store a message (public)
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, phone, message } = req.body;
      if (!name || !message) return res.status(400).json({ success: false, message: 'Name and message are required' });

      const msg = new Message({ name, email: email || '', phone: phone || '', message });
      await msg.save();
      return res.json({ success: true, message: 'Message received' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Get user's own orders (protected)
  app.get('/api/my-orders', async (req, res) => {
    try {
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ success: false, message: 'Missing token' });
      const token = auth.split(' ')[1];
      const data = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(data.id);
      if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });

      const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(100);
      return res.json({ success: true, orders });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Get an order by id (protected, only owner)
  app.get('/api/orders/:id', async (req, res) => {
    try {
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ success: false, message: 'Missing token' });
      const token = auth.split(' ')[1];
      const data = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(data.id);
      if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });

      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      if (order.user.toString() !== user._id.toString()) return res.status(403).json({ success: false, message: 'Forbidden' });

      return res.json({ success: true, order });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // --- Plant Routes ---

  // Get all indoor plants (from CSV sync)
  app.get('/api/plants/indoor', async (req, res) => {
    try {
      const bcrypt = require('bcryptjs');
      const plants = await Plant.find({ category: 'indoor' }).sort({ createdAt: -1 });
      return res.json({ success: true, plants });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Get plants by category
  app.get('/api/plants/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const validCategories = ['indoor', 'flowering', 'outdoor', 'planters', 'care-kits'];
      
      if (!validCategories.includes(category)) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }

      const plants = await Plant.find({ category }).sort({ createdAt: -1 });
      return res.json({ success: true, plants, category });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Get single plant by ID
  app.get('/api/plants/detail/:id', async (req, res) => {
    try {
      const bcrypt = require('bcryptjs');
      const plant = await Plant.findById(req.params.id);
      if (!plant) return res.status(404).json({ success: false, message: 'Plant not found' });
      return res.json({ success: true, plant });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Search plants by name
  app.get('/api/plants/search/:query', async (req, res) => {
    try {
      const { query } = req.params;
      const plants = await Plant.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).limit(20);
      return res.json({ success: true, plants, query });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // --- Admin Routes ---
  const ADMIN_SECRET = process.env.ADMIN_SECRET || null;

  // helper middleware to require admin
  async function requireAdmin(req, res, next) {
    try {
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ success: false, message: 'Missing token' });
      const token = auth.split(' ')[1];
      const data = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(data.id);
      if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });
      if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
      req.admin = user;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  }

  // Create admin user via secret (useful for first-time setup)
  app.post('/api/admin/make-admin', async (req, res) => {
    try {
      const { email, secret } = req.body;
      if (!ADMIN_SECRET) return res.status(500).json({ success: false, message: 'Admin secret not configured on server' });
      if (!secret || secret !== ADMIN_SECRET) return res.status(403).json({ success: false, message: 'Invalid admin secret' });
      if (!email) return res.status(400).json({ success: false, message: 'Email required' });
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      user.role = 'admin';
      await user.save();
      return res.json({ success: true, message: 'User promoted to admin', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
      const orders = await Order.find().populate('user', 'name email role').sort({ createdAt: -1 }).limit(200);
      return res.json({ success: true, orders });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.get('/api/admin/orders/:id', requireAdmin, async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate('user', 'name email role');
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, order });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.post('/api/admin/orders/:id/update', requireAdmin, async (req, res) => {
    try {
      const { status, paymentStatus } = req.body;
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      if (status) order.status = status;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      await order.save();
      return res.json({ success: true, order });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(200);
      return res.json({ success: true, users });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Admin: Resync CSV to database
  app.post('/api/admin/plants/resync-csv', requireAdmin, async (req, res) => {
    try {
      const { category } = req.body;
      const catToSync = category || 'indoor'; // default to indoor if not specified
      const result = await resyncCSV(catToSync);
      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  });

  // Admin: Get all plants (for management)
  app.get('/api/admin/plants', requireAdmin, async (req, res) => {
    try {
      const plants = await Plant.find().sort({ createdAt: -1 }).limit(200);
      return res.json({ success: true, plants });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Admin: Create/Add a plant manually (non-CSV)
  app.post('/api/admin/plants', requireAdmin, async (req, res) => {
    try {
      const bcrypt = require('bcryptjs');
      const { name, category, salePrice, oldPrice, description, imageUrl } = req.body;
      
      if (!name || !category || !salePrice) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const plant = new Plant({
        name,
        category,
        salePrice,
        oldPrice,
        description,
        imageUrl,
        syncedFrom: 'manual'
      });
      
      await plant.save();
      return res.json({ success: true, message: 'Plant added', plant });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  });

  // Admin: Update a plant
  app.post('/api/admin/plants/:id/update', requireAdmin, async (req, res) => {
    try {
      const { name, category, salePrice, oldPrice, description, imageUrl } = req.body;
      const plant = await Plant.findById(req.params.id);
      
      if (!plant) return res.status(404).json({ success: false, message: 'Plant not found' });

      // Only allow updating manual plants, not CSV synced ones
      if (plant.syncedFrom === 'csv') {
        return res.status(403).json({ success: false, message: 'Cannot edit CSV synced plants. Update the CSV file and resync.' });
      }

      if (name) plant.name = name;
      if (category) plant.category = category;
      if (salePrice) plant.salePrice = salePrice;
      if (oldPrice !== undefined) plant.oldPrice = oldPrice;
      if (description) plant.description = description;
      if (imageUrl) plant.imageUrl = imageUrl;

      await plant.save();
      return res.json({ success: true, message: 'Plant updated', plant });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  });

  // Admin: Delete a plant
  app.post('/api/admin/plants/:id/delete', requireAdmin, async (req, res) => {
    try {
      const plant = await Plant.findById(req.params.id);
      
      if (!plant) return res.status(404).json({ success: false, message: 'Plant not found' });

      // Only allow deleting manual plants, not CSV synced ones
      if (plant.syncedFrom === 'csv') {
        return res.status(403).json({ success: false, message: 'Cannot delete CSV synced plants. Update the CSV file and resync.' });
      }

      await Plant.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'Plant deleted' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  });

  // Admin: list messages
  app.get('/api/admin/messages', requireAdmin, async (req, res) => {
    try {
      const messages = await Message.find().sort({ createdAt: -1 }).limit(500);
      return res.json({ success: true, messages });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Admin: get single message
  app.get('/api/admin/messages/:id', requireAdmin, async (req, res) => {
    try {
      const m = await Message.findById(req.params.id);
      if (!m) return res.status(404).json({ success: false, message: 'Message not found' });
      return res.json({ success: true, message: m });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Admin: mark message as read/unread or delete
  app.post('/api/admin/messages/:id/mark-read', requireAdmin, async (req, res) => {
    try {
      const { read } = req.body;
      const m = await Message.findById(req.params.id);
      if (!m) return res.status(404).json({ success: false, message: 'Message not found' });
      m.read = !!read;
      await m.save();
      return res.json({ success: true, message: m });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.post('/api/admin/messages/:id/delete', requireAdmin, async (req, res) => {
    try {
      const m = await Message.findById(req.params.id);
      if (!m) return res.status(404).json({ success: false, message: 'Message not found' });
      await m.remove();
      return res.json({ success: true, message: 'Deleted' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Legacy Razorpay endpoint removed. Use `/api/orders/:id/confirm-payment` to mark orders paid

  // Confirm payment for an order (protected) - mock endpoint to mark order as paid
  app.post('/api/orders/:id/confirm-payment', async (req, res) => {
    try {
      const bcrypt = require('bcryptjs');
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ success: false, message: 'Missing token' });
      const token = auth.split(' ')[1];
      const data = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(data.id);
      if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });

      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      if (order.user.toString() !== user._id.toString()) return res.status(403).json({ success: false, message: 'Forbidden' });

      order.paymentStatus = 'paid';
      order.status = 'processing';
      await order.save();

      return res.json({ success: true, orderId: order._id, order });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    stopWatchingCSVFile();
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    stopWatchingCSVFile();
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

// transporter will be initialized below (after env vars and nodemailer are available)

const rateLimit = require('express-rate-limit');

// simple email validator
function isValidEmail(email) {
  return typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email);
}

// rate limiter keyed by IP + email to avoid abuse
const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many OTP requests, try again later' },
  keyGenerator: (req) => {
    const email = req.body && req.body.email ? String(req.body.email).toLowerCase() : '';
    return `${req.ip}|${email}`;
  }
});

// Nodemailer transporter (configured via env)
const nodemailer = require('nodemailer');
const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
} = process.env;

let transporter = null;
let usingTestAccount = false;
async function initTransporter() {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 465,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    console.log('Using SMTP transporter from environment variables');
  } else {
    try {
      console.warn('SMTP not configured; creating a Nodemailer test account for OTP delivery (ethereal.email)');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      usingTestAccount = true;
      console.log('Created Nodemailer test account. Emails will be available via preview URL in server logs.');
    } catch (err) {
      console.warn('Failed to create Nodemailer test account. OTP emails will be logged to console instead.');
      transporter = null;
    }
  }
}

// initialize transporter (test account fallback) now that env vars are available
initTransporter().catch((err) => {
  console.error('initTransporter error', err);
});

// Request OTP
app.post('/api/request-otp', otpRequestLimiter, async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, message: 'Invalid email' });
    const normalized = String(email).toLowerCase().trim();

    // optional: check recent OTP and prevent spam
    const recent = await Otp.findOne({ email: normalized }).sort({ createdAt: -1 });
    if (recent && recent.expiresAt > new Date()) {
      console.log('OTP already recently generated for', normalized);
      return res.status(429).json({ success: false, message: 'OTP recently sent, please wait a few minutes' });
    }

    // generate 6-digit code
    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(code, salt);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Otp.create({ email: normalized, otpHash, expiresAt });

    // send email if transporter available
    if (transporter) {
      const mail = {
        from: SMTP_FROM || SMTP_USER || 'no-reply@example.com',
        to: normalized,
        subject: 'Your OTP for signing in',
        text: `Your OTP is ${code}. It expires in 10 minutes.`,
        html: `<p>Your OTP is <strong>${code}</strong>. It expires in 10 minutes.</p>`
      };
      try {
        const info = await transporter.sendMail(mail);
        console.log('OTP email sent:', info && (info.messageId || info.response));
        if (usingTestAccount) {
          const preview = nodemailer.getTestMessageUrl(info);
          if (preview) console.log('Preview URL (ethereal):', preview);
        }
      } catch (err) {
        console.error('Error sending OTP email', err);
        // as a fallback still log the OTP code so developer can test
        console.log('OTP (fallback log):', code);
      }
    } else {
      console.log('OTP (no transporter):', code);
    }

    return res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    console.error('request-otp error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    // Accept optional name and password from client so newly created users can keep their chosen name/password.
    const { email, otp, name: providedName, password: providedPassword } = req.body || {};
    if (!email || !otp || !isValidEmail(email)) return res.status(400).json({ success: false, message: 'Email and OTP required' });
    const normalized = String(email).toLowerCase().trim();

    const record = await Otp.findOne({ email: normalized }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ success: false, message: 'OTP not found or expired' });
    if (record.expiresAt < new Date()) {
      await Otp.findByIdAndDelete(record._id).catch(()=>{});
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    const match = await bcrypt.compare(String(otp), record.otpHash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid OTP' });

    // create user if not exists - use provided name and password if present
    let user = await User.findOne({ email: normalized });
    if (!user) {
      let hashed = null;
      if (providedPassword) {
        try {
          hashed = await bcrypt.hash(providedPassword, 10);
        } catch (e) {
          console.error('Password hashing error during OTP user creation', e);
        }
      }
      const nameToUse = providedName || normalized.split('@')[0];
      const passwordToUse = hashed || (await bcrypt.hash(Math.random().toString(36).slice(2, 12), 10));
      user = new User({ name: nameToUse, email: normalized, password: passwordToUse });
      await user.save();
      console.log('Created user via OTP:', normalized);
    } else {
      // If user exists but client provided a name and user has no name, update it
      if (providedName && (!user.name || user.name === '') ) {
        user.name = providedName;
        await user.save();
      }
    }

    // delete OTP record
    await Otp.findByIdAndDelete(record._id).catch(()=>{});

    // sign JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    const out = user.toObject();
    delete out.password;
    return res.json({ success: true, message: 'Verified', token, user: out });
  } catch (err) {
    console.error('verify-otp error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- Password reset flow ---
// Request password reset (sends token via email)
app.post('/api/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, message: 'Invalid email' });
    const normalized = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalized });
    if (!user) return res.status(404).json({ success: false, message: 'Email not found' });

    // generate secure token
    const crypto = require('crypto');
    const token = crypto.randomBytes(24).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const tokenHash = await bcrypt.hash(token, salt);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // store token in Otp collection (reusing model)
    await Otp.create({ email: normalized, otpHash: tokenHash, expiresAt });

    // send email with token (or link)
    const mail = {
      from: SMTP_FROM || SMTP_USER || 'no-reply@example.com',
      to: normalized,
      subject: 'Password reset for your account',
      text: `Use the following code to reset your password: ${token} (valid for 1 hour)`,
      html: `<p>Use the following code to reset your password: <strong>${token}</strong> (valid for 1 hour)</p>`
    };

    try {
      if (transporter) {
        const info = await transporter.sendMail(mail);
        console.log('Password reset email sent:', info && (info.messageId || info.response));
        if (usingTestAccount) {
          const preview = nodemailer.getTestMessageUrl(info);
          if (preview) console.log('Preview URL (ethereal):', preview);
        }
      } else {
        console.log('Password reset token (no transporter):', token);
      }
    } catch (err) {
      console.error('Error sending password reset email', err);
      // still proceed but inform client
      return res.status(500).json({ success: false, message: 'Failed to send reset email' });
    }

    return res.json({ success: true, message: 'Password reset token sent' });
  } catch (err) {
    console.error('request-password-reset error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify reset token and set new password
app.post('/api/verify-reset-token', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body || {};
    if (!email || !token || !newPassword || !isValidEmail(email)) return res.status(400).json({ success: false, message: 'Email, token and new password required' });
    const normalized = String(email).toLowerCase().trim();

    const record = await Otp.findOne({ email: normalized }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ success: false, message: 'Reset token not found or expired' });
    if (record.expiresAt < new Date()) {
      await Otp.findByIdAndDelete(record._id).catch(()=>{});
      return res.status(400).json({ success: false, message: 'Reset token expired' });
    }

    const match = await bcrypt.compare(String(token), record.otpHash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid token' });

    const user = await User.findOne({ email: normalized });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // delete token
    await Otp.findByIdAndDelete(record._id).catch(()=>{});

    return res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('verify-reset-token error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});
start();
