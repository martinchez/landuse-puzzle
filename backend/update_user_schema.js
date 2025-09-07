const mysql = require('mysql2/promise');

async function updateUserSchema() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin',
      database: 'landuse_puzzle'
    });

    console.log('🔧 Updating users table schema...\n');

    // Add missing columns for child user functionality
    const alterQueries = [
      'ALTER TABLE users ADD COLUMN display_name VARCHAR(255) AFTER username',
      'ALTER TABLE users ADD COLUMN age INT AFTER email',
      'ALTER TABLE users ADD COLUMN school VARCHAR(255) AFTER age',
      'ALTER TABLE users ADD COLUMN laptop_id VARCHAR(255) AFTER school',
      'ALTER TABLE users ADD COLUMN user_type VARCHAR(50) DEFAULT "child" AFTER laptop_id',
      'ALTER TABLE users ADD COLUMN session_start TIMESTAMP AFTER user_type',
      'ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER session_start'
    ];

    for (const query of alterQueries) {
      try {
        await connection.execute(query);
        console.log('✅ Added column:', query.split('ADD COLUMN ')[1]?.split(' ')[0] || 'unknown');
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('ℹ️  Column already exists:', query.split('ADD COLUMN ')[1]?.split(' ')[0] || 'unknown');
        } else {
          console.log('❌ Error adding column:', error.message);
        }
      }
    }

    // Check updated schema
    console.log('\n🔍 Updated table structure:');
    const [columns] = await connection.execute('DESCRIBE users');
    console.table(columns);

    console.log('\n✅ Schema update complete!');

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateUserSchema();
