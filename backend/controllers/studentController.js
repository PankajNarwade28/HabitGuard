const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Load courses and recommendations data
const coursesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/courses.json'), 'utf8')
);
const recommendationsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/recommendations.json'), 'utf8')
);

// Create student profile
exports.createProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { courseType, degreeName, currentSemester, specialization, studyHoursPerDay } = req.body;

    // Validate course type
    if (!['undergraduate', 'postgraduate', 'diploma'].includes(courseType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid course type' 
      });
    }

    // Check if profile already exists
    const [existing] = await db.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student profile already exists' 
      });
    }

    // Insert student profile
    const [result] = await db.query(
      `INSERT INTO student_profiles 
      (user_id, course_type, degree_name, current_semester, specialization, study_hours_per_day) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, courseType, degreeName, currentSemester, specialization || null, studyHoursPerDay || 4]
    );

    // Update user's is_student flag
    await db.query(
      'UPDATE users SET is_student = TRUE WHERE u_id = ?',
      [userId]
    );

    // Auto-populate subjects based on course and semester
    const courseData = coursesData[courseType]?.[degreeName];
    console.log('📚 Course lookup:', { courseType, degreeName, found: !!courseData });
    
    if (courseData && courseData.semesters) {
      console.log('📖 Available semesters:', Object.keys(courseData.semesters));
      console.log('🔍 Looking for semester:', currentSemester, 'Type:', typeof currentSemester);
      
      const semesterKey = String(currentSemester);
      const subjects = courseData.semesters[semesterKey];
      console.log('📝 Found subjects:', subjects ? subjects.length : 0);
      
      if (subjects && subjects.length > 0) {
        for (const subject of subjects) {
          const studyHours = Math.ceil(subject.credits * 1.5); // 1.5 hours per credit
          await db.query(
            `INSERT INTO student_subjects 
            (profile_id, subject_name, subject_code, semester, credits, study_hours_recommended) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [result.insertId, subject.name, subject.code, currentSemester, subject.credits, studyHours]
          );
          console.log('✅ Added subject:', subject.code, subject.name);
        }
        console.log('✨ Successfully added', subjects.length, 'subjects');
      } else {
        console.log('⚠️ No subjects found for semester:', semesterKey);
      }
    } else {
      console.log('❌ Course data not found or no semesters');
    }

    res.json({
      success: true,
      message: 'Student profile created successfully',
      profileId: result.insertId
    });
  } catch (error) {
    console.error('Error creating student profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create student profile' 
    });
  }
};

// Get student profile
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const [profiles] = await db.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }

    const profile = profiles[0];

    // Get subjects for this profile
    const [subjects] = await db.query(
      'SELECT * FROM student_subjects WHERE profile_id = ? ORDER BY semester, subject_code',
      [profile.profile_id]
    );

    res.json({
      success: true,
      profile: {
        ...profile,
        subjects
      }
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch student profile' 
    });
  }
};

// Update student profile
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentSemester, specialization, studyHoursPerDay } = req.body;

    const [result] = await db.query(
      `UPDATE student_profiles 
      SET current_semester = ?, specialization = ?, study_hours_per_day = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = ?`,
      [currentSemester, specialization, studyHoursPerDay, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }

    res.json({
      success: true,
      message: 'Student profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update student profile' 
    });
  }
};

// Get available courses
exports.getCourses = async (req, res) => {
  try {
    const { courseType } = req.query;

    if (courseType && !['undergraduate', 'postgraduate', 'diploma'].includes(courseType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid course type' 
      });
    }

    const courses = courseType ? coursesData[courseType] : coursesData;

    res.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch courses' 
    });
  }
};

// Get subjects for a semester
exports.getSubjects = async (req, res) => {
  try {
    const { userId } = req.params;

    const [profiles] = await db.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }

    const profile = profiles[0];

    const [subjects] = await db.query(
      'SELECT * FROM student_subjects WHERE profile_id = ? ORDER BY subject_code',
      [profile.profile_id]
    );

    res.json({
      success: true,
      subjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch subjects' 
    });
  }
};

// Get course recommendations for student's subjects
exports.getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get student's subjects
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

    const [subjects] = await db.query(
      'SELECT * FROM student_subjects WHERE profile_id = ?',
      [profiles[0].profile_id]
    );

    console.log('📚 Recommendations - Found subjects:', subjects.length);
    if (subjects.length === 0) {
      console.log('⚠️ No subjects found for profile:', profiles[0].profile_id);
    }

    // Map recommendations to subjects
    const recommendations = subjects.map(subject => {
      const recs = recommendationsData.recommendations.find(
        r => r.subjectCode === subject.subject_code
      );
      
      if (!recs) {
        console.log('⚠️ No recommendations found for:', subject.subject_code);
      }
      
      return {
        subject: {
          code: subject.subject_code,
          name: subject.subject_name,
          credits: subject.credits,
          studyHours: subject.study_hours_recommended
        },
        courses: recs ? recs.courses : []
      };
    });

    const filtered = recommendations.filter(r => r.courses.length > 0);
    console.log('✅ Returning', filtered.length, 'recommendations');

    res.json({
      success: true,
      recommendations: filtered
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch recommendations' 
    });
  }
};

// Get study time suggestions
exports.getStudyTimeSuggestions = async (req, res) => {
  try {
    const { userId } = req.params;

    const [profiles] = await db.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }

    const profile = profiles[0];

    const [subjects] = await db.query(
      'SELECT * FROM student_subjects WHERE profile_id = ? ORDER BY credits DESC',
      [profile.profile_id]
    );

    const totalRecommendedHours = subjects.reduce((sum, s) => sum + s.study_hours_recommended, 0);
    const availableHours = profile.study_hours_per_day;

    // Proportional allocation
    const suggestions = subjects.map(subject => {
      const proportionalHours = (subject.study_hours_recommended / totalRecommendedHours) * availableHours;
      return {
        subjectCode: subject.subject_code,
        subjectName: subject.subject_name,
        credits: subject.credits,
        recommendedWeeklyHours: subject.study_hours_recommended,
        dailyHours: Math.round(proportionalHours * 10) / 10,
        priority: subject.credits >= 4 ? 'High' : subject.credits >= 3 ? 'Medium' : 'Low'
      };
    });

    res.json({
      success: true,
      totalAvailableHours: availableHours,
      totalRecommendedHours,
      suggestions
    });
  } catch (error) {
    console.error('Error fetching study time suggestions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch study time suggestions' 
    });
  }
};

// Repopulate subjects for existing profile (for fixing profiles created before the fix)
exports.repopulateSubjects = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get student profile
    const [profiles] = await db.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }

    const profile = profiles[0];
    const { course_type, degree_name, current_semester } = profile;

    console.log('🔄 Repopulating subjects for profile:', profile.profile_id);
    console.log('📚 Course:', course_type, degree_name, 'Semester:', current_semester);

    // Delete existing subjects
    await db.query('DELETE FROM student_subjects WHERE profile_id = ?', [profile.profile_id]);
    console.log('🗑️ Deleted existing subjects');

    // Auto-populate subjects based on course and semester
    const courseData = coursesData[course_type]?.[degree_name];
    console.log('📚 Course lookup:', { courseType: course_type, degreeName: degree_name, found: !!courseData });
    
    if (courseData && courseData.semesters) {
      console.log('📖 Available semesters:', Object.keys(courseData.semesters));
      console.log('🔍 Looking for semester:', current_semester, 'Type:', typeof current_semester);
      
      const semesterKey = String(current_semester);
      const subjects = courseData.semesters[semesterKey];
      console.log('📝 Found subjects:', subjects ? subjects.length : 0);
      
      if (subjects && subjects.length > 0) {
        for (const subject of subjects) {
          const studyHours = Math.ceil(subject.credits * 1.5); // 1.5 hours per credit
          await db.query(
            `INSERT INTO student_subjects 
            (profile_id, subject_name, subject_code, semester, credits, study_hours_recommended) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [profile.profile_id, subject.name, subject.code, current_semester, subject.credits, studyHours]
          );
          console.log('✅ Added subject:', subject.code, subject.name);
        }
        console.log('✨ Successfully repopulated', subjects.length, 'subjects');
        
        res.json({
          success: true,
          message: `Successfully repopulated ${subjects.length} subjects`,
          subjectsAdded: subjects.length
        });
      } else {
        console.log('⚠️ No subjects found for semester:', semesterKey);
        res.status(404).json({
          success: false,
          message: 'No subjects found for this semester'
        });
      }
    } else {
      console.log('❌ Course data not found or no semesters');
      res.status(404).json({
        success: false,
        message: 'Course data not found'
      });
    }
  } catch (error) {
    console.error('Error repopulating subjects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to repopulate subjects' 
    });
  }
};

module.exports = exports;
