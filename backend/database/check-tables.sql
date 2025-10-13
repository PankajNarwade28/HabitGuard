-- Quick Database Check Script
-- Run this in phpMyAdmin to verify all tables exist

-- 1. Check which tables exist
SELECT 
    TABLE_NAME as 'Table Name',
    CASE 
        WHEN TABLE_NAME IN ('users', 'streak_history', 'user_statistics', 'daily_summary', 
                            'app_usage_history', 'user_goals', 'weekly_reports', 'user_preferences',
                            'user_stats', 'backup_log', 'weekly_summary', 'app_categories') 
        THEN '✅ EXISTS'
        ELSE '❌ UNKNOWN'
    END as 'Status',
    TABLE_ROWS as 'Row Count',
    CREATE_TIME as 'Created At'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;

-- 2. Check for missing required tables
SELECT 'Missing Tables Check' as 'Test';

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.TABLES 
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users') = 0 
        THEN '❌ users table MISSING'
        ELSE '✅ users table exists'
    END as 'users';

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.TABLES 
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'weekly_reports') = 0 
        THEN '❌ weekly_reports table MISSING - RUN complete-migration.sql'
        ELSE '✅ weekly_reports table exists'
    END as 'weekly_reports';

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.TABLES 
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'streak_history') = 0 
        THEN '❌ streak_history table MISSING - RUN complete-migration.sql'
        ELSE '✅ streak_history table exists'
    END as 'streak_history';

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.TABLES 
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_statistics') = 0 
        THEN '❌ user_statistics table MISSING - RUN complete-migration.sql'
        ELSE '✅ user_statistics table exists'
    END as 'user_statistics';

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.TABLES 
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'daily_summary') = 0 
        THEN '❌ daily_summary table MISSING - RUN complete-migration.sql'
        ELSE '✅ daily_summary table exists'
    END as 'daily_summary';

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.TABLES 
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'app_usage_history') = 0 
        THEN '❌ app_usage_history table MISSING - RUN complete-migration.sql'
        ELSE '✅ app_usage_history table exists'
    END as 'app_usage_history';

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.TABLES 
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_goals') = 0 
        THEN '❌ user_goals table MISSING - RUN complete-migration.sql'
        ELSE '✅ user_goals table exists'
    END as 'user_goals';

-- 3. Count total tables
SELECT COUNT(*) as 'Total Tables in Database'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE();

-- 4. Database info
SELECT 
    DATABASE() as 'Current Database',
    @@version as 'MySQL Version',
    NOW() as 'Current Time';
