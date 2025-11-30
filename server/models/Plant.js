const mongoose = require('mongoose');

const PlantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['indoor', 'flowering', 'outdoor', 'planters', 'care-kits'], required: true },
  salePrice: { type: Number, required: true },
  oldPrice: { type: Number },
  description: { type: String },
  imageUrl: { type: String },
  csvId: { type: String }, // to track which row in CSV this came from
  syncedFrom: { type: String, default: 'csv' } // to track data source
}, { timestamps: true });

module.exports = mongoose.model('Plant', PlantSchema);
