const mysql = require('mysql2/promise');

async function checkUsers() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin',
      database: 'landuse_puzzle'
    });

    console.log('🔍 Checking users in database...\n');

    // Check users table
    const [users] = await connection.execute('SELECT * FROM users ORDER BY created_at DESC');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.log(`✅ Found ${users.length} users in database:`);
      console.table(users.map(user => ({
        id: user.id,
        user_id: user.user_id,
        username: user.username,
        display_name: user.display_name,
        age: user.age,
        school: user.school,
        created_at: user.created_at,
        total_score: user.total_score
      })));
    }

    // Test the admin endpoint query
    console.log('\n🔍 Testing admin users endpoint query...\n');
    
    const query = `
      SELECT 
        u.id,
        u.user_id,
        u.username,
        u.email,
        u.display_name,
        u.age,
        u.school,
        u.total_games_played,
        u.total_score,
        u.highest_level,
        u.last_active,
        u.registration_date,
        u.is_active,
        COALESCE(gs.avg_score, 0) as average_score,
        COALESCE(gs.actual_games_played, 0) as actual_games_played,
        COALESCE(el.error_count, 0) as total_errors
      FROM users u
      LEFT JOIN (
        SELECT 
          user_id,
          AVG(JSON_EXTRACT(game_state, '$.score')) as avg_score,
          COUNT(*) as actual_games_played
        FROM game_states 
        GROUP BY user_id
      ) gs ON u.user_id = gs.user_id
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(*) as error_count
        FROM error_logs 
        GROUP BY user_id
      ) el ON u.user_id = el.user_id
      ORDER BY u.total_score DESC
      LIMIT 50 OFFSET 0
    `;

    const [adminUsers] = await connection.execute(query);
    
    if (adminUsers.length === 0) {
      console.log('❌ Admin query returned no results');
    } else {
      console.log(`✅ Admin query found ${adminUsers.length} users:`);
      console.table(adminUsers.map(user => ({
        username: user.username,
        display_name: user.display_name,
        total_score: user.total_score,
        actual_games_played: user.actual_games_played,
        total_errors: user.total_errors
      })));
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUsers();
