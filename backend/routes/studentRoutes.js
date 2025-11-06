const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const studySessionController = require('../controllers/studySessionController');

// Student profile routes
router.post('/profile/:userId', studentController.createProfile);
router.get('/profile/:userId', studentController.getProfile);
router.put('/profile/:userId', studentController.updateProfile);
router.post('/profile/:userId/repopulate-subjects', studentController.repopulateSubjects);

// Courses and subjects routes
router.get('/courses', studentController.getCourses);
router.get('/subjects/:userId', studentController.getSubjects);

// Recommendations and study time routes
router.get('/recommendations/:userId', studentController.getRecommendations);
router.get('/study-time/:userId', studentController.getStudyTimeSuggestions);

// Study plans routes
router.post('/study-plans/:userId', studySessionController.createStudyPlan);
router.get('/study-plans/:userId', studySessionController.getStudyPlans);

// Study sessions routes
router.post('/study-sessions/:userId', studySessionController.createStudySession);
router.get('/study-sessions/:userId/active', studySessionController.getActiveSession);
router.get('/study-sessions/:userId/history', studySessionController.getStudyHistory);
router.post('/study-sessions/:sessionId/start', studySessionController.startStudySession);
router.post('/study-sessions/:sessionId/pause', studySessionController.pauseStudySession);
router.post('/study-sessions/:sessionId/resume', studySessionController.resumeStudySession);
router.post('/study-sessions/:sessionId/stop', studySessionController.stopStudySession);

// Study statistics routes
router.get('/study-statistics/:userId', studySessionController.getStudyStatistics);

module.exports = router;
