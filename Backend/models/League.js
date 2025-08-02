const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  totalMatches: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for win percentage
teamSchema.virtual('winPercentage').get(function() {
  if (this.totalMatches === 0) return 0;
  return Math.round((this.wins / this.totalMatches) * 100);
});

// Virtual for team display name
teamSchema.virtual('displayName').get(function() {
  return `${this.name} 🏸`;
});

teamSchema.set('toJSON', { virtuals: true });

const matchSchema = new mongoose.Schema({
  team1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  team2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  loser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  scores: [{
    set: {
      type: Number,
      required: true
    },
    team1Score: {
      type: Number,
      required: true
    },
    team2Score: {
      type: Number,
      required: true
    }
  }],
  completedDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual for match status
matchSchema.virtual('status').get(function() {
  if (this.isCompleted) {
    return 'completed';
  } else if (new Date() > this.scheduledDate) {
    return 'overdue';
  } else {
    return 'scheduled';
  }
});

// Virtual for formatted score
matchSchema.virtual('formattedScore').get(function() {
  if (!this.scores || this.scores.length === 0) return 'Not played';
  return this.scores.map(score => `${score.team1Score}-${score.team2Score}`).join(', ');
});

matchSchema.set('toJSON', { virtuals: true });

const leagueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  teams: [teamSchema],
  matches: [matchSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for league status
leagueSchema.virtual('status').get(function() {
  const now = new Date();
  if (now < this.startDate) return 'upcoming';
  if (now > this.endDate) return 'completed';
  return 'active';
});

// Virtual for total matches
leagueSchema.virtual('totalMatches').get(function() {
  return this.matches.length;
});

// Virtual for completed matches
leagueSchema.virtual('completedMatches').get(function() {
  return this.matches.filter(match => match.isCompleted).length;
});

leagueSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('League', leagueSchema); 