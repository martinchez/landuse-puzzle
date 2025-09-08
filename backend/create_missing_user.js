const pool = require('./db');

async function createMissingUser() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🔧 Creating missing user from error logs...\n');

    const userId = 'local_1757327531029_wcg70jfc7';
    
    // Check if user exists
    const [existingUser] = await connection.execute('SELECT user_id FROM users WHERE user_id = ?', [userId]);
    
    if (existingUser.length === 0) {
      // Create the missing user
      await connection.execute(`
        INSERT INTO users (
          user_id, username, display_name, email, user_type,
          registration_date, last_active, is_active, 
          total_games_played, total_score, highest_level
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), true, 0, 0, 0)
      `, [userId, 'Local User', 'Local User', `${userId}@local.temp`, 'child']);
      
      console.log(`✅ Created user: ${userId}`);
    } else {
      console.log(`ℹ️ User ${userId} already exists`);
    }

    // Test saving progress for this user
    console.log('\n🧪 Testing progress save for this user...');
    await connection.execute(`
      INSERT INTO user_game_progress (user_id, game_progress, last_updated) 
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        game_progress = VALUES(game_progress),
        last_updated = NOW()
    `, [userId, '{"unlockedLevels": 1, "levelStars": {}, "totalStars": 0}']);
    
    console.log('✅ Progress save test successful');

    // Also check for any other users that might be missing
    console.log('\n🔍 Checking for other potential missing users...');
    
    // Look for any user IDs mentioned in error_logs that don't exist in users
    const [missingUsers] = await connection.execute(`
      SELECT DISTINCT el.user_id 
      FROM error_logs el 
      LEFT JOIN users u ON el.user_id = u.user_id 
      WHERE u.user_id IS NULL 
        AND el.user_id IS NOT NULL 
        AND el.user_id != ''
    `);
    
    for (const userRecord of missingUsers) {
      const missingUserId = userRecord.user_id;
      await connection.execute(`
        INSERT IGNORE INTO users (
          user_id, username, display_name, email, user_type,
          registration_date, last_active, is_active, 
          total_games_played, total_score, highest_level
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), true, 0, 0, 0)
      `, [missingUserId, 'Auto User', 'Auto User', `${missingUserId}@auto.temp`, 'child']);
      
      console.log(`✅ Created missing user from logs: ${missingUserId}`);
    }

    console.log('\n🎉 All missing users have been created!');
    console.log('Your application should now work without user-related errors.');

  } catch (error) {
    console.error('❌ Error creating missing user:', error.message);
    console.error('Error details:', error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

createMissingUser();
