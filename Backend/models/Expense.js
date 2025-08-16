const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: [true, 'Please provide a venue'],
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount must be positive'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  category: {
    type: String,
    enum: ['court_booking', 'equipment', 'other'],
    required: [true, 'Please provide a category'],
    default: 'other',
  },
  imageUrl: {
    type: String,
    default: null,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide the user who added this expense'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for formatted date
expenseSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Virtual for formatted amount
expenseSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toFixed(2)}`;
});

// Index for better query performance
expenseSchema.index({ date: -1 });
expenseSchema.index({ venue: 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ addedBy: 1 });

module.exports = mongoose.model('Expense', expenseSchema); 