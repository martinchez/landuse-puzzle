const mysql = require('mysql2/promise');

async function createGameProgressTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin',
      database: 'landuse_puzzle'
    });

    console.log('🔧 Creating user_game_progress table...\n');

    // Create the user_game_progress table
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

    console.log('✅ user_game_progress table created successfully!');

    // Check the table structure
    const [columns] = await connection.execute('DESCRIBE user_game_progress');
    console.log('\n📋 Table structure:');
    console.table(columns);

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createGameProgressTable();
