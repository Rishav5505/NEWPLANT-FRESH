require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('./models/User');
const Order = require('./models/Order');
const Message = require('./models/Message');
const Plant = require('./models/Plant');

const {
  syncCSVToDatabase,
  resyncCSV,
  watchCSVFile,
  stopWatchingCSVFile,
  CSV_PATHS
} = require('./utils/csvSync');

/* ===============================
   APP INIT
================================ */
const app = express();
const PORT = process.env.PORT || 4000;

/* ===============================
   CORS (FIXED)
================================ */
const corsOptions = {
  origin: [
    "https://newplant-fresh.vercel.app",
    "https://newplant-fresh-4.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());

/* ===============================
   ENV
================================ */
const MONGO_URI = process.env.MONGO_URI || "";
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-prod";
const ADMIN_SECRET = process.env.ADMIN_SECRET || null;

/* ===============================
   SMTP
================================ */
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: (process.env.SMTP_PASS || '').replace(/\s+/g, '')
    }
  });
}

/* ===============================
   START SERVER
================================ */
async function start() {

  // HEALTHCHECK
  app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Backend OK" });
  });

  try {
    if (MONGO_URI) {
      await mongoose.connect(MONGO_URI, { autoIndex: true });
      console.log("Connected to MongoDB");
    }

    // CSV SYNC
    try {
      const categories = Object.keys(CSV_PATHS);
      for (const cat of categories) {
        await syncCSVToDatabase(cat);
      }
      watchCSVFile();
    } catch (e) {
      console.error("CSV sync error:", e.message);
    }

  } catch (err) {
    console.error("MongoDB error:", err.message);
  }

  /* ===============================
     EMAIL TEST
  ================================ */
  app.get('/__email_test', async (req, res) => {
    try {
      const transporter = getTransporter();
      await transporter.verify();

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.SMTP_USER,
        subject: 'NewPlant SMTP Test',
        text: 'SMTP is working'
      });

      res.json({ success: true, info });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ===============================
     AUTH
  ================================ */
  app.post('/api/signup', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password)
        return res.status(400).json({ success: false, message: "Missing fields" });

      const exists = await User.findOne({ email });
      if (exists)
        return res.status(400).json({ success: false, message: "Email already registered" });

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed });

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

      try {
        const transporter = getTransporter();
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: "Welcome to NewPlant 🌱",
          html: `<p>Hello <b>${name}</b>, your account is created.</p>`
        });
      } catch (e) {
        console.log("Email failed:", e.message);
      }

      res.json({ success: true, token, user });
    } catch {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ success: false });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(400).json({ success: false });

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

      res.json({ success: true, token, user });
    } catch {
      res.status(500).json({ success: false });
    }
  });

  /* ===============================
     MIDDLEWARES
  ================================ */
  async function auth(req, res, next) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ success: false });

      const data = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(data.id);
      if (!req.user) return res.status(401).json({ success: false });

      next();
    } catch {
      res.status(401).json({ success: false });
    }
  }

  async function requireAdmin(req, res, next) {
    await auth(req, res, () => {
      if (req.user.role !== 'admin')
        return res.status(403).json({ success: false, message: "Admin only" });
      next();
    });
  }

  /* ===============================
     ROUTES (REST SAME AS YOURS)
  ================================ */

  app.get('/api/plants/:category', async (req, res) => {
    const plants = await Plant.find({ category: req.params.category });
    res.json({ success: true, plants });
  });

  app.post('/api/orders', auth, async (req, res) => {
    const order = await Order.create({ ...req.body, user: req.user._id });
    res.json({ success: true, order });
  });

  app.get('/api/my-orders', auth, async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json({ success: true, orders });
  });

  app.post('/api/contact', async (req, res) => {
    await Message.create(req.body);
    res.json({ success: true });
  });

  /* ===============================
     SERVER LISTEN
  ================================ */
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  process.on("SIGTERM", () => {
    stopWatchingCSVFile();
    server.close(() => process.exit(0));
  });
}

start();
