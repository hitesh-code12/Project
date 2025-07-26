const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Please provide a booking reference']
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a player']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: [0, 'Payment amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'card', 'other'],
    required: [true, 'Please provide payment method']
  },
  paymentProof: {
    url: {
      type: String,
      required: [true, 'Please provide payment proof URL']
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    maxlength: [200, 'Review notes cannot be more than 200 characters']
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
paymentSchema.index({ booking: 1, player: 1 });
paymentSchema.index({ status: 1, createdAt: 1 });
paymentSchema.index({ player: 1, status: 1 });

// Virtual for booking details
paymentSchema.virtual('bookingDetails', {
  ref: 'Booking',
  localField: 'booking',
  foreignField: '_id',
  justOne: true
});

// Virtual for player details
paymentSchema.virtual('playerDetails', {
  ref: 'User',
  localField: 'player',
  foreignField: '_id',
  justOne: true
});

// Virtual for reviewer details
paymentSchema.virtual('reviewerDetails', {
  ref: 'User',
  localField: 'reviewedBy',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to validate file size and type
paymentSchema.pre('save', function(next) {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,application/pdf').split(',');
  
  if (this.paymentProof) {
    if (this.paymentProof.size > maxSize) {
      return next(new Error(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`));
    }
    
    if (!allowedTypes.includes(this.paymentProof.mimeType)) {
      return next(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
  
  next();
});

// Static method to get payment stats
paymentSchema.statics.getPaymentStats = async function(userId = null, dateRange = null) {
  const matchStage = {};
  
  if (userId) {
    matchStage.player = mongoose.Types.ObjectId(userId);
  }
  
  if (dateRange) {
    matchStage.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
        pendingPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approvedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        rejectedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        pendingAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
        },
        approvedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalPayments: 0,
    totalAmount: 0,
    avgAmount: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    rejectedPayments: 0,
    pendingAmount: 0,
    approvedAmount: 0
  };
};

// Static method to get payments by booking
paymentSchema.statics.getPaymentsByBooking = async function(bookingId) {
  return await this.find({ booking: bookingId })
    .populate('player', 'name email')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });
};

// Static method to get pending payments for admin review
paymentSchema.statics.getPendingPayments = async function(limit = 10, skip = 0) {
  return await this.find({ status: 'pending' })
    .populate('player', 'name email')
    .populate('booking', 'date startTime endTime venue')
    .populate({
      path: 'booking',
      populate: {
        path: 'venue',
        select: 'name'
      }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Instance method to approve payment
paymentSchema.methods.approvePayment = function(adminId, notes = '') {
  this.status = 'approved';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  return this.save();
};

// Instance method to reject payment
paymentSchema.methods.rejectPayment = function(adminId, notes = '') {
  this.status = 'rejected';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  return this.save();
};

// Static method to check if player has paid for booking
paymentSchema.statics.hasPlayerPaid = async function(bookingId, playerId) {
  const payment = await this.findOne({
    booking: bookingId,
    player: playerId,
    status: 'approved'
  });
  
  return !!payment;
};

module.exports = mongoose.model('Payment', paymentSchema); 