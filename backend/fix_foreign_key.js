const pool = require('./db');

async function fixForeignKeyConstraint() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🔧 Fixing foreign key constraint...\n');

    // 1. Check current constraints
    console.log('1. Checking current constraints...');
    const [constraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
        AND TABLE_NAME = 'user_game_progress' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    console.log('Current foreign key constraints:');
    console.table(constraints);

    // 2. Drop all foreign key constraints on user_game_progress
    for (const constraint of constraints) {
      try {
        await connection.execute(`ALTER TABLE user_game_progress DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}`);
        console.log(`✅ Dropped constraint: ${constraint.CONSTRAINT_NAME}`);
      } catch (error) {
        console.log(`⚠️ Could not drop constraint ${constraint.CONSTRAINT_NAME}: ${error.message}`);
      }
    }

    // 3. Check if there are any orphaned records that would prevent the foreign key
    console.log('\n2. Checking for orphaned records...');
    const [orphaned] = await connection.execute(`
      SELECT ugp.user_id 
      FROM user_game_progress ugp 
      LEFT JOIN users u ON ugp.user_id = u.user_id 
      WHERE u.user_id IS NULL
    `);
    
    if (orphaned.length > 0) {
      console.log('Found orphaned progress records:');
      console.table(orphaned);
      
      // Delete orphaned records
      for (const record of orphaned) {
        await connection.execute('DELETE FROM user_game_progress WHERE user_id = ?', [record.user_id]);
        console.log(`🗑️ Deleted orphaned progress for user: ${record.user_id}`);
      }
    } else {
      console.log('✅ No orphaned records found');
    }

    // 4. Add the foreign key constraint with a unique name
    console.log('\n3. Adding new foreign key constraint...');
    const constraintName = `fk_user_progress_${Date.now()}`;
    
    await connection.execute(`
      ALTER TABLE user_game_progress 
      ADD CONSTRAINT ${constraintName}
      FOREIGN KEY (user_id) REFERENCES users(user_id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log(`✅ Added foreign key constraint: ${constraintName}`);

    // 5. Test the constraint
    console.log('\n4. Testing the constraint...');
    
    // Insert a test user
    await connection.execute(`
      INSERT IGNORE INTO users (
        user_id, username, display_name, email, user_type,
        registration_date, last_active, is_active, total_games_played, total_score, highest_level
      ) VALUES (
        'test_fk_user', 'testuser', 'Test User', 'test@example.com', 'child',
        NOW(), NOW(), true, 0, 0, 0
      )
    `);
    
    // Test progress insertion
    await connection.execute(`
      INSERT INTO user_game_progress (user_id, game_progress, last_updated) 
      VALUES ('test_fk_user', '{"unlockedLevels": 1, "levelStars": {}, "totalStars": 0}', NOW())
      ON DUPLICATE KEY UPDATE 
        game_progress = VALUES(game_progress),
        last_updated = NOW()
    `);
    console.log('✅ Foreign key constraint is working correctly');

    // Clean up test data
    await connection.execute('DELETE FROM user_game_progress WHERE user_id = ?', ['test_fk_user']);
    await connection.execute('DELETE FROM users WHERE user_id = ?', ['test_fk_user']);
    console.log('🧹 Cleaned up test data');

    console.log('\n🎉 Foreign key constraint fixed successfully!');
    console.log('Your application should now work without database constraint errors.');

  } catch (error) {
    console.error('❌ Foreign key fix error:', error.message);
    console.error('Error details:', error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

fixForeignKeyConstraint();
