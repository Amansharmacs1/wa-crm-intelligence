const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  leadId: { type: String, required: true, unique: true },
  contactName: { type: String, required: true },
  contactNumber: { type: String, default: null },
  chatTime: {
    firstMessageAt: { type: Date, default: null },
    lastMessageAt: { type: Date, default: null },
    durationMinutes: { type: Number, default: null }
  },
  intent: { type: String },
  language: { type: String },
  urgency: { type: String },
  urgencyReason: { type: String },
  priority: { type: String },
  followUpRequired: { type: Boolean, default: false },
  followUpStatus: { type: String },
  category: { type: String },
  leadScore: { type: Number, default: 0 },
  estimatedValue: {
    amount: { type: Number, default: null },
    currency: { type: String, default: 'INR' },
    displayValue: { type: String, default: null }
  },
  summary: { type: String },
  buyingSignals: [{ type: String }],
  recommendedAction: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

LeadSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Lead', LeadSchema);
