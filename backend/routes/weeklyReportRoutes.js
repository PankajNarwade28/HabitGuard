const express = require('express');
const router = express.Router();
const weeklyReportController = require('../controllers/weeklyReportController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/reports/generate
 * @desc    Generate weekly report for user
 * @access  Private
 */
router.post('/generate', weeklyReportController.generateWeeklyReport);

/**
 * @route   GET /api/reports
 * @desc    Get all weekly reports for user (default: last 10)
 * @access  Private
 */
router.get('/', weeklyReportController.getWeeklyReports);

/**
 * @route   GET /api/reports/latest
 * @desc    Get latest weekly report
 * @access  Private
 */
router.get('/latest', weeklyReportController.getLatestReport);

/**
 * @route   GET /api/reports/:reportId
 * @desc    Get specific weekly report by ID
 * @access  Private
 */
router.get('/:reportId', weeklyReportController.getWeeklyReportById);

/**
 * @route   DELETE /api/reports/:reportId
 * @desc    Delete weekly report
 * @access  Private
 */
router.delete('/:reportId', weeklyReportController.deleteWeeklyReport);

module.exports = router;
