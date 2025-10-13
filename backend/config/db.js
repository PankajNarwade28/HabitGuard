const mysql = require('mysql2');
const config = require('./db.config');

// Create connection pool
const pool = mysql.createPool(config);

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error connecting to MySQL database:', err.message);
    console.error('Please check your database credentials in backend/config/db.config.js');
  } else {
    console.log('✅ Successfully connected to MySQL database');
    connection.release();
  }
});

// Export pool with promise support
module.exports = pool.promise();
