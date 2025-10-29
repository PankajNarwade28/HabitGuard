const mysql = require('mysql2');
const config = require('./db.config');

// Create connection pool
const pool = mysql.createPool(config);

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error connecting to MySQL database:', err.message);
    console.error('⚠️  Database is not available. App will use demo account fallback.');
    console.error('📋 Demo Account Credentials:');
    console.error('   Email: demo@habitguard.com');
    console.error('   Password: demo123');
    console.error('\n💡 To fix database connection:');
    console.error('   1. Make sure MySQL/XAMPP is running');
    console.error('   2. Create database "habitguard" in phpMyAdmin');
    console.error('   3. Check credentials in backend/config/db.config.js');
  } else {
    console.log('✅ Successfully connected to MySQL database');
    console.log('📊 Database: habitguard');
    connection.release();
  }
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('⚠️  Database connection was lost. Attempting to reconnect...');
  }
});

// Export pool with promise support
module.exports = pool.promise();
