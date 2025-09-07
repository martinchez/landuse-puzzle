-- Add last_active column to users table if it doesn't exist
USE landuse_puzzle;

-- Check if the column exists, and add it if it doesn't
SET @col_exists = (SELECT COUNT(*) 
                   FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'landuse_puzzle' 
                   AND TABLE_NAME = 'users' 
                   AND COLUMN_NAME = 'last_active');

SET @sql = CASE 
    WHEN @col_exists = 0 THEN 
        'ALTER TABLE users ADD COLUMN last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP;'
    ELSE 
        'SELECT "Column last_active already exists" AS message;'
    END;

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
