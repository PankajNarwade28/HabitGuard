/**
 * MySQL Database Configuration
 * 
 * Now reads from the unified .env file in the project root
 */

// Load environment variables from root .env file
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

module.exports = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'habitguard',
  port: parseInt(process.env.DB_PORT || '3306'),
  
  // Connection pool settings
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  waitForConnections: true,
  queueLimit: 0
};

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Open phpMyAdmin in your browser
 * 2. Create a new database named 'habitguard'
 * 3. Run the following SQL to create the users table:
 * 
 * CREATE TABLE users (
 *   u_id INT AUTO_INCREMENT PRIMARY KEY,
 *   name VARCHAR(100) NOT NULL,
 *   age INT,
 *   education VARCHAR(100),
 *   email VARCHAR(255) UNIQUE NOT NULL,
 *   mobile_no VARCHAR(20),
 *   password VARCHAR(255) NOT NULL,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 * 
 * 4. Replace the credentials above with your actual MySQL credentials
 */
