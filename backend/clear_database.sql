-- Script to delete all data from the landuse-puzzle database
-- This will clear all user data, game states, and error logs

USE landuse_puzzle;

-- Disable foreign key checks to avoid dependency issues
SET FOREIGN_KEY_CHECKS = 0;

-- Delete all data from tables (in order to avoid foreign key constraints)
DELETE FROM game_states;
DELETE FROM error_logs;
DELETE FROM users;

-- Reset auto-increment counters to start from 1
ALTER TABLE game_states AUTO_INCREMENT = 1;
ALTER TABLE error_logs AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify all tables are empty
SELECT 'game_states' as table_name, COUNT(*) as row_count FROM game_states
UNION ALL
SELECT 'error_logs' as table_name, COUNT(*) as row_count FROM error_logs
UNION ALL
SELECT 'users' as table_name, COUNT(*) as row_count FROM users;

-- Show confirmation message
SELECT 'All data has been successfully deleted from the database' as status;
