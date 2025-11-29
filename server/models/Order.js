const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: Number },
  name: { type: String },
  price: { type: Number },
  quantity: { type: Number },
  emoji: { type: String }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [OrderItemSchema], default: [] },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  shipping: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['card','cod','upi','netbanking'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending','paid','failed'], default: 'pending' },
  status: { type: String, default: 'pending' },
  deliveryName: { type: String },
  deliveryPhone: { type: String },
  deliveryEmail: { type: String },
  deliveryAddress: { type: String },
  deliveryLocation: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
