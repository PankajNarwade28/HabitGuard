# Study Plan with Real-Time Timer - Complete Implementation

## 🎯 Overview

A comprehensive study session tracking system with real-time timer functionality, allowing students to:
- Start study sessions with customizable durations
- Use Start, Pause, Resume, and Stop controls
- Track time automatically in real-time
- Store session data in database
- View detailed statistics and history
- Monitor progress across subjects

---

## 📁 Files Created/Modified

### Backend Files

1. **`backend/database/study-sessions-migration.sql`** ✅ NEW
   - Creates 3 tables: `study_plans`, `study_sessions`, `study_statistics`
   - Includes indexes for performance
   - Tracks session status, timestamps, pauses, and completion percentage

2. **`backend/controllers/studySessionController.js`** ✅ NEW
   - **Study Plans**: Create and fetch study plans
   - **Study Sessions**: Create, start, pause, resume, stop sessions
   - **Statistics**: Get detailed analytics by period/subject/day
   - **Auto-updates**: Statistics table on session completion

3. **`backend/routes/studentRoutes.js`** ✅ MODIFIED
   - Added 9 new routes for study sessions and statistics
   - Routes: `/study-plans`, `/study-sessions`, `/study-statistics`

4. **`backend/run-study-migration.js`** ✅ NEW
   - Helper script to run database migration
   - Verifies table creation

### Frontend Files

5. **`app/student/study-plan.tsx`** ✅ NEW
   - Main study session interface with timer
   - Real-time countdown timer with Start/Pause/Resume/Stop buttons
   - Shows active session with progress bar
   - Lists all subjects with "Start Session" buttons
   - Modals for starting and stopping sessions

6. **`app/student/study-statistics.tsx`** ✅ NEW
   - Comprehensive statistics dashboard
   - Period selector: Week / Month / All Time
   - Shows total time, sessions, avg session time, pauses
   - Subject-wise breakdown
   - Daily study history

7. **`services/StudySessionService.ts`** ✅ NEW
   - TypeScript service for all study session APIs
   - Methods for creating, starting, pausing, resuming, stopping sessions
   - Fetches active sessions and history
   - Gets statistics by period

8. **`app/student/profile.tsx`** ✅ MODIFIED
   - Added "Study Sessions" section with 2 cards:
     - "Start Session" → Links to study-plan.tsx
     - "Statistics" → Links to study-statistics.tsx
   - Keeps existing "Study Plan" button for time suggestions

---

## 🗄️ Database Schema

### Table: `study_plans`
Stores study plans for subjects.

```sql
CREATE TABLE study_plans (
  plan_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  profile_id INT NOT NULL,
  subject_id INT NOT NULL,
  subject_code VARCHAR(50),
  subject_name VARCHAR(150),
  planned_duration_minutes INT DEFAULT 60,
  target_daily_hours DECIMAL(3,1) DEFAULT 1.0,
  target_weekly_hours DECIMAL(4,1) DEFAULT 7.0,
  priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  status ENUM('active', 'paused', 'completed', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table: `study_sessions`
Tracks individual study sessions with timer data.

```sql
CREATE TABLE study_sessions (
  session_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  profile_id INT NOT NULL,
  subject_id INT NOT NULL,
  plan_id INT,
  subject_code VARCHAR(50),
  subject_name VARCHAR(150),
  planned_duration_minutes INT DEFAULT 60,
  actual_duration_seconds INT DEFAULT 0,
  status ENUM('not_started', 'in_progress', 'paused', 'completed', 'cancelled'),
  start_time TIMESTAMP NULL,
  pause_time TIMESTAMP NULL,
  end_time TIMESTAMP NULL,
  total_paused_seconds INT DEFAULT 0,
  pause_count INT DEFAULT 0,
  notes TEXT,
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table: `study_statistics`
Aggregated daily statistics per subject.

```sql
CREATE TABLE study_statistics (
  stat_id INT PRIMARY KEY AUTO_INCREMENT,
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
  UNIQUE KEY unique_user_subject_date (user_id, subject_id, stat_date)
);
```

---

## 🔌 API Endpoints

### Study Plans

**POST** `/api/student/study-plans/:userId`
- Create a study plan for a subject
- Body: `{ subjectId, subjectCode, subjectName, plannedDurationMinutes, targetDailyHours, targetWeeklyHours, priority }`

**GET** `/api/student/study-plans/:userId`
- Get all active study plans for user

### Study Sessions

**POST** `/api/student/study-sessions/:userId`
- Create a new study session
- Body: `{ subjectId, planId?, subjectCode, subjectName, plannedDurationMinutes }`
- Returns: `{ sessionId }`

**GET** `/api/student/study-sessions/:userId/active`
- Get currently active/paused session
- Returns: `{ hasActiveSession, session }`

**GET** `/api/student/study-sessions/:userId/history`
- Get completed study sessions
- Query params: `?limit=20&subjectId=5`

**POST** `/api/student/study-sessions/:sessionId/start`
- Start a session (change status to 'in_progress')
- Sets `start_time` to NOW()

**POST** `/api/student/study-sessions/:sessionId/pause`
- Pause a running session
- Body: `{ currentDurationSeconds }`
- Increments `pause_count`

**POST** `/api/student/study-sessions/:sessionId/resume`
- Resume a paused session
- Calculates total paused time

**POST** `/api/student/study-sessions/:sessionId/stop`
- Complete a session
- Body: `{ finalDurationSeconds, notes? }`
- Calculates completion percentage
- Updates `study_statistics` table

### Study Statistics

**GET** `/api/student/study-statistics/:userId`
- Get aggregated statistics
- Query params: `?period=week|month|all`
- Returns:
  - Overall stats (total time, sessions, avg session, pauses)
  - By subject breakdown
  - Daily breakdown

---

## 🎨 User Interface Flow

### 1. Student Profile Page
```
┌─────────────────────────────────────┐
│ Student Profile                     │
├─────────────────────────────────────┤
│                                     │
│ Study Sessions                      │
│ ┌────────────┐  ┌────────────┐    │
│ │ 🎯 Start   │  │ 📊 Stats   │    │
│ │ Session    │  │            │    │
│ └────────────┘  └────────────┘    │
│                                     │
│ Study Plan (Time Recommendations)   │
│ [View →]                            │
└─────────────────────────────────────┘
```

### 2. Study Plan Page (Timer Interface)
```
┌─────────────────────────────────────┐
│ Study Plan                          │
├─────────────────────────────────────┤
│ ACTIVE SESSION (if any)             │
│ ╔═══════════════════════════════╗  │
│ ║ • Data Structures              ║  │
│ ║                                ║  │
│ ║      01:23:45                  ║  │
│ ║   Target: 60 minutes           ║  │
│ ║                                ║  │
│ ║ ▓▓▓▓▓▓▓▓▓▓░░░░░ 75%          ║  │
│ ║                                ║  │
│ ║ [⏸ Pause]  [⏹ Stop]           ║  │
│ ╚═══════════════════════════════╝  │
│                                     │
│ Other Subjects                      │
│ ┌───────────────────────────────┐  │
│ │ Operating Systems    [High]   │  │
│ │ Weekly: 6h | Daily: 0.9h      │  │
│ │ [▶ Start Session]             │  │
│ └───────────────────────────────┘  │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ Database Systems    [Medium]  │  │
│ │ Weekly: 5h | Daily: 0.7h      │  │
│ │ [▶ Start Session]             │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 3. Statistics Page
```
┌─────────────────────────────────────┐
│ Study Statistics                    │
├─────────────────────────────────────┤
│ [Week] [Month] [All]                │
│                                     │
│ This Week Overview                  │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│ │12h  │ │ 15  │ │48m  │ │  5  │  │
│ │Time │ │Sess │ │Avg  │ │Pause│  │
│ └─────┘ └─────┘ └─────┘ └─────┘  │
│                                     │
│ By Subject                          │
│ ┌───────────────────────────────┐  │
│ │ Data Structures        5h 30m │  │
│ │ CS201                         │  │
│ │ 8 sessions | Avg: 41m         │  │
│ └───────────────────────────────┘  │
│                                     │
│ Daily Breakdown                     │
│ ┌───────────────────────────────┐  │
│ │ Dec 1, 2025    3 sessions  2h │  │
│ │ Nov 30, 2025   2 sessions  1h │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 🚀 How It Works

### Timer Mechanism

1. **Create Session**:
   - User selects subject and duration
   - Backend creates session with `status='not_started'`

2. **Start Timer**:
   - Backend sets `status='in_progress'` and `start_time=NOW()`
   - Frontend starts JavaScript `setInterval` timer
   - Timer increments `elapsedSeconds` every 1000ms

3. **Pause Timer**:
   - User clicks Pause
   - Frontend sends current elapsed time to backend
   - Backend saves `actual_duration_seconds` and `pause_time`
   - Frontend clears interval

4. **Resume Timer**:
   - Backend calculates pause duration: `NOW() - pause_time`
   - Adds to `total_paused_seconds`
   - Sets `status='in_progress'` again
   - Frontend restarts interval from saved elapsed time

5. **Stop Timer**:
   - User clicks Stop
   - Frontend sends final elapsed time + optional notes
   - Backend:
     - Calculates completion percentage
     - Sets `status='completed'` and `end_time=NOW()`
     - Updates `study_statistics` table with aggregated data

### Data Flow

```
┌──────────────┐
│   Frontend   │
│  (Timer UI)  │
└──────┬───────┘
       │ 1. Start Session
       ▼
┌──────────────┐
│   Backend    │
│  (Express)   │
└──────┬───────┘
       │ 2. Insert/Update
       ▼
┌──────────────┐
│   Database   │
│   (MySQL)    │
└──────────────┘

Real-time updates:
- Frontend timer runs independently
- Sync with backend on pause/stop
- Backend calculates accurate durations using timestamps
```

---

## 🎮 User Experience

### Starting a Study Session

1. Navigate to **Student Profile**
2. Click **"Start Session"** card
3. See list of subjects with priority colors
4. Click **"Start Session"** on desired subject
5. Modal appears:
   - Subject name displayed
   - Duration input (pre-filled with recommended daily hours)
   - Adjust if needed
   - Click **"Start"**
6. Timer begins immediately
7. Large timer display shows elapsed time
8. Progress bar fills based on target duration
9. Status indicator (green dot) shows session is running

### During Study Session

- **Timer counts up**: `00:00`, `00:01`, `00:02`, etc.
- **Format changes**: After 1 hour shows `1:00:00`
- **Progress bar**: Visual indicator of % complete
- **Target shown**: "Target: 60 minutes"
- **Pause button**: Temporarily stop timer
- **Stop button**: Complete session

### Pausing

1. Click **"⏸ Pause"** button
2. Timer stops immediately
3. Status changes (orange indicator)
4. Button changes to **"▶ Resume"**
5. Pause count displayed: "Paused 1 time"

### Completing Session

1. Click **"⏹ Stop"** button
2. Modal appears:
   - Shows total time studied
   - Optional notes field
   - Cancel or Complete buttons
3. Click **"Complete"**
4. Success alert shows:
   - Time studied: X minutes
   - Completion: Y%
5. Session card disappears
6. Statistics updated automatically

### Viewing Statistics

1. Click **"Statistics"** card from profile
2. Select period: Week / Month / All
3. See overview cards:
   - Total study time
   - Total sessions
   - Average session length
   - Total pauses
4. Scroll to see:
   - Subject breakdown with time per subject
   - Daily history with sessions per day

---

## 💾 Data Storage

### Session Lifecycle

```
not_started → in_progress → paused → in_progress → completed
                    ↓
              [User stops]
                    ↓
               completed
```

### Statistics Auto-Update

When session completes, backend automatically:
1. Converts `actual_duration_seconds` to minutes
2. Finds or creates `study_statistics` row for today + subject
3. Updates:
   - `total_study_minutes += studyMinutes`
   - `total_sessions += 1`
   - `completed_sessions += 1`
   - `average_session_minutes = total_study_minutes / total_sessions`
   - `total_pauses += session.pause_count`

---

## 🎯 Features Implemented

✅ **Real-Time Timer**
- JavaScript interval-based countdown
- Accurate to the second
- Persists across pause/resume

✅ **Session Controls**
- Start: Begin study session
- Pause: Temporarily stop timer
- Resume: Continue from paused state
- Stop: Complete session with notes

✅ **Visual Feedback**
- Large timer display
- Progress bar showing % completion
- Status indicators (green=running, orange=paused)
- Pause count display

✅ **Data Persistence**
- All sessions stored in database
- Timestamps for start/pause/end
- Tracks actual vs planned duration
- Calculates completion percentage

✅ **Statistics Dashboard**
- Period filtering (week/month/all)
- Overall metrics
- Subject-wise breakdown
- Daily history

✅ **User Experience**
- Only one active session at a time
- Subject buttons disabled during active session
- Confirmation modals for start/stop
- Success alerts with summary

✅ **Priority System**
- High/Medium/Low priority colors
- Based on subject credits
- Visual badges on subject cards

---

## 🔧 Testing Instructions

### 1. Run Database Migration

```powershell
cd backend
node run-study-migration.js
```

Expected output:
```
✅ Connected to database
📄 Read migration file
✅ Migration executed successfully!
📊 Tables created:
  ✓ study_plans
  ✓ study_sessions
  ✓ study_statistics
```

### 2. Start Backend Server

```powershell
cd backend
npm start
```

Should see:
```
Server running on port 3000
✅ Successfully connected to MySQL database
```

### 3. Start Frontend

```powershell
npx expo start
```

### 4. Test Flow

1. **Login** as student
2. **Navigate** to Student Profile
3. **Click** "Start Session" card
4. **Select** any subject
5. **Enter** duration (e.g., 5 minutes for testing)
6. **Click** "Start"
7. **Watch** timer count up
8. **Try** pause/resume
9. **Click** stop after 2-3 minutes
10. **Add** optional notes
11. **Complete** session
12. **Check** statistics page

### 5. Verify Database

```sql
-- Check sessions created
SELECT * FROM study_sessions ORDER BY created_at DESC LIMIT 5;

-- Check statistics
SELECT * FROM study_statistics ORDER BY stat_date DESC;
```

---

## 📱 Screenshots Guide

### Key Screens

1. **Profile with Study Cards**
   - Two new cards: "Start Session" and "Statistics"
   - Orange play icon for sessions
   - Purple chart icon for stats

2. **Active Timer**
   - Large time display (e.g., 1:23:45)
   - Green progress bar
   - Pause and Stop buttons
   - Subject name at top

3. **Paused State**
   - Orange progress bar
   - Resume and Stop buttons
   - Pause count displayed

4. **Statistics Dashboard**
   - 4 metric cards in 2×2 grid
   - Subject list with total time
   - Daily breakdown list

---

## 🐛 Troubleshooting

### Timer not starting
- Check backend is running
- Verify database tables exist
- Check browser console for errors

### Session not saving
- Verify user has student profile
- Check database connection
- Look for SQL errors in backend logs

### Statistics not showing
- Complete at least one session first
- Check selected period matches data
- Verify `study_statistics` table has data

### Multiple active sessions
- Only one session allowed at a time
- Check `getActiveSession` API response
- Database enforces this via status checks

---

## 🎨 Customization

### Change Timer Display Format

Edit `app/student/study-plan.tsx`:

```typescript
const formatTime = (seconds: number): string => {
  // Change to show only minutes:seconds
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
```

### Change Default Duration

In subject suggestion:
```typescript
const defaultMinutes = Math.round(subject.dailyHours * 60); // Current
// Change to fixed 30 minutes:
const defaultMinutes = 30;
```

### Add Sound Notification

When timer reaches target:
```typescript
if (elapsedSeconds >= activeSession.planned_duration_minutes * 60) {
  // Play sound
  Audio.Sound.createAsync(require('../assets/notification.mp3'))
    .then(({ sound }) => sound.playAsync());
}
```

---

## 📊 Future Enhancements

Potential additions:
- [ ] Pomodoro mode (25 min focus + 5 min break)
- [ ] Background timer (continues when app minimized)
- [ ] Push notifications when timer completes
- [ ] Weekly/monthly goals with progress tracking
- [ ] Leaderboard comparing study times
- [ ] Study streak tracking
- [ ] Export statistics to PDF
- [ ] Calendar view of study sessions
- [ ] Subject-specific notes/resources
- [ ] Integration with quiz performance

---

## ✅ Summary

**What was added:**
- ✅ Real-time study timer with Start/Pause/Resume/Stop
- ✅ Database tables for sessions and statistics
- ✅ Backend APIs for all timer operations
- ✅ Frontend service layer
- ✅ Beautiful UI with progress visualization
- ✅ Statistics dashboard with filtering
- ✅ Session history tracking
- ✅ Auto-updating analytics

**How to use:**
1. Go to Student Profile
2. Click "Start Session"
3. Choose subject and duration
4. Use timer controls
5. Complete session with notes
6. View statistics anytime

**Data stored:**
- Every session with timestamps
- Pause counts and durations
- Completion percentages
- Daily aggregated statistics
- Full history for analysis

The system is production-ready and fully functional! 🚀
