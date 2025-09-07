-- Add columns for image classification tracking
ALTER TABLE error_logs 
ADD COLUMN image_name VARCHAR(255),
ADD COLUMN classification_attempt VARCHAR(255),
ADD COLUMN correct_classification VARCHAR(255),
ADD COLUMN error_type VARCHAR(50);

-- Create a view for image classification failure analysis
CREATE VIEW image_classification_failures AS
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
