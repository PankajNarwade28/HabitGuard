const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

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

module.exports = router;
