const mongoose = require('mongoose');

// A plant a user owns, tracked in "My Garden" for watering reminders.
const GardenPlantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  nickname: { type: String, default: '', trim: true, maxlength: 60 },
  room: { type: String, default: '', trim: true, maxlength: 40 },
  image: { type: String, default: '' },
  productId: { type: String, default: null },
  waterEveryDays: { type: Number, default: 7, min: 1, max: 60 },
  lastWatered: { type: Date, default: null },
  history: { type: [Date], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('GardenPlant', GardenPlantSchema);
