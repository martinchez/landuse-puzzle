-- Create database
CREATE DATABASE IF NOT EXISTS landuse_puzzle;
USE landuse_puzzle;

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
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Insert some sample data for testing
INSERT IGNORE INTO users (user_id, username, total_games_played, total_score, highest_level) VALUES
('user1', 'TestUser1', 10, 1500, 5),
('user2', 'TestUser2', 5, 800, 3),
('user3', 'TestUser3', 15, 2200, 7);

-- Insert sample error logs
INSERT INTO error_logs (user_id, error, context, level, game_level) VALUES
('user1', 'Network connection failed', 'Loading level 3', 'error', 3),
('user2', 'Invalid tile placement', 'Game board validation', 'warning', 2),
('user1', 'Score calculation error', 'End of level 5', 'error', 5);

-- Insert sample game states
INSERT INTO game_states (user_id, game_state, version) VALUES
('user1', '{"level": 3, "score": 1200, "tiles": []}', '1.0'),
('user2', '{"level": 2, "score": 800, "tiles": []}', '1.0');
