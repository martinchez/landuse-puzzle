const mysql = require('mysql2/promise');
require('dotenv').config();

async function viewClassificationLogs() {
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

    // Get all classification logs
    const [rows] = await connection.execute(`
      SELECT 
        id,
        user_id,
        error_type,
        image_name,
        classification_attempt,
        correct_classification,
        game_level,
        context,
        timestamp
      FROM error_logs 
      WHERE error_type IN ('image_classification', 'image_classification_success')
      ORDER BY timestamp DESC
    `);

    console.log('=== CLASSIFICATION LOGS ===\n');
    
    if (rows.length === 0) {
      console.log('No classification logs found yet.');
      console.log('Play the game and make some classifications to see logs here!\n');
    } else {
      console.log(`Found ${rows.length} classification logs:\n`);
      
      let correctCount = 0;
      let incorrectCount = 0;
      
      rows.forEach((row, index) => {
        const isCorrect = row.error_type === 'image_classification_success';
        const status = isCorrect ? '✅ CORRECT' : '❌ WRONG';
        
        if (isCorrect) correctCount++;
        else incorrectCount++;
        
        console.log(`${index + 1}. ${status}`);
        console.log(`   User: ${row.user_id}`);
        console.log(`   Image: ${row.image_name || 'N/A'}`);
        console.log(`   User said: ${row.classification_attempt}`);
        console.log(`   Correct answer: ${row.correct_classification}`);
        console.log(`   Level: ${row.game_level || 'N/A'}`);
        console.log(`   Time: ${row.timestamp}`);
        console.log(`   Context: ${row.context || 'N/A'}`);
        console.log('');
      });
      
      console.log(`📊 SUMMARY:`);
      console.log(`   ✅ Correct classifications: ${correctCount}`);
      console.log(`   ❌ Incorrect classifications: ${incorrectCount}`);
      console.log(`   📈 Accuracy: ${((correctCount / (correctCount + incorrectCount)) * 100).toFixed(1)}%`);
    }

    // Show misclassification patterns
    console.log('\n=== MISCLASSIFICATION PATTERNS ===\n');
    const [patterns] = await connection.execute(`
      SELECT 
        classification_attempt as user_said,
        correct_classification as should_be,
        COUNT(*) as frequency,
        COUNT(DISTINCT user_id) as users_affected
      FROM error_logs 
      WHERE error_type = 'image_classification'
        AND classification_attempt IS NOT NULL 
        AND correct_classification IS NOT NULL
      GROUP BY classification_attempt, correct_classification
      ORDER BY frequency DESC
    `);

    if (patterns.length > 0) {
      console.log('Most common misclassifications:');
      patterns.forEach((pattern, index) => {
        console.log(`${index + 1}. Users said "${pattern.user_said}" but it was "${pattern.should_be}" (${pattern.frequency} times, ${pattern.users_affected} users)`);
      });
    } else {
      console.log('No misclassification patterns found yet.');
    }

    // Show problem images
    console.log('\n=== PROBLEM IMAGES ===\n');
    const [problemImages] = await connection.execute(`
      SELECT 
        image_name,
        correct_classification,
        COUNT(*) as mistake_count,
        COUNT(DISTINCT user_id) as users_affected,
        GROUP_CONCAT(DISTINCT classification_attempt) as common_mistakes
      FROM error_logs 
      WHERE error_type = 'image_classification'
        AND image_name IS NOT NULL
      GROUP BY image_name, correct_classification
      HAVING mistake_count > 1
      ORDER BY mistake_count DESC
    `);

    if (problemImages.length > 0) {
      console.log('Images that users struggle with most:');
      problemImages.forEach((img, index) => {
        console.log(`${index + 1}. ${img.image_name} (should be "${img.correct_classification}")`);
        console.log(`   ${img.mistake_count} mistakes by ${img.users_affected} users`);
        console.log(`   Common wrong answers: ${img.common_mistakes}`);
        console.log('');
      });
    } else {
      console.log('No problematic images identified yet (need more than 1 mistake per image).');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Auto-refresh option
const args = process.argv.slice(2);
if (args.includes('--watch')) {
  console.log('👀 Watching for new classifications... (Press Ctrl+C to stop)\n');
  
  const refresh = () => {
    console.clear();
    console.log('🔄 Refreshing classification logs...\n');
    viewClassificationLogs().then(() => {
      setTimeout(refresh, 5000); // Refresh every 5 seconds
    });
  };
  
  refresh();
} else {
  viewClassificationLogs();
}
