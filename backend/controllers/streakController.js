const db = require('../config/db');

/**
 * Streak Controller
 * Handles all streak tracking and management operations
 */

/**
 * Update user's streak
 * Called daily when user meets their goal
 */
exports.updateStreak = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      screenTimeMinutes,
      goalLimitMinutes,
      goalMet,
      notes
    } = req.body;

    const today = new Date().toISOString().split('T')[0];

    console.log(`🔥 Updating streak for user ${userId} on ${today}...`);

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Get current user statistics
      const [currentStats] = await connection.execute(
        `SELECT current_streak, longest_streak, last_active_date, streak_start_date, total_active_days
         FROM user_statistics WHERE u_id = ?`,
        [userId]
      );

      let currentStreak = 0;
      let longestStreak = 0;
      let totalActiveDays = 0;
      let streakStartDate = today;

      if (currentStats.length > 0) {
        const stats = currentStats[0];
        currentStreak = stats.current_streak || 0;
        longestStreak = stats.longest_streak || 0;
        totalActiveDays = stats.total_active_days || 0;
        
        const lastActiveDate = stats.last_active_date ? 
          new Date(stats.last_active_date).toISOString().split('T')[0] : null;

        // Calculate if streak continues
        if (lastActiveDate && goalMet) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastActiveDate === yesterdayStr) {
            // Streak continues
            currentStreak += 1;
            streakStartDate = stats.streak_start_date;
          } else if (lastActiveDate === today) {
            // Already logged today, just update
            currentStreak = stats.current_streak;
            streakStartDate = stats.streak_start_date;
          } else {
            // Streak broken, start new
            currentStreak = 1;
            streakStartDate = today;
          }
        } else if (goalMet) {
          // First time or starting new streak
          currentStreak = 1;
          streakStartDate = today;
        } else {
          // Goal not met, streak broken
          currentStreak = 0;
          streakStartDate = null;
        }

        // Update longest streak if current is higher
        longestStreak = Math.max(longestStreak, currentStreak);
        
        // Increment total active days if goal met
        if (goalMet) {
          totalActiveDays += 1;
        }
      } else {
        // First time tracking for this user
        if (goalMet) {
          currentStreak = 1;
          longestStreak = 1;
          totalActiveDays = 1;
          streakStartDate = today;
        }
      }

      // Update user_statistics table
      await connection.execute(
        `INSERT INTO user_statistics 
        (u_id, current_streak, longest_streak, last_active_date, streak_start_date, total_active_days, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE 
        current_streak = VALUES(current_streak),
        longest_streak = VALUES(longest_streak),
        last_active_date = VALUES(last_active_date),
        streak_start_date = VALUES(streak_start_date),
        total_active_days = VALUES(total_active_days),
        updated_at = CURRENT_TIMESTAMP`,
        [
          userId,
          currentStreak,
          longestStreak,
          today,
          streakStartDate,
          totalActiveDays
        ]
      );

      // Insert into streak_history table
      await connection.execute(
        `INSERT INTO streak_history 
        (u_id, streak_date, streak_count, goal_met, screen_time_minutes, goal_limit_minutes, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        streak_count = VALUES(streak_count),
        goal_met = VALUES(goal_met),
        screen_time_minutes = VALUES(screen_time_minutes),
        goal_limit_minutes = VALUES(goal_limit_minutes),
        notes = VALUES(notes)`,
        [
          userId,
          today,
          currentStreak,
          goalMet,
          screenTimeMinutes || 0,
          goalLimitMinutes || 0,
          notes || null
        ]
      );

      await connection.commit();
      connection.release();

      console.log(`✅ Streak updated successfully: ${currentStreak} days`);

      res.json({
        success: true,
        message: 'Streak updated successfully',
        data: {
          currentStreak,
          longestStreak,
          totalActiveDays,
          streakStartDate,
          goalMet,
          message: currentStreak > 0 ? 
            `🔥 ${currentStreak} day${currentStreak > 1 ? 's' : ''} streak!` : 
            'Keep going! Start your streak today!'
        }
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('❌ Update streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update streak',
      error: error.message
    });
  }
};

/**
 * Get user's current streak information
 */
exports.getStreakInfo = async (req, res) => {
  try {
    const userId = req.userId;

    console.log(`📊 Fetching streak info for user ${userId}...`);

    const [stats] = await db.execute(
      `SELECT current_streak, longest_streak, last_active_date, streak_start_date, total_active_days
       FROM user_statistics WHERE u_id = ?`,
      [userId]
    );

    if (stats.length === 0) {
      return res.json({
        success: true,
        data: {
          currentStreak: 0,
          longestStreak: 0,
          totalActiveDays: 0,
          streakStartDate: null,
          lastActiveDate: null,
          message: 'Start your first streak today!'
        }
      });
    }

    const streakData = stats[0];

    res.json({
      success: true,
      data: {
        currentStreak: streakData.current_streak || 0,
        longestStreak: streakData.longest_streak || 0,
        totalActiveDays: streakData.total_active_days || 0,
        streakStartDate: streakData.streak_start_date,
        lastActiveDate: streakData.last_active_date,
        message: streakData.current_streak > 0 ? 
          `🔥 You're on a ${streakData.current_streak} day streak!` : 
          'Start your streak today!'
      }
    });

  } catch (error) {
    console.error('❌ Get streak info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streak information',
      error: error.message
    });
  }
};

/**
 * Get streak history
 */
exports.getStreakHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 30 } = req.query;

    console.log(`📅 Fetching streak history for user ${userId}...`);

    const [history] = await db.execute(
      `SELECT streak_date, streak_count, goal_met, screen_time_minutes, goal_limit_minutes, notes
       FROM streak_history 
       WHERE u_id = ?
       ORDER BY streak_date DESC
       LIMIT ?`,
      [userId, parseInt(limit)]
    );

    res.json({
      success: true,
      data: history,
      count: history.length
    });

  } catch (error) {
    console.error('❌ Get streak history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streak history',
      error: error.message
    });
  }
};

/**
 * Get streak statistics (weekly, monthly)
 */
exports.getStreakStats = async (req, res) => {
  try {
    const userId = req.userId;

    console.log(`📈 Fetching streak statistics for user ${userId}...`);

    // Get overall stats
    const [userStats] = await db.execute(
      `SELECT current_streak, longest_streak, total_active_days, streak_start_date
       FROM user_statistics WHERE u_id = ?`,
      [userId]
    );

    // Get this week's performance
    const [weekStats] = await db.execute(
      `SELECT COUNT(*) as active_days, SUM(goal_met) as goals_met
       FROM streak_history
       WHERE u_id = ? AND streak_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      [userId]
    );

    // Get this month's performance
    const [monthStats] = await db.execute(
      `SELECT COUNT(*) as active_days, SUM(goal_met) as goals_met
       FROM streak_history
       WHERE u_id = ? AND streak_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [userId]
    );

    // Get best week ever
    const [bestWeek] = await db.execute(
      `SELECT DATE(streak_date) as week_start, COUNT(*) as days, SUM(goal_met) as goals_met
       FROM streak_history
       WHERE u_id = ?
       GROUP BY YEARWEEK(streak_date)
       ORDER BY goals_met DESC
       LIMIT 1`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        overall: userStats[0] || {
          current_streak: 0,
          longest_streak: 0,
          total_active_days: 0,
          streak_start_date: null
        },
        thisWeek: {
          activeDays: weekStats[0]?.active_days || 0,
          goalsMet: weekStats[0]?.goals_met || 0,
          percentage: weekStats[0]?.active_days ? 
            Math.round((weekStats[0].goals_met / weekStats[0].active_days) * 100) : 0
        },
        thisMonth: {
          activeDays: monthStats[0]?.active_days || 0,
          goalsMet: monthStats[0]?.goals_met || 0,
          percentage: monthStats[0]?.active_days ? 
            Math.round((monthStats[0].goals_met / monthStats[0].active_days) * 100) : 0
        },
        bestWeek: bestWeek[0] || null
      }
    });

  } catch (error) {
    console.error('❌ Get streak stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streak statistics',
      error: error.message
    });
  }
};

/**
 * Check if user maintained streak today
 */
exports.checkTodayStreak = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];

    const [todayRecord] = await db.execute(
      `SELECT goal_met, streak_count, screen_time_minutes, goal_limit_minutes
       FROM streak_history
       WHERE u_id = ? AND streak_date = ?`,
      [userId, today]
    );

    if (todayRecord.length === 0) {
      return res.json({
        success: true,
        data: {
          logged: false,
          goalMet: false,
          message: 'No activity logged for today yet'
        }
      });
    }

    res.json({
      success: true,
      data: {
        logged: true,
        goalMet: todayRecord[0].goal_met,
        streakCount: todayRecord[0].streak_count,
        screenTime: todayRecord[0].screen_time_minutes,
        goalLimit: todayRecord[0].goal_limit_minutes,
        message: todayRecord[0].goal_met ? 
          '✅ Goal achieved today!' : 
          '❌ Goal not met today'
      }
    });

  } catch (error) {
    console.error('❌ Check today streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check today\'s streak',
      error: error.message
    });
  }
};

module.exports = exports;
