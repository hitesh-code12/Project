const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a venue name'],
    trim: true,
    maxlength: [100, 'Venue name cannot be more than 100 characters']
  },
  googlePlaceId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please provide street address']
    },
    city: {
      type: String,
      required: [true, 'Please provide city']
    },
    state: {
      type: String,
      required: [true, 'Please provide state']
    },
    zipCode: {
      type: String,
      required: [true, 'Please provide zip code']
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Please provide coordinates [longitude, latitude]'],
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && 
                 v[1] >= -90 && v[1] <= 90;
        },
        message: 'Invalid coordinates. Must be [longitude, latitude]'
      }
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Please provide contact phone']
    },
    email: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    website: {
      type: String,
      match: [
        /^https?:\/\/.+/,
        'Please provide a valid website URL'
      ]
    }
  },
  facilities: [{
    type: String,
    enum: [
      'parking',
      'shower',
      'locker',
      'equipment_rental',
      'coaching',
      'cafe',
      'wifi',
      'air_conditioning',
      'lighting',
      'spectator_area'
    ]
  }],
  courts: [{
    number: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['indoor', 'outdoor'],
      default: 'indoor'
    },
    surface: {
      type: String,
      enum: ['wooden', 'synthetic', 'concrete', 'grass'],
      default: 'wooden'
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  pricing: {
    hourlyRate: {
      type: Number,
      required: [true, 'Please provide hourly rate'],
      min: [0, 'Hourly rate cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    peakHourRate: {
      type: Number,
      min: [0, 'Peak hour rate cannot be negative']
    },
    peakHours: {
      start: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
      },
      end: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
      }
    }
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create geospatial index for location-based queries
venueSchema.index({ location: '2dsphere' });

// Virtual for full address
venueSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Virtual for venue bookings
venueSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'venue',
  justOne: false
});

// Static method to find venues within radius
venueSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

// Static method to get venue stats
venueSchema.statics.getVenueStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalVenues: { $sum: 1 },
        activeVenues: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        avgHourlyRate: { $avg: '$pricing.hourlyRate' },
        totalCourts: {
          $sum: { $size: '$courts' }
        }
      }
    }
  ]);

  return stats[0] || {
    totalVenues: 0,
    activeVenues: 0,
    avgHourlyRate: 0,
    totalCourts: 0
  };
};

module.exports = mongoose.model('Venue', venueSchema); 