const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: mongoose.Schema.Types.Mixed },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, default: '' },
  verified: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
