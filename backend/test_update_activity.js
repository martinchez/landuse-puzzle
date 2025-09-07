const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'landuse_puzzle'
};

async function testUpdateActivity() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Test the update activity query with proper date formatting
    const userId = 'child_1757248884615_wyy38tgjy';
    const lastActive = new Date().toISOString().slice(0, 19).replace('T', ' '); // MySQL format
    
    console.log('Testing update with:', { userId, lastActive });
    
    const result = await connection.query(
      'UPDATE users SET last_active = ? WHERE user_id = ?',
      [lastActive, userId]
    );
    
    console.log('Update result:', result);
    console.log('Rows affected:', result[0].affectedRows);
    
    // Check if the user exists
    const [rows] = await connection.query(
      'SELECT user_id, last_active FROM users WHERE user_id = ?',
      [userId]
    );
    
    console.log('User found:', rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testUpdateActivity();
