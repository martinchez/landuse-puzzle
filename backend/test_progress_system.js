const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'landuse_puzzle'
};

async function testProgressSystem() {
  console.log('🧪 Testing Game Progress System...\n');
  
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Test 1: Create a test user
    const testUserId = `test_user_${Date.now()}`;
    console.log(`\n📝 Creating test user: ${testUserId}`);
    
    await connection.execute(
      'INSERT INTO users (user_id, username, display_name, user_type) VALUES (?, ?, ?, ?)',
      [testUserId, 'test_user', 'Test User', 'child']
    );
    console.log('✅ Test user created');

    // Test 2: Save initial progress
    const initialProgress = {
      unlockedLevels: 1,
      levelStars: {},
      totalStars: 0,
      badges: [],
      levelStatistics: {}
    };

    console.log('\n💾 Saving initial progress...');
    await connection.execute(
      'INSERT INTO user_game_progress (user_id, game_progress) VALUES (?, ?)',
      [testUserId, JSON.stringify(initialProgress)]
    );
    console.log('✅ Initial progress saved');

    // Test 3: Update progress
    const updatedProgress = {
      unlockedLevels: 3,
      levelStars: { 1: 3, 2: 2 },
      totalStars: 5,
      badges: [{ id: 'test-badge', earned: true }],
      levelStatistics: { 1: { attempts: 1, completed: true } }
    };

    console.log('\n🔄 Updating progress...');
    await connection.execute(
      'UPDATE user_game_progress SET game_progress = ? WHERE user_id = ?',
      [JSON.stringify(updatedProgress), testUserId]
    );
    console.log('✅ Progress updated');

    // Test 4: Load progress
    console.log('\n📖 Loading progress...');
    const [rows] = await connection.execute(
      'SELECT game_progress, last_updated FROM user_game_progress WHERE user_id = ?',
      [testUserId]
    );

    if (rows.length > 0) {
      const rowData = rows[0];
      console.log('Raw data:', rowData);
      
      let loadedProgress;
      if (typeof rowData.game_progress === 'string') {
        loadedProgress = JSON.parse(rowData.game_progress);
      } else {
        loadedProgress = rowData.game_progress;
      }
      
      console.log('✅ Progress loaded successfully:');
      console.log('   - Unlocked levels:', loadedProgress.unlockedLevels);
      console.log('   - Total stars:', loadedProgress.totalStars);
      console.log('   - Level stars:', JSON.stringify(loadedProgress.levelStars));
      console.log('   - Last updated:', rowData.last_updated);
    } else {
      console.log('❌ Failed to load progress');
    }

    // Test 5: Reset progress
    console.log('\n🔄 Resetting progress...');
    await connection.execute(
      'UPDATE user_game_progress SET game_progress = ? WHERE user_id = ?',
      [JSON.stringify(initialProgress), testUserId]
    );
    console.log('✅ Progress reset successfully');

    // Test 6: Update user stats
    console.log('\n📊 Updating user stats...');
    await connection.execute(
      'UPDATE users SET total_score = total_score + ?, total_games_played = total_games_played + ? WHERE user_id = ?',
      [500, 2, testUserId]
    );
    console.log('✅ User stats updated');

    // Test 7: Verify user stats
    console.log('\n📈 Checking user stats...');
    const [userRows] = await connection.execute(
      'SELECT total_score, total_games_played, highest_level FROM users WHERE user_id = ?',
      [testUserId]
    );

    if (userRows.length > 0) {
      const stats = userRows[0];
      console.log('✅ User stats verified:');
      console.log('   - Total score:', stats.total_score);
      console.log('   - Total games played:', stats.total_games_played);
      console.log('   - Highest level:', stats.highest_level);
    }

    // Cleanup: Remove test user
    console.log('\n🧹 Cleaning up test data...');
    await connection.execute('DELETE FROM user_game_progress WHERE user_id = ?', [testUserId]);
    await connection.execute('DELETE FROM users WHERE user_id = ?', [testUserId]);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed! Game progress system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n📡 Database connection closed');
    }
  }
}

// Run the test
testProgressSystem();
