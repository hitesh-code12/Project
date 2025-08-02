const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  gameDate: {
    type: Date,
    required: true
  },
  isAvailable: {
    type: Boolean,
    required: true
  },
  responseDate: {
    type: Date,
    default: Date.now
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to ensure one response per user per week
availabilitySchema.index({ user: 1, weekStartDate: 1 }, { unique: true });

// Virtual for formatted dates
availabilitySchema.virtual('formattedGameDate').get(function() {
  return this.gameDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

availabilitySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Availability', availabilitySchema); 