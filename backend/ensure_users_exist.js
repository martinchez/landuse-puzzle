const pool = require('./db');

async function ensureUsersExist() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🔧 Ensuring all users exist for progress data...\n');

    // 1. Find user IDs that have progress but don't exist in users table
    const [orphanedProgress] = await connection.execute(`
      SELECT DISTINCT ugp.user_id 
      FROM user_game_progress ugp 
      LEFT JOIN users u ON ugp.user_id = u.user_id 
      WHERE u.user_id IS NULL
    `);

    if (orphanedProgress.length > 0) {
      console.log('Found progress records without corresponding users:');
      console.table(orphanedProgress);

      // Create missing users
      for (const record of orphanedProgress) {
        const userId = record.user_id;
        const username = userId.includes('child_') ? 'Anonymous Child' : 'Anonymous User';
        const userType = userId.includes('child_') ? 'child' : 'user';
        
        await connection.execute(`
          INSERT IGNORE INTO users (
            user_id, username, display_name, email, user_type,
            registration_date, last_active, is_active, 
            total_games_played, total_score, highest_level
          ) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), true, 0, 0, 0)
        `, [userId, username, username, `${userId}@temp.local`, userType]);
        
        console.log(`✅ Created user: ${userId}`);
      }
    } else {
      console.log('✅ No orphaned progress records found');
    }

    // 2. Check and clean up any remaining foreign key issues
    console.log('\n2. Verifying foreign key relationships...');
    
    const [progressCount] = await connection.execute('SELECT COUNT(*) as count FROM user_game_progress');
    const [usersCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    console.log(`Users: ${usersCount[0].count}`);
    console.log(`Progress records: ${progressCount[0].count}`);

    // 3. Test inserting a new progress record
    console.log('\n3. Testing progress insertion...');
    
    const testUserId = `test_user_${Date.now()}`;
    
    // Insert test user first
    await connection.execute(`
      INSERT INTO users (
        user_id, username, display_name, email, user_type,
        registration_date, last_active, is_active, 
        total_games_played, total_score, highest_level
      ) VALUES (?, 'Test User', 'Test User', 'test@example.com', 'child', NOW(), NOW(), true, 0, 0, 0)
    `, [testUserId]);
    
    // Then insert progress
    await connection.execute(`
      INSERT INTO user_game_progress (user_id, game_progress, last_updated) 
      VALUES (?, '{"unlockedLevels": 1, "levelStars": {}, "totalStars": 0}', NOW())
      ON DUPLICATE KEY UPDATE 
        game_progress = VALUES(game_progress),
        last_updated = NOW()
    `, [testUserId]);
    
    console.log('✅ Progress insertion test successful');
    
    // Clean up test data
    await connection.execute('DELETE FROM user_game_progress WHERE user_id = ?', [testUserId]);
    await connection.execute('DELETE FROM users WHERE user_id = ?', [testUserId]);
    console.log('🧹 Cleaned up test data');

    console.log('\n🎉 User/Progress relationship verified!');
    console.log('Your application should now work without foreign key errors.');

  } catch (error) {
    console.error('❌ Error ensuring users exist:', error.message);
    console.error('Error details:', error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

ensureUsersExist();
