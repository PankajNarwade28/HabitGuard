-- Quiz Attempts Table Migration
-- This table stores all quiz attempts by students with their scores and results

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject_code VARCHAR(20) NOT NULL,
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  score_percentage DECIMAL(5,2) NOT NULL,
  time_taken_seconds INT DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for better query performance
  INDEX idx_user_id (user_id),
  INDEX idx_subject_code (subject_code),
  INDEX idx_attempted_at (attempted_at),
  INDEX idx_user_subject (user_id, subject_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraint to users table (optional, uncomment if users table exists)
-- ALTER TABLE quiz_attempts 
-- ADD CONSTRAINT fk_quiz_user 
-- FOREIGN KEY (user_id) REFERENCES users(id) 
-- ON DELETE CASCADE;

-- Verify table creation
SELECT 'quiz_attempts table created successfully!' as status;

-- Show table structure
DESCRIBE quiz_attempts;

-- Show all columns
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT,
  COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'habitguard'  -- Change to your database name
  AND TABLE_NAME = 'quiz_attempts'
ORDER BY ORDINAL_POSITION;
