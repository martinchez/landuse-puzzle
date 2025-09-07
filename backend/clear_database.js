const mysql = require('mysql2/promise');
require('dotenv').config();

async function clearDatabase() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    
    // Create connection to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'landuse_puzzle',
    });

    console.log('Connected to database successfully!');

    // Disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Disabled foreign key checks');

    // Get current row counts before deletion
    console.log('\n--- BEFORE DELETION ---');
    const [gameStatesCount] = await connection.execute('SELECT COUNT(*) as count FROM game_states');
    const [errorLogsCount] = await connection.execute('SELECT COUNT(*) as count FROM error_logs');
    const [usersCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    console.log(`game_states: ${gameStatesCount[0].count} rows`);
    console.log(`error_logs: ${errorLogsCount[0].count} rows`);
    console.log(`users: ${usersCount[0].count} rows`);

    // Delete all data from tables
    console.log('\n--- DELETING DATA ---');
    
    await connection.execute('DELETE FROM game_states');
    console.log('✓ Cleared game_states table');
    
    await connection.execute('DELETE FROM error_logs');
    console.log('✓ Cleared error_logs table');
    
    await connection.execute('DELETE FROM users');
    console.log('✓ Cleared users table');

    // Reset auto-increment counters
    await connection.execute('ALTER TABLE game_states AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE error_logs AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE users AUTO_INCREMENT = 1');
    console.log('✓ Reset auto-increment counters');

    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Re-enabled foreign key checks');

    // Verify all tables are empty
    console.log('\n--- AFTER DELETION ---');
    const [gameStatesCountAfter] = await connection.execute('SELECT COUNT(*) as count FROM game_states');
    const [errorLogsCountAfter] = await connection.execute('SELECT COUNT(*) as count FROM error_logs');
    const [usersCountAfter] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    console.log(`game_states: ${gameStatesCountAfter[0].count} rows`);
    console.log(`error_logs: ${errorLogsCountAfter[0].count} rows`);
    console.log(`users: ${usersCountAfter[0].count} rows`);

    console.log('\n🎉 All database data has been successfully cleared!');

  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure your MySQL server is running and the connection details in .env are correct.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Check your database credentials in the .env file.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 The database "landuse_puzzle" does not exist. Run setup.sql first.');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run the script
clearDatabase();
