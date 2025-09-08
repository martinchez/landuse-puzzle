const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupCPanelDatabase() {
  let connection;
  try {
    console.log('🔗 Connecting to cPanel MySQL database...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Port: ${process.env.PORT || 3306}`);

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.PORT || 3306,
      connectTimeout: 20000,
      acquireTimeout: 20000,
      timeout: 20000
    });

    console.log('✅ Connected successfully to cPanel MySQL database!\n');

    // Create users table
    console.log('🔧 Creating users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255),
        email VARCHAR(255),
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_games_played INT DEFAULT 0,
        total_score INT DEFAULT 0,
        highest_level INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);
    console.log('✅ Users table created successfully!');

    // Create game_states table
    console.log('🔧 Creating game_states table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS game_states (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        game_state TEXT NOT NULL,
        version VARCHAR(50) DEFAULT '1.0',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Game_states table created successfully!');

    // Create error_logs table
    console.log('🔧 Creating error_logs table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        error TEXT NOT NULL,
        context TEXT,
        level VARCHAR(20) DEFAULT 'error',
        game_level INT,
        resolved BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        image_name VARCHAR(255),
        classification_attempt VARCHAR(255),
        correct_classification VARCHAR(255),
        error_type VARCHAR(50)
      )
    `);
    console.log('✅ Error_logs table created successfully!');

    // Create user_game_progress table
    console.log('🔧 Creating user_game_progress table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_game_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        game_progress JSON NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_progress (user_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log('✅ User_game_progress table created successfully!');

    // Create view for image classification failures
    console.log('🔧 Creating image_classification_failures view...');
    await connection.execute(`
      CREATE OR REPLACE VIEW image_classification_failures AS
      SELECT 
          image_name,
          classification_attempt,
          correct_classification,
          COUNT(*) as failure_count,
          COUNT(DISTINCT user_id) as users_affected,
          MAX(timestamp) as last_failure
      FROM error_logs 
      WHERE error_type = 'image_classification' 
          AND image_name IS NOT NULL
      GROUP BY image_name, classification_attempt, correct_classification
      ORDER BY failure_count DESC
    `);
    console.log('✅ Image_classification_failures view created successfully!');

    // Check all tables were created
    console.log('\n📋 Checking created tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables in database:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Insert sample data (optional)
    console.log('\n🔧 Inserting sample data...');
    
    // Insert sample users
    await connection.execute(`
      INSERT IGNORE INTO users (user_id, username, total_games_played, total_score, highest_level) VALUES
      ('test_user1', 'TestUser1', 10, 1500, 5),
      ('test_user2', 'TestUser2', 5, 800, 3),
      ('test_user3', 'TestUser3', 15, 2200, 7)
    `);

    // Insert sample error logs
    await connection.execute(`
      INSERT INTO error_logs (user_id, error, context, level, game_level) VALUES
      ('test_user1', 'Network connection failed', 'Loading level 3', 'error', 3),
      ('test_user2', 'Invalid tile placement', 'Game board validation', 'warning', 2),
      ('test_user1', 'Score calculation error', 'End of level 5', 'error', 5)
    `);

    // Insert sample game states
    await connection.execute(`
      INSERT INTO game_states (user_id, game_state, version) VALUES
      ('test_user1', '{"level": 3, "score": 1200, "tiles": []}', '1.0'),
      ('test_user2', '{"level": 2, "score": 800, "tiles": []}', '1.0')
    `);

    console.log('✅ Sample data inserted successfully!');

    // Verify data
    console.log('\n📊 Verifying data...');
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [gameStateCount] = await connection.execute('SELECT COUNT(*) as count FROM game_states');
    const [errorCount] = await connection.execute('SELECT COUNT(*) as count FROM error_logs');
    
    console.log(`Users: ${userCount[0].count}`);
    console.log(`Game States: ${gameStateCount[0].count}`);
    console.log(`Error Logs: ${errorCount[0].count}`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('Your landuse-puzzle application is ready to use the new cPanel MySQL database.');

  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    console.error('Error details:', error);
    
    // Provide helpful debugging information
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused. Please check:');
      console.log('  1. Database host and port are correct');
      console.log('  2. Database server is running');
      console.log('  3. Firewall allows connections to the database');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Access denied. Please check:');
      console.log('  1. Username and password are correct');
      console.log('  2. User has sufficient privileges');
      console.log('  3. Host permissions allow connections from your IP');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Database does not exist. Please check:');
      console.log('  1. Database name is correct');
      console.log('  2. Database has been created in cPanel');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupCPanelDatabase();
