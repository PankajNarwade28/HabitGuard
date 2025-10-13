-- Streak System Migration
-- Creates tables needed for streak tracking functionality

-- Create streak_history table
CREATE TABLE IF NOT EXISTS streak_history (
    streak_id INT AUTO_INCREMENT PRIMARY KEY,
    u_id INT NOT NULL,
    streak_date DATE NOT NULL,
    screen_time_minutes INT NOT NULL COMMENT 'Screen time in minutes for that day',
    goal_met TINYINT(1) DEFAULT 0 COMMENT '1 if goal was met, 0 otherwise',
    daily_goal INT COMMENT 'Daily goal in minutes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES users(u_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (u_id, streak_date),
    INDEX idx_user_date (u_id, streak_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Track daily streak history';

-- Create user_statistics table
CREATE TABLE IF NOT EXISTS user_statistics (
    stat_id INT AUTO_INCREMENT PRIMARY KEY,
    u_id INT NOT NULL UNIQUE,
    current_streak INT DEFAULT 0 COMMENT 'Current consecutive days of meeting goal',
    longest_streak INT DEFAULT 0 COMMENT 'Longest streak ever achieved',
    total_active_days INT DEFAULT 0 COMMENT 'Total days user has been active',
    last_active_date DATE COMMENT 'Last date user was active',
    total_screen_time_all_time INT DEFAULT 0 COMMENT 'Total screen time in minutes',
    avg_daily_screen_time DECIMAL(10, 2) DEFAULT 0 COMMENT 'Average daily screen time',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES users(u_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User statistics and achievements';

SELECT 'Streak tables created successfully! ✅' as status;
