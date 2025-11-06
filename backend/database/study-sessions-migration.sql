-- ============================================
-- Study Sessions and Study Plans Migration
-- Adds real-time study tracking functionality
-- ============================================

USE habitguard;

-- Create study_plans table
CREATE TABLE IF NOT EXISTS study_plans (
  plan_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  profile_id INT NOT NULL,
  subject_id INT NOT NULL,
  subject_code VARCHAR(50) NOT NULL,
  subject_name VARCHAR(150) NOT NULL,
  planned_duration_minutes INT NOT NULL DEFAULT 60,
  target_daily_hours DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  target_weekly_hours DECIMAL(4,1) NOT NULL DEFAULT 7.0,
  priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  status ENUM('active', 'paused', 'completed', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(u_id) ON DELETE CASCADE,
  FOREIGN KEY (profile_id) REFERENCES student_profiles(profile_id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES student_subjects(subject_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_profile_id (profile_id),
  INDEX idx_subject_id (subject_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  session_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  profile_id INT NOT NULL,
  subject_id INT NOT NULL,
  plan_id INT,
  subject_code VARCHAR(50) NOT NULL,
  subject_name VARCHAR(150) NOT NULL,
  planned_duration_minutes INT NOT NULL DEFAULT 60,
  actual_duration_seconds INT DEFAULT 0,
  status ENUM('not_started', 'in_progress', 'paused', 'completed', 'cancelled') DEFAULT 'not_started',
  start_time TIMESTAMP NULL DEFAULT NULL,
  pause_time TIMESTAMP NULL DEFAULT NULL,
  end_time TIMESTAMP NULL DEFAULT NULL,
  total_paused_seconds INT DEFAULT 0,
  pause_count INT DEFAULT 0,
  notes TEXT,
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(u_id) ON DELETE CASCADE,
  FOREIGN KEY (profile_id) REFERENCES student_profiles(profile_id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES student_subjects(subject_id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES study_plans(plan_id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_profile_id (profile_id),
  INDEX idx_subject_id (subject_id),
  INDEX idx_plan_id (plan_id),
  INDEX idx_status (status),
  INDEX idx_start_time (start_time),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create study_statistics table for aggregated data
    CREATE TABLE IF NOT EXISTS study_statistics (
    stat_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    profile_id INT NOT NULL,
    subject_id INT,
    stat_date DATE NOT NULL,
    total_study_minutes INT DEFAULT 0,
    total_sessions INT DEFAULT 0,
    completed_sessions INT DEFAULT 0,
    average_session_minutes DECIMAL(6,2) DEFAULT 0.00,
    total_pauses INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(u_id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES student_profiles(profile_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES student_subjects(subject_id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_subject_date (user_id, subject_id, stat_date),
    INDEX idx_user_id (user_id),
    INDEX idx_profile_id (profile_id),
    INDEX idx_subject_id (subject_id),
    INDEX idx_stat_date (stat_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Display success message
SELECT 'Study sessions tables created successfully!' AS Status;

-- Show table structures
DESCRIBE study_plans;
DESCRIBE study_sessions;
DESCRIBE study_statistics;
