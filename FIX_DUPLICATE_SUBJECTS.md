# Fix Duplicate Subjects and Courses

## Problem
Subjects were being duplicated in the database, causing:
- Same subjects appearing multiple times in profile
- Same course recommendations appearing multiple times

## Solution Applied

### 1. Backend Changes (✅ DONE)
- Updated all subject queries to use `DISTINCT` and `GROUP BY subject_code`
- Changed INSERT to `INSERT IGNORE` to prevent future duplicates
- Added duplicate prevention flag in frontend `autoRepopulateSubjects()`

### 2. Database Migration (⚠️ NEEDS TO BE RUN)

Run this command to clean up existing duplicates and prevent future ones:

```bash
cd backend
mysql -u root -pAdmin@123 -D habitguard < migrations/fix-duplicate-subjects.sql
```

Or run these SQL commands directly in MySQL:

```sql
-- Remove duplicate subjects (keep only first occurrence)
DELETE s1 FROM student_subjects s1
INNER JOIN student_subjects s2 
WHERE s1.subject_id > s2.subject_id 
  AND s1.profile_id = s2.profile_id 
  AND s1.subject_code = s2.subject_code;

-- Add unique constraint to prevent future duplicates
ALTER TABLE student_subjects
ADD UNIQUE KEY unique_profile_subject (profile_id, subject_code);
```

## What Was Fixed

### Backend Files Modified:
1. **`backend/controllers/studentController.js`**
   - `getProfile()`: Added GROUP BY to deduplicate subjects
   - `getSubjects()`: Added GROUP BY to deduplicate subjects  
   - `getRecommendations()`: Added DISTINCT to deduplicate recommendations
   - `getStudyTimeSuggestions()`: Added GROUP BY to deduplicate
   - `repopulateSubjects()`: Changed to INSERT IGNORE

2. **`app/student/profile.tsx`**
   - Added `isRepopulating` flag to prevent duplicate API calls
   - Fixed to use `API_CONFIG.BASE_URL` instead of hardcoded IP
   - Added better error handling

3. **`backend/migrations/fix-duplicate-subjects.sql`**
   - Created migration script to clean up duplicates

## How It Works Now

### Before:
- Subject could be inserted multiple times
- Each duplicate subject generated duplicate recommendations
- User saw: "Subject A", "Subject A", "Subject A" (3 times)

### After:
- Database queries use GROUP BY to show only unique subjects
- INSERT IGNORE prevents new duplicates
- Frontend prevents rapid repeated calls
- User sees: "Subject A" (1 time only)

## Verification

After running the migration, verify with:

```sql
-- Should return 0 rows (no duplicates)
SELECT profile_id, subject_code, subject_name, COUNT(*) as count 
FROM student_subjects 
GROUP BY profile_id, subject_code 
HAVING COUNT(*) > 1;

-- Show subjects per profile
SELECT profile_id, COUNT(*) as subject_count 
FROM student_subjects 
GROUP BY profile_id;
```

## Next Steps

1. ✅ Backend code updated (already done)
2. ⚠️ Run database migration to clean existing duplicates
3. ✅ Restart backend server (if running)
4. ✅ Refresh app to see deduplicated data

## Note
The unique constraint will prevent ANY future duplicates from being inserted. If you try to insert a duplicate subject, MySQL will silently ignore it (because of INSERT IGNORE).
