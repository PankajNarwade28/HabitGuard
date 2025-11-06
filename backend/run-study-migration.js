const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'habitguard',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'database', 'study-sessions-migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Read migration file');

    // Execute SQL
    await connection.query(sql);

    console.log('✅ Migration executed successfully!');

    // Verify tables were created
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'habitguard' 
      AND TABLE_NAME IN ('study_plans', 'study_sessions', 'study_statistics')
    `);

    console.log('\n📊 Tables created:');
    tables.forEach(table => {
      console.log(`  ✓ ${table.TABLE_NAME}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

runMigration();
