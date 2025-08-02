const cron = require('cron');
const User = require('../models/User');
const Availability = require('../models/Availability');

// Calculate next Friday's date
const getNextFriday = () => {
  const today = new Date();
  const daysUntilFriday = (5 - today.getDay() + 7) % 7;
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  nextFriday.setHours(10, 0, 0, 0); // 10 AM
  return nextFriday;
};

// Calculate week start (Wednesday)
const getWeekStart = (gameDate) => {
  const weekStart = new Date(gameDate);
  weekStart.setDate(gameDate.getDate() - 2); // Wednesday
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

// Calculate week end
const getWeekEnd = (weekStart) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

// Send availability notification to all players
const sendWeeklyNotification = async () => {
  try {
    console.log('🕐 Starting weekly availability notification...');
    
    const gameDate = getNextFriday();
    const weekStart = getWeekStart(gameDate);
    const weekEnd = getWeekEnd(weekStart);
    
    // Get all players
    const players = await User.find({ role: 'player' });
    
    console.log(`📧 Sending notifications to ${players.length} players for game on ${gameDate.toDateString()}`);
    
    // Create availability records for all players
    const availabilityPromises = players.map(async (player) => {
      // Check if already exists
      const existing = await Availability.findOne({
        user: player._id,
        weekStartDate: weekStart
      });
      
      if (!existing) {
        return Availability.create({
          user: player._id,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          gameDate: gameDate,
          isAvailable: null, // Will be set when player responds
          emailSent: true,
          emailSentDate: new Date()
        });
      } else {
        // Update existing record
        existing.emailSent = true;
        existing.emailSentDate = new Date();
        return existing.save();
      }
    });
    
    await Promise.all(availabilityPromises);
    
    console.log('✅ Weekly availability notifications sent successfully!');
    
    // TODO: Send actual emails here
    // For now, just log the notification
    players.forEach(player => {
      console.log(`📧 Notification sent to ${player.email} for game on ${gameDate.toDateString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error sending weekly notifications:', error);
  }
};

// Schedule weekly notification (Every Wednesday at 10 AM IST)
const scheduleWeeklyNotification = () => {
  // Cron expression: 0 10 * * 3 (Every Wednesday at 10 AM)
  const weeklyJob = new cron.CronJob('0 10 * * 3', sendWeeklyNotification, null, true, 'Asia/Kolkata');
  
  console.log('📅 Weekly availability notification scheduled for every Wednesday at 10 AM IST');
  
  return weeklyJob;
};

module.exports = {
  sendWeeklyNotification,
  scheduleWeeklyNotification,
  getNextFriday,
  getWeekStart,
  getWeekEnd
}; 