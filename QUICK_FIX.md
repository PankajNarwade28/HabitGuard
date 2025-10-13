# 🚨 QUICK FIX - Read This First!

## The Problem
```
ERROR ❌ Generate report error: [Error: Failed to generate weekly report]
Error: ENOENT: no such file or directory, open 'C:\Projects\HabitGuard\InternalBytecode.js'
```

## The Solution (2 Minutes)

### 1️⃣ Run This SQL Script

**Open phpMyAdmin → Select your database → Click SQL tab → Copy & paste this:**

```sql
-- Run ONLY the tables that don't exist yet

CREATE TABLE IF NOT EXISTS streak_history (
    streak_id INT AUTO_INCREMENT PRIMARY KEY,
    u_id INT NOT NULL,
    streak_date DATE NOT NULL,
    screen_time_minutes INT NOT NULL,
    goal_met TINYINT(1) DEFAULT 0,
    daily_goal INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES users(u_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (u_id, streak_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_statistics (
    stat_id INT AUTO_INCREMENT PRIMARY KEY,
    u_id INT NOT NULL UNIQUE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    total_active_days INT DEFAULT 0,
    last_active_date DATE,
    total_screen_time_all_time INT DEFAULT 0,
    avg_daily_screen_time DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES users(u_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS weekly_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    u_id INT NOT NULL,
    report_title VARCHAR(255) NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    total_screen_time INT NOT NULL,
    daily_average DECIMAL(10, 2),
    total_app_opens INT DEFAULT 0,
    most_used_apps JSON,
    streak_data JSON,
    goal_achievement JSON,
    productivity_score DECIMAL(5, 2),
    insights TEXT,
    report_status VARCHAR(20) DEFAULT 'completed',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES users(u_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_week_report (u_id, week_start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS daily_summary (
    summary_id INT AUTO_INCREMENT PRIMARY KEY,
    u_id INT NOT NULL,
    summary_date DATE NOT NULL,
    total_screen_time INT NOT NULL,
    total_unlocks INT DEFAULT 0,
    most_used_app VARCHAR(255),
    usage_status VARCHAR(20) DEFAULT 'within_limit',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES users(u_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date_summary (u_id, summary_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS app_usage_history (
    usage_id INT AUTO_INCREMENT PRIMARY KEY,
    u_id INT NOT NULL,
    app_name VARCHAR(255) NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    usage_time INT NOT NULL,
    app_opens INT DEFAULT 0,
    last_used TIMESTAMP NULL,
    usage_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES users(u_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_goals (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    u_id INT NOT NULL,
    goal_type VARCHAR(50) NOT NULL,
    target_value INT NOT NULL,
    current_value INT DEFAULT 0,
    goal_status VARCHAR(20) DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES users(u_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Click "Go" button** ✅

---

### 2️⃣ Restart Backend
```powershell
# In backend directory
# Press Ctrl+C to stop
# Then run:
nodemon
```

---

### 3️⃣ Restart App
```powershell
# Press Ctrl+C to stop Expo
# Then run:
npm start
```

---

## ✅ That's It!

Your app should now work without errors.

---

## 🔍 What Was Wrong?

The backend code was trying to use database tables that didn't exist:
- `weekly_reports` - for storing reports
- `streak_history` - for tracking streaks  
- `user_statistics` - for user stats
- `daily_summary` - for daily data
- `app_usage_history` - for app tracking
- `user_goals` - for goals

The SQL script above creates all these tables.

---

## 📋 Full Documentation

For complete details, see:
- `PROJECT_FIX_GUIDE.md` - Detailed troubleshooting
- `backend/database/complete-migration.sql` - Full SQL script
- `backend/database/check-tables.sql` - Verify tables exist

---

## 🆘 Still Having Issues?

### Check if tables were created:
```sql
SHOW TABLES;
```

You should see: `weekly_reports`, `streak_history`, `user_statistics`, etc.

### If you get "Table already exists" error:
That's fine! It means the tables are already there. Just restart backend and app.

### If you get "Cannot add foreign key" error:
Make sure the `users` table exists first:
```sql
DESCRIBE users;
```

---

**Now go test your app! 🚀**
