const pool = require('./db');

async function updateDatabaseSchema() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🔧 Updating database schema for cPanel MySQL...\n');

    // 1. Add missing columns to users table
    console.log('1. Adding missing columns to users table...');
    
    // Check current table structure
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('Current users table structure:');
    console.table(columns.map(col => ({ Field: col.Field, Type: col.Type, Key: col.Key })));

    // Add missing columns if they don't exist
    const columnNames = columns.map(col => col.Field);
    
    if (!columnNames.includes('display_name')) {
      await connection.execute('ALTER TABLE users ADD COLUMN display_name VARCHAR(255) AFTER username');
      console.log('✅ Added display_name column');
    }
    
    if (!columnNames.includes('age')) {
      await connection.execute('ALTER TABLE users ADD COLUMN age INT AFTER display_name');
      console.log('✅ Added age column');
    }
    
    if (!columnNames.includes('school')) {
      await connection.execute('ALTER TABLE users ADD COLUMN school VARCHAR(255) AFTER age');
      console.log('✅ Added school column');
    }
    
    if (!columnNames.includes('laptop_id')) {
      await connection.execute('ALTER TABLE users ADD COLUMN laptop_id VARCHAR(255) AFTER school');
      console.log('✅ Added laptop_id column');
    }
    
    if (!columnNames.includes('user_type')) {
      await connection.execute('ALTER TABLE users ADD COLUMN user_type ENUM("admin", "teacher", "child") DEFAULT "child" AFTER laptop_id');
      console.log('✅ Added user_type column');
    }

    // 2. Update user_game_progress table foreign key constraint
    console.log('\n2. Updating user_game_progress table...');
    
    // Drop the foreign key constraint temporarily
    try {
      await connection.execute('ALTER TABLE user_game_progress DROP FOREIGN KEY user_game_progress_ibfk_1');
      console.log('✅ Dropped old foreign key constraint');
    } catch (error) {
      console.log('ℹ️ Foreign key constraint may not exist or already dropped');
    }

    // Recreate the foreign key constraint with proper options
    await connection.execute(`
      ALTER TABLE user_game_progress 
      ADD CONSTRAINT user_game_progress_user_fk 
      FOREIGN KEY (user_id) REFERENCES users(user_id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('✅ Added new foreign key constraint');

    // 3. Show updated table structure
    console.log('\n3. Updated table structures:');
    const [updatedColumns] = await connection.execute('DESCRIBE users');
    console.log('\nUsers table:');
    console.table(updatedColumns.map(col => ({ Field: col.Field, Type: col.Type, Key: col.Key })));

    const [progressColumns] = await connection.execute('DESCRIBE user_game_progress');
    console.log('\nUser_game_progress table:');
    console.table(progressColumns.map(col => ({ Field: col.Field, Type: col.Type, Key: col.Key })));

    // 4. Test data insertion
    console.log('\n4. Testing data insertion...');
    
    // Insert a test user to verify the schema works
    await connection.execute(`
      INSERT IGNORE INTO users (
        user_id, username, display_name, email, age, school, laptop_id, user_type,
        registration_date, last_active, is_active, total_games_played, total_score, highest_level
      ) VALUES (
        'test_schema_user', 'testuser', 'Test User', 'test@example.com', 12, 'Test School', 'laptop_test',
        'child', NOW(), NOW(), true, 0, 0, 0
      )
    `);
    console.log('✅ Test user inserted successfully');

    // Test progress insertion
    await connection.execute(`
      INSERT INTO user_game_progress (user_id, game_progress, last_updated) 
      VALUES ('test_schema_user', '{"unlockedLevels": 1, "levelStars": {}, "totalStars": 0}', NOW())
      ON DUPLICATE KEY UPDATE 
        game_progress = VALUES(game_progress),
        last_updated = NOW()
    `);
    console.log('✅ Test progress inserted successfully');

    console.log('\n🎉 Database schema update completed successfully!');
    console.log('Your application should now work without database errors.');

  } catch (error) {
    console.error('❌ Schema update error:', error.message);
    console.error('Error details:', error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

updateDatabaseSchema();
