const mysql = require('mysql2/promise');

async function checkUserStats() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin',
      database: 'landuse_puzzle'
    });

    console.log('🔍 Checking current user stats...\n');

    // Get all users and their current stats
    const [users] = await connection.execute(`
      SELECT 
        user_id, 
        username, 
        display_name, 
        total_games_played, 
        total_score, 
        highest_level,
        last_active 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    if (users.length === 0) {
      console.log('❌ No users found');
    } else {
      console.log(`✅ Found ${users.length} users:`);
      console.table(users.map(user => ({
        username: user.username,
        display_name: user.display_name,
        games_played: user.total_games_played,
        total_score: user.total_score,
        highest_level: user.highest_level,
        last_active: user.last_active?.toISOString()?.substring(0, 19) || 'N/A'
      })));
    }

    // Test manual update
    console.log('\n🧪 Testing manual stats update...');
    const testUserId = users[0]?.user_id;
    
    if (testUserId) {
      console.log(`Updating stats for user: ${testUserId}`);
      
      await connection.execute(`
        UPDATE users SET 
          total_games_played = total_games_played + 1,
          total_score = total_score + 150,
          highest_level = GREATEST(highest_level, 3),
          last_active = NOW()
        WHERE user_id = ?
      `, [testUserId]);
      
      console.log('✅ Manual update completed');
      
      // Check updated stats
      const [updatedUser] = await connection.execute(
        'SELECT total_games_played, total_score, highest_level FROM users WHERE user_id = ?',
        [testUserId]
      );
      
      console.log('Updated stats:', updatedUser[0]);
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUserStats();
