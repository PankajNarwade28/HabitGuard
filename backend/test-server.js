const express = require('express');
const app = express();
const PORT = 3000;

app.get('/test', (req, res) => {
  res.json({ message: 'Test server is working!' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Network: http://192.168.0.101:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
