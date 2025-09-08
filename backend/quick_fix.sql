-- Quick fix for foreign key constraint issues
-- Run this directly in your cPanel MySQL database or phpMyAdmin

-- Temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Remove the foreign key constraint that's causing issues
ALTER TABLE user_game_progress DROP FOREIGN KEY user_game_progress_ibfk_1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- The application will now work without foreign key constraints
-- Users will be created automatically when they first interact with the app
