const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { handleUpload, handleMemoryUpload } = require('../middleware/upload');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Apply auth middleware to all routes
router.use(protect);

// @desc    Get all payments
// @route   GET /api/payments
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
      // Players can only see their own payments
      query.player = req.user.id;
    }
    // Admins can see all payments

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by booking
    if (req.query.booking) {
      query.booking = req.query.booking;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const total = await Payment.countDocuments(query);

    const payments = await Payment.find(query)
      .populate('booking', 'date startTime endTime venue')
      .populate('player', 'name email')
      .populate('reviewedBy', 'name')
      .populate({
        path: 'booking',
        populate: {
          path: 'venue',
          select: 'name'
        }
      })
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
      count: payments.length,
      pagination,
      data: payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking', 'date startTime endTime venue costPerPlayer')
      .populate('player', 'name email')
      .populate('reviewedBy', 'name')
      .populate({
        path: 'booking',
        populate: {
          path: 'venue',
          select: 'name address'
        }
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user has access to this payment
    if (req.user.role === 'player' && payment.player._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this payment'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Upload payment proof
// @route   POST /api/payments
// @access  Private
router.post('/', handleUpload, [
  body('booking')
    .isMongoId()
    .withMessage('Valid booking ID is required'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('paymentMethod')
    .isIn(['cash', 'upi', 'bank_transfer', 'card', 'other'])
    .withMessage('Valid payment method is required'),
  body('transactionId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Transaction ID cannot be more than 100 characters'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot be more than 500 characters')
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

    const { booking: bookingId, amount, paymentMethod, transactionId, notes } = req.body;

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is part of this booking
    if (!booking.players.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload payment for this booking'
      });
    }

    // Check if payment already exists for this player and booking
    const existingPayment = await Payment.findOne({
      booking: bookingId,
      player: req.user.id
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment proof already uploaded for this booking'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Payment proof file is required'
      });
    }

    // Upload file to Cloudinary
    let cloudinaryResult;
    try {
      cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'badminton-payments',
        resource_type: 'auto'
      });
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Error uploading file to cloud storage'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      player: req.user.id,
      amount,
      paymentMethod,
      transactionId,
      notes,
      paymentProof: {
        url: cloudinaryResult.secure_url,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    });

    // Populate the payment with related data
    await payment.populate([
      { path: 'booking', select: 'date startTime endTime venue' },
      { path: 'player', select: 'name email' },
      {
        path: 'booking',
        populate: {
          path: 'venue',
          select: 'name'
        }
      }
    ]);

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Upload payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payment upload'
    });
  }
});

// @desc    Approve payment (Admin only)
// @route   PUT /api/payments/:id/approve
// @access  Private (Admin only)
router.put('/:id/approve', authorize('admin'), [
  body('notes')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Review notes cannot be more than 200 characters')
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

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment is not pending for approval'
      });
    }

    // Approve payment
    await payment.approvePayment(req.user.id, req.body.notes);

    res.json({
      success: true,
      message: 'Payment approved successfully'
    });
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payment approval'
    });
  }
});

// @desc    Reject payment (Admin only)
// @route   PUT /api/payments/:id/reject
// @access  Private (Admin only)
router.put('/:id/reject', authorize('admin'), [
  body('notes')
    .isLength({ min: 1, max: 200 })
    .withMessage('Rejection reason is required (max 200 characters)')
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

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment is not pending for review'
      });
    }

    // Reject payment
    await payment.rejectPayment(req.user.id, req.body.notes);

    res.json({
      success: true,
      message: 'Payment rejected successfully'
    });
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payment rejection'
    });
  }
});

// @desc    Get payment stats
// @route   GET /api/payments/stats
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

    const stats = await Payment.getPaymentStats(userId, dateRange);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get pending payments (Admin only)
// @route   GET /api/payments/pending
// @access  Private (Admin only)
router.get('/pending', authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.getPendingPayments(limit, skip);

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get payments by booking
// @route   GET /api/payments/booking/:bookingId
// @access  Private
router.get('/booking/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
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

    const payments = await Payment.getPaymentsByBooking(req.params.bookingId);

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Get payments by booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 