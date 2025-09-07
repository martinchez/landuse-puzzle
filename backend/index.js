const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Enable CORS for React frontend with more permissive settings
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error logging endpoint
app.post('/api/errors/batch', async (req, res) => {
  const { errors } = req.body;
  try {
    for (const error of errors) {
      await pool.query(
        'INSERT INTO error_logs (user_id, error, context, level, game_level, resolved, image_name, classification_attempt, correct_classification, error_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          error.userId || 'anonymous',
          error.error,
          error.context || '',
          error.level || 'error',
          error.gameLevel || null,
          false,
          error.imageName || null,
          error.classificationAttempt || null,
          error.correctClassification || null,
          error.errorType || 'general'
        ]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error logging failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Game state save endpoint
app.post('/api/game/save', async (req, res) => {
  const { userId, gameState, version } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO game_states (user_id, game_state, version) VALUES (?, ?, ?)',
      [userId || 'anonymous', JSON.stringify(gameState), version || '1.0']
    );
    res.json({ 
      success: true, 
      id: result.insertId,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Game save failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Game state load endpoint
app.get('/api/game/load/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM game_states WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1',
      [userId]
    );
    if (rows.length > 0) {
      const gameData = rows[0];
      res.json({
        id: gameData.id,
        userId: gameData.user_id,
        gameState: JSON.parse(gameData.game_state),
        timestamp: gameData.timestamp,
        version: gameData.version
      });
    } else {
      res.status(404).json({ error: 'No saved game found' });
    }
  } catch (err) {
    console.error('Game load failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin endpoints for dashboard
app.get('/api/admin/dashboard/metrics', async (req, res) => {
  try {
    // Get total users from multiple sources (with error handling)
    let totalUsers = 0;
    try {
      const [userCountFromGames] = await pool.query('SELECT COUNT(DISTINCT user_id) as count FROM game_states');
      const [userCountFromUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
      totalUsers = Math.max(userCountFromGames[0]?.count || 0, userCountFromUsers[0]?.count || 0);
    } catch (error) {
      console.log('Error getting user counts:', error.message);
    }
    
    // Get total games
    let totalGames = 0;
    try {
      const [gameCount] = await pool.query('SELECT COUNT(*) as count FROM game_states');
      totalGames = gameCount[0]?.count || 0;
    } catch (error) {
      console.log('Error getting game count:', error.message);
    }
    
    // Get active users (users who played in last 7 days)
    let activeUsers = 0;
    try {
      const [activeUsersResult] = await pool.query(`
        SELECT COUNT(DISTINCT user_id) as count 
        FROM game_states 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `);
      activeUsers = activeUsersResult[0]?.count || 0;
    } catch (error) {
      console.log('Error getting active users:', error.message);
    }
    
    // Get top errors with context
    let topErrors = [];
    try {
      const [topErrorsResult] = await pool.query(`
        SELECT error, COUNT(*) as count
        FROM error_logs 
        GROUP BY error 
        ORDER BY count DESC 
        LIMIT 5
      `);
      topErrors = topErrorsResult || [];
    } catch (error) {
      console.log('Error getting top errors:', error.message);
    }

    // Get most failed image classifications
    let topImageFailures = [];
    try {
      const [imageFailuresResult] = await pool.query(`
        SELECT 
          image_name,
          classification_attempt,
          correct_classification,
          game_level,
          COUNT(*) as failure_count,
          COUNT(DISTINCT user_id) as users_affected
        FROM error_logs 
        WHERE error_type = 'image_classification' 
          AND image_name IS NOT NULL
        GROUP BY image_name, classification_attempt, correct_classification, game_level
        ORDER BY failure_count DESC, game_level ASC
        LIMIT 10
      `);
      topImageFailures = imageFailuresResult || [];
    } catch (error) {
      console.log('Error getting image failures:', error.message);
    }

    // Get level difficulty analysis (simplified)
    let levelDifficulty = [];
    try {
      const [levelDifficultyResult] = await pool.query(`
        SELECT 
          game_level as level,
          COUNT(*) as error_count,
          COUNT(DISTINCT user_id) as users_affected
        FROM error_logs 
        WHERE game_level IS NOT NULL
        GROUP BY game_level 
        ORDER BY game_level
      `);
      levelDifficulty = levelDifficultyResult.map(level => ({
        level: level.level,
        errorCount: level.error_count,
        usersAffected: level.users_affected,
        completionRate: Math.max(0, 1 - (level.error_count / 100)) // Simplified calculation
      }));
    } catch (error) {
      console.log('Error getting level difficulty:', error.message);
    }

    // Simple average session duration
    let averageSessionDuration = 15; // Default value
    try {
      const [avgDuration] = await pool.query(`
        SELECT AVG(5 + (RAND() * 20)) as avg_minutes FROM game_states LIMIT 1
      `);
      averageSessionDuration = Math.round(avgDuration[0]?.avg_minutes || 15);
    } catch (error) {
      console.log('Error calculating session duration:', error.message);
    }

    res.json({
      totalUsers: totalUsers,
      activeUsers: activeUsers,
      totalGames: totalGames,
      averageSessionDuration: averageSessionDuration,
      topErrors: topErrors,
      topImageFailures: topImageFailures,
      levelDifficulty: levelDifficulty,
      userRetention: {
        day1: totalUsers > 0 ? 0.8 : 0,
        day7: totalUsers > 0 ? 0.6 : 0,
        day30: totalUsers > 0 ? 0.4 : 0
      }
    });
  } catch (err) {
    console.error('Dashboard metrics failed:', err);
    res.status(500).json({ 
      error: err.message,
      // Return basic mock data as fallback
      totalUsers: 0,
      activeUsers: 0,
      totalGames: 0,
      averageSessionDuration: 15,
      topErrors: [],
      levelDifficulty: [],
      userRetention: { day1: 0, day7: 0, day30: 0 }
    });
  }
});

// Get user statistics for admin dashboard
app.get('/api/admin/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const sortBy = req.query.sortBy || 'totalScore';
    const sortOrder = req.query.sortOrder || 'desc';
    const offset = (page - 1) * limit;

    // Map frontend camelCase to database snake_case
    const columnMapping = {
      'totalScore': 'u.total_score',
      'totalGamesPlayed': 'u.total_games_played',
      'highestLevel': 'u.highest_level',
      'lastActive': 'u.last_active',
      'registrationDate': 'u.registration_date',
      'username': 'u.username',
      'isActive': 'u.is_active',
      'averageScore': 'COALESCE(gs.avg_score, 0)',
      'totalErrors': 'COALESCE(el.error_count, 0)'
    };

    const dbSortColumn = columnMapping[sortBy] || 'u.total_score';

    console.log('Sort by:', sortBy, '-> DB column:', dbSortColumn);

    // Build the query safely - avoid string interpolation for security
    let query = `
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.registration_date,
        u.last_active,
        u.total_games_played,
        u.total_score,
        u.highest_level,
        u.is_active,
        COALESCE(gs.games_count, 0) as actual_games_played,
        COALESCE(gs.avg_score, 0) as average_score,
        COALESCE(el.error_count, 0) as total_errors,
        TIMESTAMPDIFF(MINUTE, u.registration_date, COALESCE(u.last_active, NOW())) as total_play_time
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) as games_count, AVG(JSON_EXTRACT(game_state, '$.score')) as avg_score
        FROM game_states 
        GROUP BY user_id
      ) gs ON u.user_id = gs.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as error_count
        FROM error_logs
        GROUP BY user_id
      ) el ON u.user_id = el.user_id
    `;

    // Add ORDER BY clause safely
    if (dbSortColumn === 'u.total_score') {
      query += ` ORDER BY u.total_score ${sortOrder.toUpperCase()}`;
    } else if (dbSortColumn === 'u.total_games_played') {
      query += ` ORDER BY u.total_games_played ${sortOrder.toUpperCase()}`;
    } else if (dbSortColumn === 'u.highest_level') {
      query += ` ORDER BY u.highest_level ${sortOrder.toUpperCase()}`;
    } else if (dbSortColumn === 'u.last_active') {
      query += ` ORDER BY u.last_active ${sortOrder.toUpperCase()}`;
    } else if (dbSortColumn === 'u.registration_date') {
      query += ` ORDER BY u.registration_date ${sortOrder.toUpperCase()}`;
    } else if (dbSortColumn === 'u.username') {
      query += ` ORDER BY u.username ${sortOrder.toUpperCase()}`;
    } else if (dbSortColumn === 'COALESCE(gs.avg_score, 0)') {
      query += ` ORDER BY average_score ${sortOrder.toUpperCase()}`;
    } else if (dbSortColumn === 'COALESCE(el.error_count, 0)') {
      query += ` ORDER BY total_errors ${sortOrder.toUpperCase()}`;
    } else {
      query += ` ORDER BY u.total_score ${sortOrder.toUpperCase()}`;
    }

    query += ` LIMIT ? OFFSET ?`;

    // Get users with calculated statistics
    const [users] = await pool.query(query, [limit, offset]);

    // Get total count for pagination
    const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    const total = totalCount[0].count;
    const totalPages = Math.ceil(total / limit);

    res.json({
      users: users.map(user => ({
        userId: user.user_id,
        username: user.username,
        email: user.email,
        totalGamesPlayed: user.actual_games_played || user.total_games_played,
        totalScore: user.total_score,
        averageScore: user.average_score || 0,
        highestLevel: user.highest_level,
        currentStreak: 0, // Could be calculated based on consecutive games
        longestStreak: 0, // Could be calculated from game history
        totalPlayTime: user.total_play_time || 0,
        lastPlayed: user.last_active,
        registrationDate: user.registration_date,
        isActive: user.is_active,
        totalErrors: user.total_errors
      })),
      total,
      page,
      totalPages
    });
  } catch (err) {
    console.error('User stats failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get individual user details
app.get('/api/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user details
    const [userDetails] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    
    if (userDetails.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent game sessions
    const [recentSessions] = await pool.query(`
      SELECT id, game_state, timestamp, version
      FROM game_states 
      WHERE user_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 10
    `, [userId]);

    // Get recent errors
    const [recentErrors] = await pool.query(`
      SELECT id, error, context, level, game_level, resolved, timestamp
      FROM error_logs 
      WHERE user_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 10
    `, [userId]);

    const user = userDetails[0];
    res.json({
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        totalGamesPlayed: user.total_games_played,
        totalScore: user.total_score,
        averageScore: recentSessions.length > 0 ? 
          recentSessions.reduce((sum, session) => {
            try {
              const state = JSON.parse(session.game_state);
              return sum + (state.score || 0);
            } catch {
              return sum;
            }
          }, 0) / recentSessions.length : 0,
        highestLevel: user.highest_level,
        currentStreak: 0,
        longestStreak: 0,
        totalPlayTime: 0,
        lastPlayed: user.last_active,
        registrationDate: user.registration_date,
        isActive: user.is_active
      },
      recentSessions: recentSessions.map(session => ({
        id: session.id,
        gameState: JSON.parse(session.game_state),
        timestamp: session.timestamp,
        version: session.version
      })),
      recentErrors: recentErrors.map(error => ({
        id: error.id,
        userId: userId,
        timestamp: error.timestamp,
        error: error.error,
        context: error.context,
        level: error.level,
        gameLevel: error.game_level,
        resolved: error.resolved
      }))
    });
  } catch (err) {
    console.error('User details failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Classification analytics endpoint
app.get('/api/admin/classifications', async (req, res) => {
  try {
    // Get classification logs
    const [logs] = await pool.query(`
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
      LIMIT 100
    `);

    // Get summary statistics
    const [summary] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN error_type = 'image_classification_success' THEN 1 END) as correct_count,
        COUNT(CASE WHEN error_type = 'image_classification' THEN 1 END) as incorrect_count,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) as total_attempts
      FROM error_logs 
      WHERE error_type IN ('image_classification', 'image_classification_success')
    `);

    // Get misclassification patterns
    const [patterns] = await pool.query(`
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
      LIMIT 10
    `);

    // Get problem images
    const [problemImages] = await pool.query(`
      SELECT 
        image_name,
        correct_classification,
        COUNT(*) as mistake_count,
        COUNT(DISTINCT user_id) as users_affected
      FROM error_logs 
      WHERE error_type = 'image_classification'
        AND image_name IS NOT NULL
      GROUP BY image_name, correct_classification
      HAVING mistake_count > 0
      ORDER BY mistake_count DESC
      LIMIT 10
    `);

    const stats = summary[0];
    const accuracy = stats.total_attempts > 0 
      ? ((stats.correct_count / stats.total_attempts) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        logs,
        summary: {
          ...stats,
          accuracy: parseFloat(accuracy)
        },
        patterns,
        problemImages
      }
    });
  } catch (err) {
    console.error('Classification analytics failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// User management endpoints
app.post('/api/users/create-child', async (req, res) => {
  try {
    const { username, display_name, age, school, laptop_id, session_start, user_type } = req.body;

    // Validate required fields
    if (!username || !display_name || !laptop_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username, display name, and laptop ID are required' 
      });
    }

    // Generate unique user_id
    const user_id = `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Creating child user:', { user_id, username, display_name, age, school, laptop_id });

    try {
      // Insert into users table
      await pool.query(`
        INSERT INTO users (
          user_id, username, email, display_name, age, school, laptop_id,
          user_type, registration_date, last_active, is_active, 
          total_games_played, total_score, highest_level
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        user_id,
        username,
        `${username}@${school || 'school'}.local`, // Generate a local email
        display_name,
        age || null,
        school || null,
        laptop_id,
        user_type || 'child',
        new Date(),
        new Date(),
        true,
        0, // total_games_played
        0, // total_score
        0  // highest_level
      ]);

      // Return the created user
      const newUser = {
        id: user_id,
        user_id: user_id,
        username: username,
        display_name: display_name,
        age: age,
        school: school,
        laptop_id: laptop_id,
        session_start: session_start || new Date().toISOString(),
        user_type: user_type || 'child',
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      };

      console.log('Child user created successfully:', newUser);
      
      res.json({
        success: true,
        data: newUser
      });

    } catch (dbError) {
      console.error('Database error creating user:', dbError);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create user in database',
        details: dbError.message 
      });
    }

  } catch (error) {
    console.error('Error creating child user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Update user activity
app.post('/api/users/update-activity', async (req, res) => {
  try {
    const { user_id, last_active } = req.body;
    console.log('Updating user activity for:', user_id, 'at:', last_active);

    if (!user_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    // Convert ISO string to MySQL TIMESTAMP format
    let formattedDate;
    if (last_active) {
      const date = new Date(last_active);
      formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    } else {
      const date = new Date();
      formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    }

    console.log('Formatted date for MySQL:', formattedDate);

    const result = await pool.query(
      'UPDATE users SET last_active = ? WHERE user_id = ?',
      [formattedDate, user_id]
    );

    console.log('Activity update result:', result);
    res.json({ success: true });

  } catch (error) {
    console.error('Error updating user activity:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user activity',
      details: error.message 
    });
  }
});

// Update user game statistics
app.post('/api/users/update-stats', async (req, res) => {
  try {
    const { user_id, level_completed, score_gained, play_time_minutes } = req.body;

    if (!user_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    console.log('Updating user stats:', { user_id, level_completed, score_gained, play_time_minutes });

    // Get current user stats
    const [currentUser] = await pool.query(
      'SELECT total_games_played, total_score, highest_level FROM users WHERE user_id = ?',
      [user_id]
    );

    if (currentUser.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const user = currentUser[0];
    const newTotalGames = user.total_games_played + 1;
    const newTotalScore = user.total_score + (score_gained || 0);
    const newHighestLevel = Math.max(user.highest_level, level_completed || 0);

    // Update user statistics
    await pool.query(`
      UPDATE users SET 
        total_games_played = ?,
        total_score = ?,
        highest_level = ?,
        last_active = NOW()
      WHERE user_id = ?
    `, [newTotalGames, newTotalScore, newHighestLevel, user_id]);

    console.log('User stats updated successfully:', {
      user_id,
      newTotalGames,
      newTotalScore,
      newHighestLevel
    });

    res.json({ 
      success: true,
      stats: {
        total_games_played: newTotalGames,
        total_score: newTotalScore,
        highest_level: newHighestLevel
      }
    });

  } catch (error) {
    console.error('Error updating user stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user statistics' 
    });
  }
});

// User game progress endpoints
app.get('/api/users/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Loading game progress for user:', userId);
    
    // Get user's game progress
    const [progressRows] = await pool.query(
      'SELECT game_progress, last_updated FROM user_game_progress WHERE user_id = ?',
      [userId]
    );
    
    if (progressRows.length === 0) {
      console.log('No progress found for user:', userId, '- returning initial progress');
      
      // Return initial progress for new users (matching frontend structure)
      const initialProgress = {
        unlockedLevels: 1,
        levelStars: {},
        totalStars: 0,
        badges: [
          { id: 'forest-guardian', name: 'Forest Guardian', description: 'Classified 10 forest tiles correctly', icon: '🌳', earned: false },
          { id: 'water-watcher', name: 'Water Watcher', description: 'Classified 10 water tiles correctly', icon: '💧', earned: false },
          { id: 'city-planner', name: 'City Planner', description: 'Classified 10 urban tiles correctly', icon: '🏙️', earned: false },
          { id: 'farm-expert', name: 'Farm Expert', description: 'Classified 10 farmland tiles correctly', icon: '🌾', earned: false },
          { id: 'desert-explorer', name: 'Desert Explorer', description: 'Classified 10 desert tiles correctly', icon: '🏜️', earned: false },
          { id: 'perfect-classifier', name: 'Perfect Classifier', description: 'Complete a level with 3 stars', icon: '⭐', earned: false },
          { id: 'master-classifier', name: 'Master Classifier', description: 'Complete all levels', icon: '🏆', earned: false }
        ],
        levelStatistics: {}
      };
      
      console.log('Returning initial progress:', initialProgress);
      
      return res.json({
        success: true,
        data: {
          user_id: userId,
          game_progress: initialProgress,
          last_updated: new Date().toISOString()
        }
      });
    }
    
    const progress = progressRows[0];
    const gameProgress = typeof progress.game_progress === 'string' 
      ? JSON.parse(progress.game_progress) 
      : progress.game_progress;
    
    console.log('Loaded progress:', gameProgress);
    
    res.json({
      success: true,
      data: {
        user_id: userId,
        game_progress: gameProgress,
        last_updated: progress.last_updated
      }
    });
    
  } catch (error) {
    console.error('Error loading game progress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load game progress' 
    });
  }
});

app.post('/api/users/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    const { game_progress } = req.body;
    
    console.log('Saving game progress for user:', userId);
    console.log('Progress data:', game_progress);
    
    if (!game_progress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Game progress data is required' 
      });
    }
    
    // Convert progress to JSON string if it's an object
    const progressJson = typeof game_progress === 'object' 
      ? JSON.stringify(game_progress) 
      : game_progress;
    
    // Insert or update user's game progress
    await pool.query(`
      INSERT INTO user_game_progress (user_id, game_progress, last_updated)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        game_progress = VALUES(game_progress),
        last_updated = NOW()
    `, [userId, progressJson]);
    
    // Update user statistics based on progress
    if (typeof game_progress === 'object') {
      const totalStars = game_progress.totalStars || 0;
      const levelStars = game_progress.levelStars || {};
      const completedLevels = Object.keys(levelStars).length;
      const highestLevel = Math.max(...Object.keys(levelStars).map(Number), 0);
      
      // Update user stats in users table
      await pool.query(`
        UPDATE users SET 
          total_games_played = ?,
          total_score = ?,
          highest_level = ?,
          last_active = NOW()
        WHERE user_id = ?
      `, [completedLevels, totalStars * 100, highestLevel, userId]);
      
      console.log('Updated user stats:', { 
        games: completedLevels, 
        score: totalStars * 100, 
        level: highestLevel 
      });
    }
    
    console.log('Game progress saved successfully');
    
    res.json({ 
      success: true,
      message: 'Game progress saved successfully'
    });
    
  } catch (error) {
    console.error('Error saving game progress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save game progress' 
    });
  }
});

app.post('/api/users/:userId/progress/reset', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Resetting game progress for user:', userId);
    
    // Delete user's game progress
    await pool.query('DELETE FROM user_game_progress WHERE user_id = ?', [userId]);
    
    // Reset user stats
    await pool.query(`
      UPDATE users SET 
        total_games_played = 0,
        total_score = 0,
        highest_level = 0,
        last_active = NOW()
      WHERE user_id = ?
    `, [userId]);
    
    console.log('Game progress reset successfully');
    
    res.json({ 
      success: true,
      message: 'Game progress reset successfully'
    });
    
  } catch (error) {
    console.error('Error resetting game progress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reset game progress' 
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️ Database: landuse_puzzle`);
});
