const mongoose = require('mongoose');

// "Email me when it's back" requests for sold-out products.
const StockAlertSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true, index: true }
}, { timestamps: true });

StockAlertSchema.index({ email: 1, plant: 1 }, { unique: true });

module.exports = mongoose.model('StockAlert', StockAlertSchema);
