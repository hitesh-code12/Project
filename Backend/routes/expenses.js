const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Expense = require('../models/Expense');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// @desc    Get all expenses
// @route   GET /api/payments/expenses
// @access  Admin only
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find({ isActive: true })
      .populate('venue', 'name address')
      .populate('addedBy', 'name email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expenses',
    });
  }
});

// @desc    Get single expense
// @route   GET /api/payments/expenses/:id
// @access  Admin only
router.get('/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('venue', 'name address')
      .populate('addedBy', 'name email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expense',
    });
  }
});

// @desc    Create new expense
// @route   POST /api/payments/expenses
// @access  Admin only
router.post('/expenses', [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('venue')
    .notEmpty()
    .withMessage('Venue is required')
    .isMongoId()
    .withMessage('Please provide a valid venue ID'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('category')
    .isIn(['court_booking', 'equipment', 'other'])
    .withMessage('Category must be court_booking, equipment, or other'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { date, venue, amount, description, category, imageUrl } = req.body;

    const expense = await Expense.create({
      date,
      venue,
      amount,
      description,
      category,
      imageUrl,
      addedBy: req.user.id,
    });

    // Populate venue and addedBy for response
    await expense.populate('venue', 'name address');
    await expense.populate('addedBy', 'name email');

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating expense',
    });
  }
});

// @desc    Update expense
// @route   PUT /api/payments/expenses/:id
// @access  Admin only
router.put('/expenses/:id', [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('venue')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid venue ID'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('category')
    .optional()
    .isIn(['court_booking', 'equipment', 'other'])
    .withMessage('Category must be court_booking, equipment, or other'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Update expense
    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('venue', 'name address').populate('addedBy', 'name email');

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating expense',
    });
  }
});

// @desc    Delete expense (soft delete)
// @route   DELETE /api/payments/expenses/:id
// @access  Admin only
router.delete('/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Soft delete by setting isActive to false
    expense.isActive = false;
    await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting expense',
    });
  }
});

// @desc    Get expense statistics
// @route   GET /api/payments/expenses/stats/summary
// @access  Admin only
router.get('/expenses/stats/summary', async (req, res) => {
  try {
    const stats = await Expense.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalExpenses: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
    ]);

    const categoryStats = await Expense.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyStats = await Expense.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || { totalAmount: 0, totalExpenses: 0, avgAmount: 0 },
        byCategory: categoryStats,
        byMonth: monthlyStats,
      },
    });
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expense statistics',
    });
  }
});

module.exports = router; 