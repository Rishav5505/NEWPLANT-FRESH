const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  label: String,
  fullName: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  pincode: String,
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const PaymentSchema = new mongoose.Schema({
  id: String,
  type: { type: String, enum: ['card', 'upi', 'giftcard'], default: 'card' },
  label: String,
  cardNumber: String,
  cardholderName: String,
  expiryDate: String,
  cvv: String,
  upiId: String,
  giftCardNumber: String,
  giftCardBalance: Number,
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  phone: { type: String, default: '' },
  profilePhoto: { type: String, default: null },
  addresses: { type: [AddressSchema], default: [] },
  defaultAddressId: { type: String, default: null },
  paymentMethods: { type: [PaymentSchema], default: [] },
  defaultPaymentId: { type: String, default: null },
  walletBalance: { type: Number, default: 0 },
  twoFAEnabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
