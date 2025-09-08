-- Setup script for cPanel MySQL Database
-- Database: anmartco_geopuzzle
-- This script will create all necessary tables for the landuse-puzzle application

-- Note: We don't need to create the database as it's already created by cPanel
-- USE anmartco_geopuzzle; (This will be handled by the connection)

-- Create users table (for admin dashboard)
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
);

-- Create game_states table
CREATE TABLE IF NOT EXISTS game_states (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  game_state TEXT NOT NULL,
  version VARCHAR(50) DEFAULT '1.0',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create error_logs table
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
);

-- Create user_game_progress table
CREATE TABLE IF NOT EXISTS user_game_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  game_progress JSON NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_progress (user_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create a view for image classification failure analysis
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
ORDER BY failure_count DESC;

-- Insert some sample data for testing (optional - remove if you don't want test data)
INSERT IGNORE INTO users (user_id, username, total_games_played, total_score, highest_level) VALUES
('test_user1', 'TestUser1', 10, 1500, 5),
('test_user2', 'TestUser2', 5, 800, 3),
('test_user3', 'TestUser3', 15, 2200, 7);

-- Insert sample error logs (optional - remove if you don't want test data)
INSERT INTO error_logs (user_id, error, context, level, game_level) VALUES
('test_user1', 'Network connection failed', 'Loading level 3', 'error', 3),
('test_user2', 'Invalid tile placement', 'Game board validation', 'warning', 2),
('test_user1', 'Score calculation error', 'End of level 5', 'error', 5);

-- Insert sample game states (optional - remove if you don't want test data)
INSERT INTO game_states (user_id, game_state, version) VALUES
('test_user1', '{"level": 3, "score": 1200, "tiles": []}', '1.0'),
('test_user2', '{"level": 2, "score": 800, "tiles": []}', '1.0');
