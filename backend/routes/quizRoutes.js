const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Quiz routes
router.get('/available/:userId', quizController.getAvailableQuizzes);
router.get('/questions/:subjectCode', quizController.getQuizQuestions);
router.post('/submit/:userId/:subjectCode', quizController.submitQuiz);
router.get('/history/:userId', quizController.getQuizHistory);

module.exports = router;
