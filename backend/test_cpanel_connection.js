const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  let connection;
  try {
    console.log('🔗 Testing connection to cPanel MySQL database...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Port: ${process.env.DB_PORT || 3306}\n`);

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      connectTimeout: 20000
    });

    console.log('✅ Connection successful!');

    // Test basic query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Basic query test passed:', result[0]);

    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 Existing tables:');
    if (tables.length === 0) {
      console.log('  No tables found - database is empty');
    } else {
      tables.forEach(table => {
        console.log(`  - ${Object.values(table)[0]}`);
      });
    }

    console.log('\n🎉 Database connection test completed successfully!');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting suggestions:');
      console.log('  1. Check if the database host and port are correct');
      console.log('  2. Verify the database server is running');
      console.log('  3. Check if your IP is allowed to connect');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Troubleshooting suggestions:');
      console.log('  1. Verify username and password are correct');
      console.log('  2. Check user permissions in cPanel');
      console.log('  3. Ensure the user has access to the database');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();
