const pool = require('./db');

async function testDatabasePool() {
  try {
    console.log('🔗 Testing database connection pool...');
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Connection pool working!');
    
    // Test users table
    const [users] = await connection.execute('SELECT * FROM users LIMIT 3');
    console.log('\n👥 Users in database:');
    console.table(users);
    
    // Test game_states table
    const [gameStates] = await connection.execute('SELECT * FROM game_states LIMIT 3');
    console.log('\n🎮 Game states in database:');
    console.table(gameStates);
    
    // Test error_logs table
    const [errorLogs] = await connection.execute('SELECT * FROM error_logs LIMIT 3');
    console.log('\n🚨 Error logs in database:');
    console.table(errorLogs);
    
    // Release connection back to pool
    connection.release();
    
    console.log('\n🎉 Database pool test completed successfully!');
    console.log('Your application can now use the cPanel MySQL database.');
    
  } catch (error) {
    console.error('❌ Database pool test failed:', error.message);
  } finally {
    // Close the pool
    await pool.end();
  }
}

testDatabasePool();
