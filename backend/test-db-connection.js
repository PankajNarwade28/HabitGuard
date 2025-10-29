/**
 * Test Database Connection and Table Structure
 * Run this to verify your database is set up correctly
 */

const mysql = require('mysql2/promise');
const config = require('./config/db.config');

async function testDatabaseConnection() {
  console.log('🔍 Testing HabitGuard Database Connection...\n');
  
  let connection;
  
  try {
    // Test connection
    console.log('1️⃣ Connecting to MySQL...');
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port
    });
    console.log('   ✅ Connected to MySQL server\n');
    
    // Check if database exists
    console.log('2️⃣ Checking if database exists...');
    const [databases] = await connection.query(
      `SHOW DATABASES LIKE '${config.database}'`
    );
    
    if (databases.length === 0) {
      console.log('   ❌ Database "habitguard" does not exist!');
      console.log('   📋 Creating database...');
      await connection.query(`CREATE DATABASE ${config.database}`);
      console.log('   ✅ Database "habitguard" created\n');
    } else {
      console.log('   ✅ Database "habitguard" exists\n');
    }
    
    // Use database
    await connection.query(`USE ${config.database}`);
    
    // Check if users table exists
    console.log('3️⃣ Checking if users table exists...');
    const [tables] = await connection.query(
      `SHOW TABLES LIKE 'users'`
    );
    
    if (tables.length === 0) {
      console.log('   ❌ Table "users" does not exist!');
      console.log('   📋 Creating users table...');
      
      await connection.query(`
        CREATE TABLE users (
          u_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          age INT,
          education VARCHAR(100),
          email VARCHAR(255) UNIQUE NOT NULL,
          mobile_no VARCHAR(20),
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('   ✅ Table "users" created\n');
    } else {
      console.log('   ✅ Table "users" exists\n');
    }
    
    // Get table structure
    console.log('4️⃣ Checking table structure...');
    const [columns] = await connection.query(
      `DESCRIBE users`
    );
    
    console.log('   📋 Table Structure:');
    columns.forEach(col => {
      console.log(`      - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(Required)' : '(Optional)'} ${col.Key === 'PRI' ? '[Primary Key]' : ''}`);
    });
    console.log('');
    
    // Count users
    console.log('5️⃣ Checking existing users...');
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as count FROM users`
    );
    const userCount = countResult[0].count;
    console.log(`   📊 Total users in database: ${userCount}\n`);
    
    if (userCount > 0) {
      const [users] = await connection.query(
        `SELECT u_id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5`
      );
      console.log('   📋 Recent users:');
      users.forEach(user => {
        console.log(`      - ID: ${user.u_id} | ${user.name} (${user.email}) | Created: ${user.created_at}`);
      });
      console.log('');
    }
    
    console.log('✅ Database is ready for use!\n');
    console.log('📝 Summary:');
    console.log(`   • Host: ${config.host}:${config.port}`);
    console.log(`   • Database: ${config.database}`);
    console.log(`   • Users Table: Ready`);
    console.log(`   • Registered Users: ${userCount}`);
    console.log('');
    console.log('🚀 You can now start the server with: npm start');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Make sure MySQL/XAMPP is running');
    console.error('   2. Check credentials in backend/config/db.config.js');
    console.error('   3. Verify MySQL is listening on port', config.port);
    console.error('   4. Try accessing phpMyAdmin: http://localhost/phpmyadmin');
    console.error('\n💡 If database setup fails, you can still use the demo account:');
    console.error('   Email: demo@habitguard.com');
    console.error('   Password: demo123');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testDatabaseConnection();
