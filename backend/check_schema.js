const mysql = require('mysql2/promise');

async function checkSchema() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin',
      database: 'landuse_puzzle'
    });

    console.log('🔍 Checking database schema...\n');

    // Check if database exists
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('Available databases:', databases.map(db => db.Database));

    // Check tables in the database
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\nTables in landuse_puzzle:', tables);

    if (tables.length > 0) {
      // Check users table structure
      const [columns] = await connection.execute('DESCRIBE users');
      console.log('\nUsers table structure:');
      console.table(columns);

      // Check current data
      const [users] = await connection.execute('SELECT * FROM users LIMIT 10');
      console.log('\nCurrent users data:');
      console.table(users);
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkSchema();
