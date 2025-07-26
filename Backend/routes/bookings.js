const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const User = require('../models/User');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'player') {
      // Players can only see their own bookings
      query.players = req.user.id;
    }
    // Admins can see all bookings

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by venue
    if (req.query.venue) {
      query.venue = req.query.venue;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate('venue', 'name address')
      .populate('players', 'name email')
      .populate('createdBy', 'name')
      .sort({ date: -1 })
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
      count: bookings.length,
      pagination,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('venue', 'name address contactInfo')
      .populate('players', 'name email phone')
      .populate('createdBy', 'name')
      .populate('cancelledBy', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has access to this booking
    if (req.user.role === 'player' && !booking.players.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create booking (Admin only)
// @route   POST /api/bookings
// @access  Private (Admin only)
router.post('/', authorize('admin'), [
  body('venue')
    .isMongoId()
    .withMessage('Valid venue ID is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('startTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('duration')
    .isFloat({ min: 0.5, max: 24 })
    .withMessage('Duration must be between 0.5 and 24 hours'),
  body('players')
    .isArray({ min: 1 })
    .withMessage('At least one player is required'),
  body('players.*')
    .isMongoId()
    .withMessage('Valid player IDs are required'),
  body('courtNumber')
    .isInt({ min: 1 })
    .withMessage('Valid court number is required'),
  body('hourlyRate')
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

    const { venue, date, startTime, endTime, duration, players, courtNumber, hourlyRate, notes } = req.body;

    // Check if venue exists
    const venueExists = await Venue.findById(venue);
    if (!venueExists) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    // Check if all players exist
    const playersExist = await User.find({ _id: { $in: players }, role: 'player' });
    if (playersExist.length !== players.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more players not found'
      });
    }

    // Check venue availability
    const isAvailable = await Booking.checkAvailability(venue, date, startTime, endTime, courtNumber);
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Venue is not available for the selected time and court'
      });
    }

    // Create booking
    const booking = await Booking.create({
      venue,
      date,
      startTime,
      endTime,
      duration,
      players,
      courtNumber,
      hourlyRate,
      notes,
      createdBy: req.user.id
    });

    // Populate the booking with related data
    await booking.populate([
      { path: 'venue', select: 'name address' },
      { path: 'players', select: 'name email' },
      { path: 'createdBy', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during booking creation'
    });
  }
});

// @desc    Update booking (Admin only)
// @route   PUT /api/bookings/:id
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Valid date is required'),
  body('startTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('duration')
    .optional()
    .isFloat({ min: 0.5, max: 24 })
    .withMessage('Duration must be between 0.5 and 24 hours'),
  body('players')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one player is required'),
  body('players.*')
    .optional()
    .isMongoId()
    .withMessage('Valid player IDs are required'),
  body('hourlyRate')
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

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be updated (not completed or cancelled)
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed or cancelled booking'
      });
    }

    // If updating time/date/court, check availability
    if (req.body.date || req.body.startTime || req.body.endTime || req.body.courtNumber) {
      const date = req.body.date || booking.date;
      const startTime = req.body.startTime || booking.startTime;
      const endTime = req.body.endTime || booking.endTime;
      const courtNumber = req.body.courtNumber || booking.courtNumber;

      const isAvailable = await Booking.checkAvailability(
        booking.venue,
        date,
        startTime,
        endTime,
        courtNumber,
        booking._id
      );

      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'Venue is not available for the selected time and court'
        });
      }
    }

    // Update booking
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate([
      { path: 'venue', select: 'name address' },
      { path: 'players', select: 'name email' },
      { path: 'createdBy', select: 'name' }
    ]);

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during booking update'
    });
  }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', [
  body('reason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Cancellation reason cannot be more than 200 characters')
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

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can cancel this booking
    if (req.user.role === 'player' && !booking.players.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Cancel booking
    await booking.cancelBooking(req.user.id, req.body.reason);

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during booking cancellation'
    });
  }
});

// @desc    Get booking stats
// @route   GET /api/bookings/stats
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    let userId = null;
    let dateRange = null;

    // If player, only show their stats
    if (req.user.role === 'player') {
      userId = req.user.id;
    }

    // If date range provided
    if (req.query.startDate && req.query.endDate) {
      dateRange = {
        start: req.query.startDate,
        end: req.query.endDate
      };
    }

    const stats = await Booking.getBookingStats(userId, dateRange);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Check venue availability
// @route   GET /api/bookings/availability
// @access  Private
router.get('/availability', async (req, res) => {
  try {
    const { venue, date, startTime, endTime, courtNumber } = req.query;

    if (!venue || !date || !startTime || !endTime || !courtNumber) {
      return res.status(400).json({
        success: false,
        message: 'Venue, date, startTime, endTime, and courtNumber are required'
      });
    }

    const isAvailable = await Booking.checkAvailability(venue, date, startTime, endTime, courtNumber);

    res.json({
      success: true,
      data: {
        isAvailable,
        venue,
        date,
        startTime,
        endTime,
        courtNumber
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 