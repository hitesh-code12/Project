const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const League = require('../models/League');
const User = require('../models/User');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Get all leagues
// @route   GET /api/leagues
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const leagues = await League.find()
      .populate('teams.player1', 'name email')
      .populate('teams.player2', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await League.countDocuments();

    res.json({
      success: true,
      count: leagues.length,
      total,
      data: leagues
    });
  } catch (error) {
    console.error('Get leagues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single league
// @route   GET /api/leagues/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const league = await League.findById(req.params.id)
      .populate('teams.player1', 'name email')
      .populate('teams.player2', 'name email')
      .populate('matches.team1', 'name')
      .populate('matches.team2', 'name')
      .populate('matches.winner', 'name')
      .populate('matches.loser', 'name')
      .populate('createdBy', 'name email');

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    res.json({
      success: true,
      data: league
    });
  } catch (error) {
    console.error('Get league error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create league
// @route   POST /api/leagues
// @access  Private (Admin only)
router.post('/', authorize('admin'), [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('League name must be between 3 and 100 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('teams')
    .isArray({ min: 2 })
    .withMessage('At least 2 teams are required'),
  body('teams.*.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Team name must be between 2 and 50 characters'),
  body('teams.*.player1')
    .isMongoId()
    .withMessage('Valid player 1 ID is required'),
  body('teams.*.player2')
    .isMongoId()
    .withMessage('Valid player 2 ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, description, startDate, endDate, teams } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Validate team players exist
    const playerIds = teams.flatMap(team => [team.player1, team.player2]);
    const players = await User.find({ _id: { $in: playerIds }, role: 'player' });
    
    if (players.length !== playerIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more players not found'
      });
    }

    // Check for duplicate players
    const uniquePlayerIds = [...new Set(playerIds)];
    if (uniquePlayerIds.length !== playerIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Each player can only be in one team'
      });
    }

    const league = await League.create({
      name,
      description,
      startDate,
      endDate,
      teams,
      createdBy: req.user.id
    });

    await league.populate('teams.player1', 'name email');
    await league.populate('teams.player2', 'name email');
    await league.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'League created successfully',
      data: league
    });
  } catch (error) {
    console.error('Create league error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update match result
// @route   PUT /api/leagues/:id/matches/:matchId
// @access  Private (Admin only)
router.put('/:id/matches/:matchId', authorize('admin'), [
  body('winner')
    .isMongoId()
    .withMessage('Valid winner team ID is required'),
  body('scores')
    .isArray({ min: 1 })
    .withMessage('At least one set score is required'),
  body('scores.*.set')
    .isInt({ min: 1 })
    .withMessage('Valid set number is required'),
  body('scores.*.team1Score')
    .isInt({ min: 0, max: 30 })
    .withMessage('Team 1 score must be between 0 and 30'),
  body('scores.*.team2Score')
    .isInt({ min: 0, max: 30 })
    .withMessage('Team 2 score must be between 0 and 30')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { winner, scores } = req.body;
    const league = await League.findById(req.params.id);

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    const match = league.matches.id(req.params.matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if match date has passed
    if (new Date() < match.scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update result before match date'
      });
    }

    // Validate winner is one of the teams
    if (winner !== match.team1.toString() && winner !== match.team2.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Winner must be one of the teams in the match'
      });
    }

    const loser = winner === match.team1.toString() ? match.team2 : match.team1;

    // Update match
    match.isCompleted = true;
    match.winner = winner;
    match.loser = loser;
    match.scores = scores;
    match.completedDate = new Date();

    // Update team statistics
    const winnerTeam = league.teams.id(winner);
    const loserTeam = league.teams.id(loser);

    if (winnerTeam && loserTeam) {
      // Update wins/losses
      winnerTeam.wins += 1;
      loserTeam.losses += 1;
      winnerTeam.totalMatches += 1;
      loserTeam.totalMatches += 1;

      // Update streaks
      winnerTeam.currentStreak += 1;
      loserTeam.currentStreak = 0; // Reset streak on loss
    }

    await league.save();

    await league.populate('teams.player1', 'name email');
    await league.populate('teams.player2', 'name email');
    await league.populate('matches.team1', 'name');
    await league.populate('matches.team2', 'name');
    await league.populate('matches.winner', 'name');
    await league.populate('matches.loser', 'name');

    res.json({
      success: true,
      message: 'Match result updated successfully',
      data: league
    });
  } catch (error) {
    console.error('Update match result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get leaderboard
// @route   GET /api/leagues/:id/leaderboard
// @access  Private
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const league = await League.findById(req.params.id)
      .populate('teams.player1', 'name email')
      .populate('teams.player2', 'name email');

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    // Calculate leaderboard
    const leaderboard = league.teams
      .map(team => ({
        id: team._id,
        name: team.name,
        player1: team.player1,
        player2: team.player2,
        wins: team.wins,
        losses: team.losses,
        totalMatches: team.totalMatches,
        winPercentage: team.winPercentage,
        currentStreak: team.currentStreak
      }))
      .sort((a, b) => {
        // Sort by win percentage (descending), then by wins (descending)
        if (a.winPercentage !== b.winPercentage) {
          return b.winPercentage - a.winPercentage;
        }
        return b.wins - a.wins;
      });

    res.json({
      success: true,
      data: {
        league: {
          id: league._id,
          name: league.name,
          status: league.status
        },
        leaderboard
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 