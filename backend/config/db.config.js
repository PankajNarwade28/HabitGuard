/**
 * MySQL Database Configuration
 * 
 * Fill in your phpMyAdmin database credentials here
 */

module.exports = {
  host: 'localhost',  // Your MySQL host (usually localhost)
  user: 'root',  // Your MySQL username
  password: '',  // Your MySQL password
  database: 'habitguard',  // Database name
  port: 3306,  // MySQL port (default: 3306)
  
  // Connection pool settings
  connectionLimit: 10,
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
