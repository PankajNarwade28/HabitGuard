const db = require('../config/db');

/**
 * Weekly Report Controller
 * Handles generation and retrieval of weekly usage reports
 */

/**
 * Generate weekly report for user
 */
exports.generateWeeklyReport = async (req, res) => {
  try {
    const userId = req.userId;
    const { weekStartDate, weekEndDate } = req.body;

    console.log(`📊 Generating weekly report for user ${userId}...`);
    console.log(`Week: ${weekStartDate} to ${weekEndDate}`);

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Calculate week start and end dates if not provided
      let startDate, endDate;
      if (weekStartDate && weekEndDate) {
        startDate = weekStartDate;
        endDate = weekEndDate;
      } else {
        // Default to last 7 days
        const today = new Date();
        endDate = today.toISOString().split('T')[0];
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
      }

      // 1. Get total screen time for the week
      const [screenTimeData] = await connection.execute(
        `SELECT 
          SUM(total_screen_time) as total_screen_time,
          AVG(total_screen_time) as daily_average,
          SUM(total_unlocks) as total_unlocks,
          COUNT(DISTINCT summary_date) as active_days
         FROM daily_summary
         WHERE u_id = ? 
         AND summary_date BETWEEN ? AND ?`,
        [userId, startDate, endDate]
      );

      const totalScreenTime = screenTimeData[0].total_screen_time || 0;
      const dailyAverage = parseFloat(screenTimeData[0].daily_average || 0).toFixed(2);
      const totalUnlocks = screenTimeData[0].total_unlocks || 0;
      const activeDays = screenTimeData[0].active_days || 0;

      // 2. Get most used apps for the week
      const [appUsageData] = await connection.execute(
        `SELECT 
          app_name,
          package_name,
          SUM(usage_time) as total_usage_time,
          COUNT(DISTINCT usage_date) as days_used
         FROM app_usage_history
         WHERE u_id = ? 
         AND usage_date BETWEEN ? AND ?
         GROUP BY app_name, package_name
         ORDER BY total_usage_time DESC
         LIMIT 10`,
        [userId, startDate, endDate]
      );

      const mostUsedApps = appUsageData.map(app => ({
        appName: app.app_name,
        packageName: app.package_name,
        totalTime: app.total_usage_time,
        daysUsed: app.days_used
      }));

      // 3. Get streak data for the week
      const [streakData] = await connection.execute(
        `SELECT 
          COUNT(*) as total_days,
          SUM(goal_met) as goals_met,
          AVG(screen_time_minutes) as avg_screen_time
         FROM streak_history
         WHERE u_id = ? 
         AND streak_date BETWEEN ? AND ?`,
        [userId, startDate, endDate]
      );

      const weekStreakData = {
        totalDays: streakData[0].total_days || 0,
        goalsMet: streakData[0].goals_met || 0,
        avgScreenTime: parseFloat(streakData[0].avg_screen_time || 0).toFixed(2),
        successRate: streakData[0].total_days > 0 
          ? Math.round((streakData[0].goals_met / streakData[0].total_days) * 100)
          : 0
      };

      // 4. Get current streak info
      const [currentStreak] = await connection.execute(
        `SELECT current_streak, longest_streak, total_active_days
         FROM user_statistics
         WHERE u_id = ?`,
        [userId]
      );

      const streakInfo = currentStreak[0] || {
        current_streak: 0,
        longest_streak: 0,
        total_active_days: 0
      };

      // 5. Get goals achievement
      const [goalsData] = await connection.execute(
        `SELECT 
          goal_type,
          target_value,
          current_value,
          goal_status
         FROM user_goals
         WHERE u_id = ?
         AND (start_date <= ? AND (end_date IS NULL OR end_date >= ?))`,
        [userId, endDate, startDate]
      );

      const goalAchievement = goalsData.map(goal => ({
        type: goal.goal_type,
        target: goal.target_value,
        current: goal.current_value,
        status: goal.goal_status,
        progress: goal.target_value > 0 
          ? Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100)
          : 0
      }));

      // 6. Calculate productivity score (0-100)
      let productivityScore = 0;
      
      // Base score from goal achievement
      if (weekStreakData.successRate >= 80) productivityScore += 40;
      else if (weekStreakData.successRate >= 60) productivityScore += 30;
      else if (weekStreakData.successRate >= 40) productivityScore += 20;
      else productivityScore += 10;
      
      // Score from streak maintenance
      if (streakInfo.current_streak >= 7) productivityScore += 30;
      else if (streakInfo.current_streak >= 3) productivityScore += 20;
      else if (streakInfo.current_streak >= 1) productivityScore += 10;
      
      // Score from active days
      if (activeDays >= 7) productivityScore += 30;
      else if (activeDays >= 5) productivityScore += 20;
      else if (activeDays >= 3) productivityScore += 10;

      // 7. Generate insights
      const insights = generateInsights({
        totalScreenTime,
        dailyAverage,
        weekStreakData,
        streakInfo,
        mostUsedApps,
        activeDays,
        totalUnlocks
      });

      // 8. Create report title
      const reportTitle = `Weekly Report: ${startDate} to ${endDate}`;

      // 9. Save report to database
      await connection.execute(
        `INSERT INTO weekly_reports 
        (u_id, report_title, week_start_date, week_end_date, total_screen_time, 
         daily_average, total_app_opens, most_used_apps, streak_data, 
         goal_achievement, productivity_score, insights, report_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        total_screen_time = VALUES(total_screen_time),
        daily_average = VALUES(daily_average),
        total_app_opens = VALUES(total_app_opens),
        most_used_apps = VALUES(most_used_apps),
        streak_data = VALUES(streak_data),
        goal_achievement = VALUES(goal_achievement),
        productivity_score = VALUES(productivity_score),
        insights = VALUES(insights),
        generated_at = CURRENT_TIMESTAMP`,
        [
          userId,
          reportTitle,
          startDate,
          endDate,
          totalScreenTime,
          dailyAverage,
          totalUnlocks,
          JSON.stringify(mostUsedApps),
          JSON.stringify(weekStreakData),
          JSON.stringify(goalAchievement),
          productivityScore,
          insights,
          'completed'
        ]
      );

      await connection.commit();
      connection.release();

      console.log('✅ Weekly report generated successfully');

      res.json({
        success: true,
        message: 'Weekly report generated successfully',
        data: {
          reportTitle,
          weekStartDate: startDate,
          weekEndDate: endDate,
          summary: {
            totalScreenTime,
            dailyAverage,
            totalUnlocks,
            activeDays
          },
          mostUsedApps,
          streakData: {
            ...weekStreakData,
            currentStreak: streakInfo.current_streak,
            longestStreak: streakInfo.longest_streak
          },
          goalAchievement,
          productivityScore,
          insights
        }
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('❌ Generate weekly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate weekly report',
      error: error.message
    });
  }
};

/**
 * Get user's weekly reports
 */
exports.getWeeklyReports = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 10 } = req.query;

    console.log(`📋 Fetching weekly reports for user ${userId}...`);

    const [reports] = await db.execute(
      `SELECT 
        report_id,
        report_title,
        week_start_date,
        week_end_date,
        total_screen_time,
        daily_average,
        total_app_opens,
        most_used_apps,
        streak_data,
        goal_achievement,
        productivity_score,
        insights,
        report_status,
        generated_at
       FROM weekly_reports
       WHERE u_id = ?
       ORDER BY week_start_date DESC
       LIMIT ?`,
      [userId, parseInt(limit)]
    );

    // Parse JSON fields
    const formattedReports = reports.map(report => ({
      ...report,
      most_used_apps: JSON.parse(report.most_used_apps || '[]'),
      streak_data: JSON.parse(report.streak_data || '{}'),
      goal_achievement: JSON.parse(report.goal_achievement || '[]')
    }));

    res.json({
      success: true,
      data: formattedReports,
      count: formattedReports.length
    });

  } catch (error) {
    console.error('❌ Get weekly reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly reports',
      error: error.message
    });
  }
};

/**
 * Get specific weekly report by ID
 */
exports.getWeeklyReportById = async (req, res) => {
  try {
    const userId = req.userId;
    const { reportId } = req.params;

    const [reports] = await db.execute(
      `SELECT * FROM weekly_reports
       WHERE report_id = ? AND u_id = ?`,
      [reportId, userId]
    );

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const report = reports[0];
    report.most_used_apps = JSON.parse(report.most_used_apps || '[]');
    report.streak_data = JSON.parse(report.streak_data || '{}');
    report.goal_achievement = JSON.parse(report.goal_achievement || '[]');

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('❌ Get weekly report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    });
  }
};

/**
 * Get latest weekly report
 */
exports.getLatestReport = async (req, res) => {
  try {
    const userId = req.userId;

    const [reports] = await db.execute(
      `SELECT * FROM weekly_reports
       WHERE u_id = ?
       ORDER BY week_start_date DESC
       LIMIT 1`,
      [userId]
    );

    if (reports.length === 0) {
      return res.json({
        success: true,
        message: 'No reports found. Generate your first report!',
        data: null
      });
    }

    const report = reports[0];
    report.most_used_apps = JSON.parse(report.most_used_apps || '[]');
    report.streak_data = JSON.parse(report.streak_data || '{}');
    report.goal_achievement = JSON.parse(report.goal_achievement || '[]');

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('❌ Get latest report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest report',
      error: error.message
    });
  }
};

/**
 * Delete weekly report
 */
exports.deleteWeeklyReport = async (req, res) => {
  try {
    const userId = req.userId;
    const { reportId } = req.params;

    const [result] = await db.execute(
      `DELETE FROM weekly_reports
       WHERE report_id = ? AND u_id = ?`,
      [reportId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
};

/**
 * Generate insights based on usage data
 */
function generateInsights(data) {
  const insights = [];
  const { totalScreenTime, dailyAverage, weekStreakData, streakInfo, mostUsedApps, activeDays, totalUnlocks } = data;

  // Screen time insights
  const avgHours = (dailyAverage / 60).toFixed(1);
  if (dailyAverage > 300) { // More than 5 hours
    insights.push(`📱 Your average daily screen time was ${avgHours} hours. Consider setting a lower daily goal to improve your digital wellbeing.`);
  } else if (dailyAverage > 180) { // 3-5 hours
    insights.push(`📊 Your average daily screen time was ${avgHours} hours. You're doing well! Try to maintain or reduce this further.`);
  } else {
    insights.push(`🎯 Excellent! Your average daily screen time was only ${avgHours} hours. Keep up the great work!`);
  }

  // Streak insights
  if (weekStreakData.goalsMet === weekStreakData.totalDays && weekStreakData.totalDays >= 7) {
    insights.push(`🔥 Perfect week! You met your goal every single day. Your current streak is ${streakInfo.current_streak} days!`);
  } else if (weekStreakData.successRate >= 70) {
    insights.push(`💪 Great consistency! You met your goal ${weekStreakData.goalsMet} out of ${weekStreakData.totalDays} days (${weekStreakData.successRate}%).`);
  } else if (weekStreakData.successRate < 50) {
    insights.push(`📈 Room for improvement: You met your goal ${weekStreakData.goalsMet} out of ${weekStreakData.totalDays} days. Let's aim higher next week!`);
  }

  // App usage insights
  if (mostUsedApps.length > 0) {
    const topApp = mostUsedApps[0];
    const topAppHours = (topApp.totalTime / 60).toFixed(1);
    insights.push(`📲 Your most used app was "${topApp.appName}" with ${topAppHours} hours of usage this week.`);
    
    // Check for social media apps
    const socialApps = ['Instagram', 'Facebook', 'TikTok', 'Twitter', 'Snapchat'];
    const hasSocialApp = mostUsedApps.some(app => 
      socialApps.some(social => app.appName.toLowerCase().includes(social.toLowerCase()))
    );
    
    if (hasSocialApp) {
      insights.push(`💬 Consider limiting social media usage to improve productivity and mental wellbeing.`);
    }
  }

  // Active days insights
  if (activeDays >= 7) {
    insights.push(`✅ You were active all 7 days this week. Consistency is key to building better habits!`);
  } else if (activeDays < 5) {
    insights.push(`📅 You were active ${activeDays} days this week. Try to log your usage daily for better insights.`);
  }

  // Unlock insights
  const avgUnlocksPerDay = activeDays > 0 ? Math.round(totalUnlocks / activeDays) : 0;
  if (avgUnlocksPerDay > 100) {
    insights.push(`🔓 You unlocked your phone an average of ${avgUnlocksPerDay} times per day. Try to be more mindful of checking your phone.`);
  } else if (avgUnlocksPerDay < 50) {
    insights.push(`👍 Great phone discipline! You averaged only ${avgUnlocksPerDay} unlocks per day.`);
  }

  // Motivational message
  if (weekStreakData.successRate >= 80) {
    insights.push(`🌟 You're crushing your goals! Keep this momentum going into next week!`);
  } else {
    insights.push(`💡 Remember: Small improvements each day lead to big results over time. You've got this!`);
  }

  return insights.join('\n\n');
}

module.exports = exports;
