const mysql = require('mysql2/promise');
require('dotenv').config();

async function populateTestUsers() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'landuse_puzzle',
    });

    console.log('Connected successfully!\n');

    // Sample user data
    const testUsers = [
      {
        user_id: 'user_001',
        username: 'EcoExplorer',
        email: 'eco.explorer@example.com',
        total_games_played: 15,
        total_score: 2450,
        highest_level: 5
      },
      {
        user_id: 'user_002', 
        username: 'LandDetective',
        email: 'land.detective@example.com',
        total_games_played: 8,
        total_score: 1200,
        highest_level: 3
      },
      {
        user_id: 'user_003',
        username: 'TerrainMaster',
        email: 'terrain.master@example.com',
        total_games_played: 22,
        total_score: 3500,
        highest_level: 5
      },
      {
        user_id: 'user_004',
        username: 'GeoGamer',
        email: 'geo.gamer@example.com',
        total_games_played: 5,
        total_score: 750,
        highest_level: 2
      },
      {
        user_id: 'user_005',
        username: 'SatelliteScout',
        email: 'satellite.scout@example.com',
        total_games_played: 18,
        total_score: 2800,
        highest_level: 4
      }
    ];

    console.log('Creating test users...\n');

    for (const user of testUsers) {
      try {
        await connection.execute(`
          INSERT INTO users (user_id, username, email, total_games_played, total_score, highest_level, last_active)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [
          user.user_id,
          user.username,
          user.email,
          user.total_games_played,
          user.total_score,
          user.highest_level
        ]);

        console.log(`✓ Created user: ${user.username} (${user.user_id})`);

        // Create some sample game states for each user
        const gameStates = [
          {
            level: user.highest_level,
            score: Math.floor(user.total_score / user.total_games_played),
            completed: true,
            stars: user.highest_level >= 3 ? 3 : 2
          },
          {
            level: Math.max(1, user.highest_level - 1),
            score: Math.floor(user.total_score / user.total_games_played * 0.8),
            completed: true,
            stars: 2
          }
        ];

        for (const gameState of gameStates) {
          await connection.execute(`
            INSERT INTO game_states (user_id, game_state, version)
            VALUES (?, ?, '1.0')
          `, [
            user.user_id,
            JSON.stringify(gameState)
          ]);
        }

        // Create some classification logs for variety
        const classificationTypes = ['forest', 'water', 'urban', 'farmland', 'desert'];
        const correctCount = Math.floor(user.total_games_played * 0.7); // 70% accuracy
        const wrongCount = user.total_games_played - correctCount;

        // Add correct classifications
        for (let i = 0; i < correctCount; i++) {
          const landType = classificationTypes[i % classificationTypes.length];
          await connection.execute(`
            INSERT INTO error_logs (user_id, error, context, level, game_level, error_type, image_name, classification_attempt, correct_classification)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            user.user_id,
            `Image classification success: ${landType}-image-${i}.jpg`,
            `Correctly classified as "${landType}"`,
            'info',
            Math.floor(Math.random() * user.highest_level) + 1,
            'image_classification_success',
            `${landType}-image-${i}.jpg`,
            landType,
            landType
          ]);
        }

        // Add wrong classifications
        for (let i = 0; i < wrongCount; i++) {
          const correctType = classificationTypes[i % classificationTypes.length];
          const wrongType = classificationTypes[(i + 1) % classificationTypes.length];
          await connection.execute(`
            INSERT INTO error_logs (user_id, error, context, level, game_level, error_type, image_name, classification_attempt, correct_classification)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            user.user_id,
            `Image classification failed: ${correctType}-image-${i}.jpg`,
            `User classified as "${wrongType}", correct answer was "${correctType}"`,
            'error',
            Math.floor(Math.random() * user.highest_level) + 1,
            'image_classification',
            `${correctType}-image-${i}.jpg`,
            wrongType,
            correctType
          ]);
        }

      } catch (error) {
        console.error(`❌ Failed to create user ${user.username}:`, error.message);
      }
    }

    // Show summary
    console.log('\n📊 DATABASE SUMMARY:');
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [gameStateCount] = await connection.execute('SELECT COUNT(*) as count FROM game_states');
    const [errorLogCount] = await connection.execute('SELECT COUNT(*) as count FROM error_logs');

    console.log(`👥 Users: ${userCount[0].count}`);
    console.log(`🎮 Game states: ${gameStateCount[0].count}`);
    console.log(`📋 Classification logs: ${errorLogCount[0].count}`);

    console.log('\n🎉 Test data populated successfully!');
    console.log('You can now visit the admin dashboard to see the user data.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

populateTestUsers();
