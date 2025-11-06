const db = require('../config/db');

// Create a study plan
exports.createStudyPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      subjectId, 
      subjectCode, 
      subjectName, 
      plannedDurationMinutes, 
      targetDailyHours, 
      targetWeeklyHours,
      priority 
    } = req.body;

    // Get profile_id
    const [profiles] = await db.query(
      'SELECT profile_id FROM student_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }

    const profileId = profiles[0].profile_id;

    // Insert study plan
    const [result] = await db.query(
      `INSERT INTO study_plans 
      (user_id, profile_id, subject_id, subject_code, subject_name, 
       planned_duration_minutes, target_daily_hours, target_weekly_hours, priority) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, profileId, subjectId, subjectCode, subjectName, 
       plannedDurationMinutes, targetDailyHours, targetWeeklyHours, priority]
    );

    res.json({
      success: true,
      message: 'Study plan created successfully',
      planId: result.insertId
    });
  } catch (error) {
    console.error('Error creating study plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create study plan' 
    });
  }
};

// Get all study plans for a user
exports.getStudyPlans = async (req, res) => {
  try {
    const { userId } = req.params;

    const [plans] = await db.query(
      `SELECT sp.*, ss.subject_name, ss.credits, ss.study_hours_recommended
       FROM study_plans sp
       JOIN student_subjects ss ON sp.subject_id = ss.subject_id
       WHERE sp.user_id = ? AND sp.status = 'active'
       ORDER BY sp.priority DESC, sp.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Error fetching study plans:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch study plans' 
    });
  }
};

// Create a new study session
exports.createStudySession = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      subjectId, 
      planId,
      subjectCode, 
      subjectName, 
      plannedDurationMinutes 
    } = req.body;

    // Get profile_id
    const [profiles] = await db.query(
      'SELECT profile_id FROM student_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }

    const profileId = profiles[0].profile_id;

    // Resolve subject_id from subject_code if needed
    let finalSubjectId = subjectId;
    if (!subjectId || subjectId === 0) {
      const [subjects] = await db.query(
        'SELECT subject_id FROM student_subjects WHERE profile_id = ? AND subject_code = ?',
        [profileId, subjectCode]
      );
      
      if (subjects.length > 0) {
        finalSubjectId = subjects[0].subject_id;
      } else {
        return res.status(404).json({ 
          success: false, 
          message: 'Subject not found for this student profile' 
        });
      }
    }

    // Insert study session
    const [result] = await db.query(
      `INSERT INTO study_sessions 
      (user_id, profile_id, subject_id, plan_id, subject_code, subject_name, planned_duration_minutes, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'not_started')`,
      [userId, profileId, finalSubjectId, planId, subjectCode, subjectName, plannedDurationMinutes]
    );

    res.json({
      success: true,
      message: 'Study session created successfully',
      sessionId: result.insertId
    });
  } catch (error) {
    console.error('Error creating study session:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create study session' 
    });
  }
};

// Start a study session
exports.startStudySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Update session status and start time
    const [result] = await db.query(
      `UPDATE study_sessions 
       SET status = 'in_progress', start_time = NOW()
       WHERE session_id = ? AND status = 'not_started'`,
      [sessionId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session already started or not found' 
      });
    }

    // Get updated session
    const [session] = await db.query(
      'SELECT * FROM study_sessions WHERE session_id = ?',
      [sessionId]
    );

    res.json({
      success: true,
      message: 'Study session started',
      session: session[0]
    });
  } catch (error) {
    console.error('Error starting study session:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start study session' 
    });
  }
};

// Pause a study session
exports.pauseStudySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { currentDurationSeconds } = req.body;

    // Update session status and pause time
    const [result] = await db.query(
      `UPDATE study_sessions 
       SET status = 'paused', 
           pause_time = NOW(), 
           actual_duration_seconds = ?,
           pause_count = pause_count + 1
       WHERE session_id = ? AND status = 'in_progress'`,
      [currentDurationSeconds, sessionId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session not in progress or not found' 
      });
    }

    // Get updated session
    const [session] = await db.query(
      'SELECT * FROM study_sessions WHERE session_id = ?',
      [sessionId]
    );

    res.json({
      success: true,
      message: 'Study session paused',
      session: session[0]
    });
  } catch (error) {
    console.error('Error pausing study session:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to pause study session' 
    });
  }
};

// Resume a paused study session
exports.resumeStudySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Calculate pause duration and update
    const [result] = await db.query(
      `UPDATE study_sessions 
       SET status = 'in_progress',
           total_paused_seconds = total_paused_seconds + TIMESTAMPDIFF(SECOND, pause_time, NOW()),
           pause_time = NULL
       WHERE session_id = ? AND status = 'paused'`,
      [sessionId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session not paused or not found' 
      });
    }

    // Get updated session
    const [session] = await db.query(
      'SELECT * FROM study_sessions WHERE session_id = ?',
      [sessionId]
    );

    res.json({
      success: true,
      message: 'Study session resumed',
      session: session[0]
    });
  } catch (error) {
    console.error('Error resuming study session:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to resume study session' 
    });
  }
};

// Stop/Complete a study session
exports.stopStudySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { finalDurationSeconds, notes } = req.body;

    // Get session details
    const [sessions] = await db.query(
      'SELECT * FROM study_sessions WHERE session_id = ?',
      [sessionId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    const session = sessions[0];
    const plannedSeconds = session.planned_duration_minutes * 60;
    const completionPercentage = (finalDurationSeconds / plannedSeconds) * 100;

    // Update session as completed
    const [result] = await db.query(
      `UPDATE study_sessions 
       SET status = 'completed', 
           end_time = NOW(),
           actual_duration_seconds = ?,
           completion_percentage = ?,
           notes = ?
       WHERE session_id = ?`,
      [finalDurationSeconds, completionPercentage, notes || null, sessionId]
    );

    // Update study statistics
    const studyMinutes = Math.floor(finalDurationSeconds / 60);
    const statDate = new Date().toISOString().split('T')[0];

    await db.query(
      `INSERT INTO study_statistics 
       (user_id, profile_id, subject_id, stat_date, total_study_minutes, total_sessions, completed_sessions, average_session_minutes, total_pauses)
       VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?)
       ON DUPLICATE KEY UPDATE
       total_study_minutes = total_study_minutes + ?,
       total_sessions = total_sessions + 1,
       completed_sessions = completed_sessions + 1,
       average_session_minutes = (total_study_minutes + ?) / (total_sessions + 1),
       total_pauses = total_pauses + ?`,
      [
        session.user_id, session.profile_id, session.subject_id, statDate, 
        studyMinutes, studyMinutes, session.pause_count,
        studyMinutes, studyMinutes, session.pause_count
      ]
    );

    res.json({
      success: true,
      message: 'Study session completed',
      sessionId: sessionId,
      studyMinutes: studyMinutes,
      completionPercentage: completionPercentage.toFixed(2)
    });
  } catch (error) {
    console.error('Error stopping study session:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to stop study session' 
    });
  }
};

// Get active study session for user
exports.getActiveSession = async (req, res) => {
  try {
    const { userId } = req.params;

    const [sessions] = await db.query(
      `SELECT * FROM study_sessions 
       WHERE user_id = ? AND status IN ('in_progress', 'paused')
       ORDER BY start_time DESC
       LIMIT 1`,
      [userId]
    );

    if (sessions.length === 0) {
      return res.json({
        success: true,
        hasActiveSession: false,
        session: null
      });
    }

    res.json({
      success: true,
      hasActiveSession: true,
      session: sessions[0]
    });
  } catch (error) {
    console.error('Error fetching active session:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch active session' 
    });
  }
};

// Get study history for user
exports.getStudyHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, subjectId } = req.query;

    let query = `
      SELECT * FROM study_sessions 
      WHERE user_id = ? AND status = 'completed'
    `;
    const params = [userId];

    if (subjectId) {
      query += ' AND subject_id = ?';
      params.push(subjectId);
    }

    query += ' ORDER BY end_time DESC LIMIT ?';
    params.push(parseInt(limit));

    const [sessions] = await db.query(query, params);

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Error fetching study history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch study history' 
    });
  }
};

// Get study statistics
exports.getStudyStatistics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'week' } = req.query; // 'week', 'month', 'all'

    let dateCondition = '';
    if (period === 'week') {
      dateCondition = 'AND stat_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      dateCondition = 'AND stat_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }

    // Get statistics by subject
    const [subjectStats] = await db.query(
      `SELECT 
         ss.subject_id,
         sub.subject_code,
         sub.subject_name,
         SUM(ss.total_study_minutes) as total_minutes,
         SUM(ss.total_sessions) as total_sessions,
         SUM(ss.completed_sessions) as completed_sessions,
         AVG(ss.average_session_minutes) as avg_session_minutes
       FROM study_statistics ss
       JOIN student_subjects sub ON ss.subject_id = sub.subject_id
       WHERE ss.user_id = ? ${dateCondition}
       GROUP BY ss.subject_id, sub.subject_code, sub.subject_name
       ORDER BY total_minutes DESC`,
      [userId]
    );

    // Get overall statistics
    const [overallStats] = await db.query(
      `SELECT 
         SUM(total_study_minutes) as total_minutes,
         SUM(total_sessions) as total_sessions,
         SUM(completed_sessions) as completed_sessions,
         AVG(average_session_minutes) as avg_session_minutes,
         SUM(total_pauses) as total_pauses
       FROM study_statistics
       WHERE user_id = ? ${dateCondition}`,
      [userId]
    );

    // Get daily breakdown
    const [dailyStats] = await db.query(
      `SELECT 
         stat_date,
         SUM(total_study_minutes) as total_minutes,
         SUM(total_sessions) as total_sessions
       FROM study_statistics
       WHERE user_id = ? ${dateCondition}
       GROUP BY stat_date
       ORDER BY stat_date DESC`,
      [userId]
    );

    res.json({
      success: true,
      period,
      overall: overallStats[0] || {
        total_minutes: 0,
        total_sessions: 0,
        completed_sessions: 0,
        avg_session_minutes: 0,
        total_pauses: 0
      },
      bySubject: subjectStats,
      daily: dailyStats
    });
  } catch (error) {
    console.error('Error fetching study statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch study statistics' 
    });
  }
};

module.exports = exports;
