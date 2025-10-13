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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Display success message
SELECT 'Database and table created successfully!' AS Status;

-- Show table structure
DESCRIBE users;
