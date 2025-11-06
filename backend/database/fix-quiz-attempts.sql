-- Fix quiz_attempts table by adding missing subject_code column

USE habitguard;

-- Check current table structure
DESCRIBE quiz_attempts;

-- Add subject_code column if it doesn't exist
ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS subject_code VARCHAR(20) NOT NULL AFTER user_id;

-- Add indexes for better performance
ALTER TABLE quiz_attempts 
ADD INDEX IF NOT EXISTS idx_subject_code (subject_code);

ALTER TABLE quiz_attempts 
ADD INDEX IF NOT EXISTS idx_user_subject (user_id, subject_code);

-- Verify the changes
DESCRIBE quiz_attempts;

SELECT 'quiz_attempts table fixed successfully!' as status;
