const mongoose = require('mongoose');

const PlantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['indoor', 'flowering', 'outdoor', 'planters', 'care-kits'], required: true },
  salePrice: { type: Number, required: true },
  oldPrice: { type: Number },
  stock: { type: Number, default: 0 },
  stockManaged: { type: Boolean, default: false }, // only enforce stock once an admin sets it
  description: { type: String },
  imageUrl: { type: String },
  csvId: { type: String }, // to track which row in CSV this came from
  syncedFrom: { type: String, default: 'csv' } // to track data source
}, { timestamps: true });

PlantSchema.index({ category: 1, csvId: 1 });

module.exports = mongoose.model('Plant', PlantSchema);
