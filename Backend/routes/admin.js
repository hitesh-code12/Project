const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Get user stats
    const userStats = await User.getUserStats();
    
    // Get venue stats
    const venueStats = await Venue.getVenueStats();
    
    // Get booking stats
    const bookingStats = await Booking.getBookingStats();
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('venue', 'name')
      .populate('players', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get pending payments
    const pendingPayments = await Payment.find({ status: 'pending' })
      .populate('player', 'name')
      .populate('booking', 'date venue')
      .populate({
        path: 'booking',
        populate: {
          path: 'venue',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate total revenue
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        userStats,
        venueStats,
        bookingStats,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue,
        recentBookings,
        pendingPayments
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get system overview
// @route   GET /api/admin/overview
// @access  Private (Admin only)
router.get('/overview', async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalPlayers = await User.countDocuments({ role: 'player' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalVenues = await Venue.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const totalPayments = await Payment.countDocuments();

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayPayments = await Payment.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get this month's stats
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisMonthBookings = await Booking.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    const thisMonthRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: thisMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Calculate total revenue
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalPlayers,
          totalAdmins,
          totalVenues,
          totalBookings,
          totalPayments,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        today: {
          bookings: todayBookings,
          payments: todayPayments,
          revenue: todayRevenue[0]?.total || 0
        },
        thisMonth: {
          bookings: thisMonthBookings,
          revenue: thisMonthRevenue[0]?.total || 0
        }
      }
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get revenue analytics
// @route   GET /api/admin/revenue
// @access  Private (Admin only)
router.get('/revenue', async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    let matchStage = { status: 'approved' };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let groupStage = {};

    switch (period) {
      case 'daily':
        groupStage = {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          }
        };
        break;
      case 'weekly':
        groupStage = {
          _id: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' }
          }
        };
        break;
      case 'monthly':
      default:
        groupStage = {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          }
        };
        break;
    }

    groupStage.revenue = { $sum: '$amount' };
    groupStage.count = { $sum: 1 };

    const revenueData = await Payment.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    // Get payment method breakdown
    const paymentMethodBreakdown = await Payment.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        revenueData,
        paymentMethodBreakdown
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get booking analytics
// @route   GET /api/admin/bookings
// @access  Private (Admin only)
router.get('/bookings', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get booking status breakdown
    const statusBreakdown = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get venue booking breakdown
    const venueBreakdown = await Booking.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'venues',
          localField: 'venue',
          foreignField: '_id',
          as: 'venueData'
        }
      },
      { $unwind: '$venueData' },
      {
        $group: {
          _id: '$venueData.name',
          count: { $sum: 1 },
          revenue: { $sum: '$totalCost' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get monthly booking trends
    const monthlyBookings = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalCost' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        statusBreakdown,
        venueBreakdown,
        monthlyBookings
      }
    });
  } catch (error) {
    console.error('Get booking analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user analytics
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    // Get user registration trends
    const registrationTrends = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get top players by bookings
    const topPlayers = await Booking.aggregate([
      { $unwind: '$players' },
      {
        $lookup: {
          from: 'users',
          localField: 'players',
          foreignField: '_id',
          as: 'playerData'
        }
      },
      { $unwind: '$playerData' },
      {
        $group: {
          _id: '$playerData._id',
          name: { $first: '$playerData.name' },
          email: { $first: '$playerData.email' },
          bookingCount: { $sum: 1 },
          totalSpent: { $sum: '$costPerPlayer' }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 10 }
    ]);

    // Get user activity stats
    const userActivity = await User.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'players',
          as: 'bookings'
        }
      },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'player',
          as: 'payments'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          lastLogin: 1,
          bookingCount: { $size: '$bookings' },
          paymentCount: { $size: '$payments' },
          totalSpent: {
            $sum: '$payments.amount'
          }
        }
      },
      { $sort: { bookingCount: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        registrationTrends,
        topPlayers,
        userActivity
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get system health
// @route   GET /api/admin/health
// @access  Private (Admin only)
router.get('/health', async (req, res) => {
  try {
    // Check database connections
    const dbStatus = {
      users: await User.countDocuments(),
      venues: await Venue.countDocuments(),
      bookings: await Booking.countDocuments(),
      payments: await Payment.countDocuments()
    };

    // Get recent errors (if you have error logging)
    const recentErrors = []; // This would come from your error logging system

    // Get system uptime
    const uptime = process.uptime();

    // Get memory usage
    const memoryUsage = process.memoryUsage();

    res.json({
      success: true,
      data: {
        dbStatus,
        recentErrors,
        uptime,
        memoryUsage,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 