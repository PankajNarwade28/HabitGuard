-- ============================================
-- HabitGuard Database Setup Script
-- Run this in phpMyAdmin SQL tab
-- ============================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS habitguard
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

-- Use the database
USE habitguard;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  u_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT,
  education VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile_no VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  is_student BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_type ENUM('undergraduate', 'postgraduate', 'diploma') NOT NULL,
  degree_name VARCHAR(100) NOT NULL,
  current_semester INT NOT NULL,
  specialization VARCHAR(100),
  enrollment_year INT,
  expected_graduation_year INT,
  study_hours_per_day INT DEFAULT 4,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(u_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create student_subjects table
CREATE TABLE IF NOT EXISTS student_subjects (
  subject_id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id INT NOT NULL,
  subject_name VARCHAR(150) NOT NULL,
  subject_code VARCHAR(50),
  semester INT NOT NULL,
  credits INT DEFAULT 3,
  study_hours_recommended INT DEFAULT 2,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES student_profiles(profile_id) ON DELETE CASCADE,
  INDEX idx_profile_id (profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create course_recommendations table
CREATE TABLE IF NOT EXISTS course_recommendations (
  recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  platform VARCHAR(50) NOT NULL,
  course_title VARCHAR(255) NOT NULL,
  course_url TEXT NOT NULL,
  instructor VARCHAR(100),
  difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES student_subjects(subject_id) ON DELETE CASCADE,
  INDEX idx_subject_id (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  question_id INT AUTO_INCREMENT PRIMARY KEY,
  subject_name VARCHAR(150) NOT NULL,
  question_text TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_subject (subject_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  attempt_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject_name VARCHAR(150) NOT NULL,
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  score_percentage DECIMAL(5,2) NOT NULL,
  time_taken_seconds INT,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(u_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_subject (subject_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Display success message
SELECT 'Database and table created successfully!' AS Status;

-- Show table structure
DESCRIBE users;
