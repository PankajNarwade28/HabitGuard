-- Fix Duplicate Subjects Migration
-- This script removes duplicate subjects and adds a unique constraint

-- Step 1: Identify and keep only the first occurrence of each subject per profile
-- Delete duplicates keeping only the lowest subject_id for each combination
DELETE s1 FROM student_subjects s1
INNER JOIN student_subjects s2 
WHERE s1.subject_id > s2.subject_id 
  AND s1.profile_id = s2.profile_id 
  AND s1.subject_code = s2.subject_code;

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE student_subjects
ADD UNIQUE KEY unique_profile_subject (profile_id, subject_code);

-- Step 3: Verify the fix
SELECT 
    profile_id, 
    subject_code, 
    subject_name, 
    COUNT(*) as count 
FROM student_subjects 
GROUP BY profile_id, subject_code 
HAVING COUNT(*) > 1;
-- Should return 0 rows if fix was successful

-- Step 4: Show count of subjects per profile
SELECT 
    profile_id, 
    COUNT(*) as subject_count 
FROM student_subjects 
GROUP BY profile_id;
