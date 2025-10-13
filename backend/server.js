const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for React Native app
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'HabitGuard API is running',
    timestamp: new Date().toISOString()
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
  console.log(`� Network: http://${localIP}:${PORT}`);
  console.log(`💻 API: http://${localIP}:${PORT}/api`);
  console.log('\n📋 Available routes:');
  console.log('  POST /api/auth/signup - Register new user');
  console.log('  POST /api/auth/login - User login');
  console.log('  GET  /api/auth/profile - Get user profile (requires auth)');
  console.log('  GET  /api/health - Health check');
  console.log(`\n💡 Use http://${localIP}:${PORT}/api in your React Native app`);
});

module.exports = app;
