const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: [true, 'Please provide a venue']
  },
  date: {
    type: Date,
    required: [true, 'Please provide a booking date'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Booking date must be in the future'
    }
  },
  startTime: {
    type: String,
    required: [true, 'Please provide start time'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'Please provide end time'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  duration: {
    type: Number, // in hours
    required: [true, 'Please provide duration']
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  courtNumber: {
    type: Number,
    required: [true, 'Please provide court number']
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Please provide hourly rate'],
    min: [0, 'Hourly rate cannot be negative']
  },
  totalCost: {
    type: Number,
    required: [true, 'Please provide total cost'],
    min: [0, 'Total cost cannot be negative']
  },
  costPerPlayer: {
    type: Number,
    required: [true, 'Please provide cost per player'],
    min: [0, 'Cost per player cannot be negative']
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot be more than 200 characters']
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
bookingSchema.index({ date: 1, venue: 1, status: 1 });
bookingSchema.index({ players: 1, date: 1 });
bookingSchema.index({ createdBy: 1, date: 1 });

// Virtual for booking date in readable format
bookingSchema.virtual('dateFormatted').get(function() {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for time range
bookingSchema.virtual('timeRange').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});

// Virtual for venue details
bookingSchema.virtual('venueDetails', {
  ref: 'Venue',
  localField: 'venue',
  foreignField: '_id',
  justOne: true
});

// Virtual for player details
bookingSchema.virtual('playerDetails', {
  ref: 'User',
  localField: 'players',
  foreignField: '_id',
  justOne: false
});

// Virtual for payments
bookingSchema.virtual('payments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'booking',
  justOne: false
});

// Pre-save middleware to calculate costs
bookingSchema.pre('save', function(next) {
  if (this.isModified('hourlyRate') || this.isModified('duration') || this.isModified('players')) {
    this.totalCost = this.hourlyRate * this.duration;
    this.costPerPlayer = this.players.length > 0 ? this.totalCost / this.players.length : 0;
  }
  next();
});

// Static method to check venue availability
bookingSchema.statics.checkAvailability = async function(venueId, date, startTime, endTime, courtNumber, excludeBookingId = null) {
  const query = {
    venue: venueId,
    date: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999))
    },
    courtNumber: courtNumber,
    status: { $nin: ['cancelled'] }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBookings = await this.find(query);

  return conflictingBookings.every(booking => {
    const bookingStart = booking.startTime;
    const bookingEnd = booking.endTime;
    
    // Check if there's any overlap
    return (startTime >= bookingEnd || endTime <= bookingStart);
  });
};

// Static method to get booking stats
bookingSchema.statics.getBookingStats = async function(userId = null, dateRange = null) {
  const matchStage = {};
  
  if (userId) {
    matchStage.players = mongoose.Types.ObjectId(userId);
  }
  
  if (dateRange) {
    matchStage.date = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalCost: { $sum: '$totalCost' },
        avgCostPerBooking: { $avg: '$totalCost' },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        pendingBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalBookings: 0,
    totalCost: 0,
    avgCostPerBooking: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0
  };
};

// Instance method to cancel booking
bookingSchema.methods.cancelBooking = function(userId, reason) {
  this.status = 'cancelled';
  this.cancelledBy = userId;
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Booking', bookingSchema); 