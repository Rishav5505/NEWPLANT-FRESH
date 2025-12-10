#!/usr/bin/env node
// Script: setAllStock.js
// Purpose: Set `stock` = 10 for all Plant documents in the database.
// Usage: from `server` folder run `node scripts/setAllStock.js`

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/newplant';

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

    const Plant = require('../models/Plant');

    console.log('Updating all plants to stock = 10...');
    const result = await Plant.updateMany({}, { $set: { stock: 10 } });
    console.log('Update result:', result);

    const count = await Plant.countDocuments({ stock: 10 });
    console.log(`${count} plant(s) now have stock = 10`);

    await mongoose.disconnect();
    console.log('Disconnected. Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating stock:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

main();
