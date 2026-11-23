const mongoose = require('mongoose');

// Customer questions on a product, answered by the JeevaLeaf team.
const QuestionSchema = new mongoose.Schema({
  plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: 'Customer' },
  question: { type: String, required: true, maxlength: 500 },
  answer: { type: String, default: '', maxlength: 1500 },
  answeredAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
