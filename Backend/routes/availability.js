const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Availability = require('../models/Availability');
const User = require('../models/User');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Get current week availability for all players
// @route   GET /api/availability/current-week
// @access  Private (Admin only)
router.get('/current-week', authorize('admin'), async (req, res) => {
  try {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 3); // Wednesday
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const gameDate = new Date(weekStart);
    gameDate.setDate(weekStart.getDate() + 2); // Friday

    const availability = await Availability.find({
      weekStartDate: weekStart,
      weekEndDate: weekEnd
    }).populate('user', 'name email');

    // Get all players who haven't responded
    const allPlayers = await User.find({ role: 'player' }).select('name email');
    const respondedPlayerIds = availability.map(a => a.user._id.toString());
    const nonRespondedPlayers = allPlayers.filter(player => 
      !respondedPlayerIds.includes(player._id.toString())
    );

    const availablePlayers = availability.filter(a => a.isAvailable);
    const unavailablePlayers = availability.filter(a => !a.isAvailable);

    res.json({
      success: true,
      data: {
        weekStart: weekStart,
        weekEnd: weekEnd,
        gameDate: gameDate,
        availablePlayers,
        unavailablePlayers,
        nonRespondedPlayers,
        totalPlayers: allPlayers.length,
        respondedCount: availability.length,
        availableCount: availablePlayers.length,
        unavailableCount: unavailablePlayers.length
      }
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Submit availability response
// @route   POST /api/availability/respond
// @access  Private
router.post('/respond', [
  body('isAvailable')
    .isBoolean()
    .withMessage('Availability must be true or false'),
  body('gameDate')
    .isISO8601()
    .withMessage('Valid game date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { isAvailable, gameDate } = req.body;
    const gameDateObj = new Date(gameDate);
    
    // Calculate week start (Wednesday)
    const weekStart = new Date(gameDateObj);
    weekStart.setDate(gameDateObj.getDate() - gameDateObj.getDay() + 3);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Check if already responded
    const existingResponse = await Availability.findOne({
      user: req.user.id,
      weekStartDate: weekStart
    });

    if (existingResponse) {
      // Update existing response
      existingResponse.isAvailable = isAvailable;
      existingResponse.responseDate = new Date();
      await existingResponse.save();

      return res.json({
        success: true,
        message: 'Availability updated successfully',
        data: existingResponse
      });
    }

    // Create new response
    const availability = await Availability.create({
      user: req.user.id,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      gameDate: gameDateObj,
      isAvailable: isAvailable
    });

    await availability.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Availability submitted successfully',
      data: availability
    });
  } catch (error) {
    console.error('Submit availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's availability history
// @route   GET /api/availability/history
// @access  Private
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const availability = await Availability.find({ user: req.user.id })
      .sort({ weekStartDate: -1 })
      .limit(limit)
      .skip(startIndex)
      .populate('user', 'name email');

    const total = await Availability.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      count: availability.length,
      total,
      data: availability
    });
  } catch (error) {
    console.error('Get availability history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 