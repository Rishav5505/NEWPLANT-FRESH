require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const corsOptions = {
  origin: [
    "https://newplant-fresh.vercel.app",
    "https://newplant-fresh-4.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};

app.use(cors(corsOptions));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('./models/User');
const Order = require('./models/Order');
const Message = require('./models/Message');
const Plant = require('./models/Plant');
const { syncCSVToDatabase, resyncCSV, watchCSVFile, stopWatchingCSVFile, CSV_PATHS } = require('./utils/csvSync');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// --- SMTP transporter helper (available to all routes) ---
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.resend.com",
    port: Number(process.env.SMPTY_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || "resend",
      pass: (process.env.SMTP_PASS || "").trim(),
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}


// Payment gateway removed: using simple mock flows for card/upi/netbanking/cod

const MONGO_URI = process.env.MONGO_URI || "";
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-prod";

async function start() {
  if (!MONGO_URI) {
    console.warn('Warning: MONGO_URI not set. Set environment variable to connect to MongoDB.');
  }
  // HEALTHCHECK ROUTE
  app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Backend OK" });
  });

  try {
    if (MONGO_URI) await mongoose.connect(MONGO_URI, { autoIndex: true });
    console.log('Connected to MongoDB (if MONGO_URI provided)');
    
    // Sync CSV data to database on startup for all known categories
    try {
      console.log('Starting CSV to database sync for categories:', Object.keys(CSV_PATHS).join(', '));
      const categories = Object.keys(CSV_PATHS);
      const results = await Promise.all(categories.map(cat => syncCSVToDatabase(cat).catch(err => ({ success: false, message: err && err.message ? err.message : String(err) }))));
      console.log('CSV Sync Results:');
      categories.forEach((cat, i) => console.log(` - ${cat}:`, results[i]));
    } catch (err) {
      console.error('Error during initial CSV sync:', err);
    }

    // Start watching CSV files for real-time updates
    watchCSVFile();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }

  // --- Simple email test route ---
  app.get('/__email_test', async (req, res) => {
    try {
      const transporter = getTransporter();
      const verified = await transporter.verify();
      console.log('SMTP verified ->', verified);

      const to = process.env.SMTP_TEST_TO || process.env.SMTP_USER;
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: 'NewPlant — test email',
        text: 'This is a test email from NewPlant. If you received this, SMTP works.',
        html: '<b>This is a test email from NewPlant. If you received this, SMTP works.</b>'
      });

      console.log('sendMail info ->', info);
      return res.json({ ok: true, verified, info });
    } catch (err) {
      console.error('Email test error ->', err);
      return res.status(500).json({
        ok: false,
        message: err && err.message ? err.message : 'Unknown error',
        code: err && err.code ? err.code : undefined,
        stack: (process.env.NODE_ENV === 'development') ? err.stack : undefined
      });
    }
  });

  // Signup (updated: saves user, returns token and tries to send welcome/OTP email)
  app.post('/api/signup', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });

      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

      const hashed = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashed });
      await user.save();

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      // try to send welcome email (non-blocking failure returned to client)
      try {
        const transporter = getTransporter();

        // If you want OTP logic, generate and store OTP here. For now we send welcome mail.
        const mailInfo = await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: user.email,
          subject: 'Welcome to NewPlant — Account Created',
          text: `Hello ${user.name},\n\nYour account was created successfully.\n\nThanks,\nNewPlant`,
          html: `<p>Hello <b>${user.name}</b>,</p><p>Your account was created successfully.</p><p>Thanks,<br/>NewPlant</p>`
        });

        console.log('Signup email sent:', mailInfo);
        // return success including mail info
        return res.json({
          success: true,
          token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
          mail: { accepted: mailInfo.accepted, rejected: mailInfo.rejected }
        });
      } catch (mailErr) {
        console.error('Signup email failed:', mailErr);
        // still return created user and token but inform client that mail failed
        return res.json({
          success: true,
          token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
          mailError: mailErr && mailErr.message ? mailErr.message : 'Failed to send email'
        });
      }

    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Login
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(400).json({ success: false, message: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
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

      const subtotal = items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
      const tax = +(subtotal * 0.1).toFixed(2);
      const shipping = items.length > 0 ? 5 : 0;
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
        items,
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
      const result = await resyncCSV();
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

start();
