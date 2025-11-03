const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const weeklyReportRoutes = require('./routes/weeklyReportRoutes');
const studentRoutes = require('./routes/studentRoutes');
const quizRoutes = require('./routes/quizRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for React Native app
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', weeklyReportRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/quiz', quizRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'HabitGuard API is running',
    timestamp: new Date().toISOString()
  });
});

// Demo account info endpoint
app.get('/api/demo', (req, res) => {
  res.json({
    success: true,
    demoAccount: {
      email: 'demo@habitguard.com',
      password: 'demo123',
      name: 'Demo User',
      note: 'Use these credentials if database is not configured'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // Find local IP address
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
      }
    });
  });

  console.log('🚀 HabitGuard Backend Server Started');
  console.log(`📡 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://${localIP}:${PORT}`);
  console.log(`💻 API: http://${localIP}:${PORT}/api`);
  console.log('\n📋 Available routes:');
  console.log('  POST /api/auth/signup - Register new user');
  console.log('  POST /api/auth/login - User login');
  console.log('  GET  /api/auth/profile - Get user profile (requires auth)');
  console.log('  POST /api/reports/generate - Generate weekly report (requires auth)');
  console.log('  GET  /api/reports - Get all reports (requires auth)');
  console.log('  GET  /api/reports/latest - Get latest report (requires auth)');
  console.log('  \n🎓 Student routes:');
  console.log('  POST /api/student/profile/:userId - Create student profile');
  console.log('  GET  /api/student/profile/:userId - Get student profile');
  console.log('  PUT  /api/student/profile/:userId - Update student profile');
  console.log('  GET  /api/student/courses - Get available courses');
  console.log('  GET  /api/student/subjects/:userId - Get student subjects');
  console.log('  GET  /api/student/recommendations/:userId - Get course recommendations');
  console.log('  GET  /api/student/study-time/:userId - Get study time suggestions');
  console.log('  \n📝 Quiz routes:');
  console.log('  GET  /api/quiz/available/:userId - Get available quizzes');
  console.log('  GET  /api/quiz/questions/:subjectCode - Get quiz questions');
  console.log('  POST /api/quiz/submit/:userId/:subjectCode - Submit quiz answers');
  console.log('  GET  /api/quiz/history/:userId - Get quiz history');
  console.log('  \n⚕️ Other routes:');
  console.log('  GET  /api/health - Health check');
  console.log('  GET  /api/demo - Demo account info');
  console.log(`\n💡 Use http://${localIP}:${PORT}/api in your React Native app`);
  console.log('\n🎓 Demo Account (use if database not configured):');
  console.log('   📧 Email: demo@habitguard.com');
  console.log('   🔑 Password: demo123');
});

module.exports = app;
