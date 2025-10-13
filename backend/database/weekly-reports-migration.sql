-- Migration Script: Add Weekly Reports Table
-- Run this script in phpMyAdmin or MySQL CLI to add weekly reports functionality

-- Create weekly reports table
CREATE TABLE IF NOT EXISTS weekly_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    u_id INT NOT NULL,
    report_title VARCHAR(255) NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    total_screen_time INT NOT NULL COMMENT 'Total screen time in minutes',
    daily_average DECIMAL(10, 2) COMMENT 'Average daily screen time',
    total_app_opens INT DEFAULT 0,
    most_used_apps JSON COMMENT 'Array of top apps with usage time',
    streak_data JSON COMMENT 'Streak information for the week',
    goal_achievement JSON COMMENT 'Goals achieved during the week',
    productivity_score DECIMAL(5, 2) COMMENT 'Overall productivity score (0-100)',
    insights TEXT COMMENT 'AI-generated insights and recommendations',
    report_status VARCHAR(20) DEFAULT 'completed',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES users(u_id) ON DELETE CASCADE,
    INDEX idx_user_week (u_id, week_start_date),
    UNIQUE KEY unique_user_week_report (u_id, week_start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Weekly reports with analytics and insights';

-- Verify table creation
SELECT 'weekly_reports table created successfully! ✅' as status;

-- Show table structure
DESCRIBE weekly_reports;

-- Check if it exists
SELECT 
    TABLE_NAME,
    ENGINE,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'weekly_reports';
