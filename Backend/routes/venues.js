const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Venue = require('../models/Venue');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Get all venues
// @route   GET /api/venues
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Venue.countDocuments({ isActive: true });

    // Build query
    const query = { isActive: true };

    // Filter by city
    if (req.query.city) {
      query['address.city'] = { $regex: req.query.city, $options: 'i' };
    }

    // Filter by facilities
    if (req.query.facilities) {
      const facilities = req.query.facilities.split(',');
      query.facilities = { $in: facilities };
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query['pricing.hourlyRate'] = {};
      if (req.query.minPrice) query['pricing.hourlyRate'].$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query['pricing.hourlyRate'].$lte = parseFloat(req.query.maxPrice);
    }

    const venues = await Venue.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.json({
      success: true,
      count: venues.length,
      pagination,
      data: venues
    });
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single venue
// @route   GET /api/venues/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('bookings');

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    res.json({
      success: true,
      data: venue
    });
  } catch (error) {
    console.error('Get venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create venue (Admin only)
// @route   POST /api/venues
// @access  Private (Admin only)
router.post('/', authorize('admin'), [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Venue name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('address.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of 2 numbers [longitude, latitude]'),
  body('contactInfo.phone')
    .trim()
    .notEmpty()
    .withMessage('Contact phone is required'),
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('pricing.hourlyRate')
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Add createdBy field
    req.body.createdBy = req.user.id;

    const venue = await Venue.create(req.body);

    res.status(201).json({
      success: true,
      data: venue
    });
  } catch (error) {
    console.error('Create venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during venue creation'
    });
  }
});

// @desc    Update venue (Admin only)
// @route   PUT /api/venues/:id
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Venue name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('pricing.hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    venue = await Venue.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'name');

    res.json({
      success: true,
      data: venue
    });
  } catch (error) {
    console.error('Update venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during venue update'
    });
  }
});

// @desc    Delete venue (Admin only)
// @route   DELETE /api/venues/:id
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    // Soft delete - set isActive to false
    venue.isActive = false;
    await venue.save();

    res.json({
      success: true,
      message: 'Venue deleted successfully'
    });
  } catch (error) {
    console.error('Delete venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during venue deletion'
    });
  }
});

// @desc    Get venues by location (nearby search)
// @route   GET /api/venues/nearby
// @access  Private
router.get('/nearby', async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const coordinates = [parseFloat(longitude), parseFloat(latitude)];
    const venues = await Venue.findNearby(coordinates, parseFloat(maxDistance))
      .populate('createdBy', 'name')
      .limit(20);

    res.json({
      success: true,
      count: venues.length,
      data: venues
    });
  } catch (error) {
    console.error('Get nearby venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get venue stats (Admin only)
// @route   GET /api/venues/stats
// @access  Private (Admin only)
router.get('/stats', authorize('admin'), async (req, res) => {
  try {
    const stats = await Venue.getVenueStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get venue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get available courts for a venue
// @route   GET /api/venues/:id/courts
// @access  Private
router.get('/:id/courts', async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    const availableCourts = venue.courts.filter(court => court.isAvailable);

    res.json({
      success: true,
      data: {
        venue: venue.name,
        totalCourts: venue.courts.length,
        availableCourts: availableCourts.length,
        courts: venue.courts
      }
    });
  } catch (error) {
    console.error('Get venue courts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 