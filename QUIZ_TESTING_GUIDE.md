# 🧪 Quiz System - Quick Test Guide

## ✅ Prerequisites

1. **Backend Running**: Ensure backend server is running on port 3000
   ```bash
   cd backend
   node server.js
   ```

2. **Student Profile**: Ensure you have a student profile with subjects set up
   - If not, go to Profile → Set Up Education

3. **Database**: Ensure `quiz_attempts` table exists
   ```sql
   CREATE TABLE IF NOT EXISTS quiz_attempts (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     subject_code VARCHAR(20) NOT NULL,
     total_questions INT NOT NULL,
     correct_answers INT NOT NULL,
     score_percentage DECIMAL(5,2) NOT NULL,
     time_taken_seconds INT DEFAULT 0,
     passed BOOLEAN DEFAULT FALSE,
     attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     INDEX idx_user_id (user_id),
     INDEX idx_subject_code (subject_code)
   );
   ```

---

## 🚀 Quick Test Steps

### Test 1: View Available Quizzes
1. Open app and login as student
2. Go to **Profile**
3. Scroll down to "Academic" section
4. Click **"View Quizzes"**
5. ✅ **Expected**: All your subjects should show with "X Questions" badge
6. ✅ **Expected**: No locked quizzes (all should have school icon, not lock icon)

### Test 2: Start a Quiz
1. From Quiz List, click on any subject (e.g., "Programming in C")
2. ✅ **Expected**: Ready screen appears with:
   - Subject name and code
   - Total questions: 5
   - Instructions
   - "Start Quiz" button (green)
3. Click **"Start Quiz"**
4. ✅ **Expected**: Timer starts automatically (shows 0:00)
5. ✅ **Expected**: First question appears with 4 options

### Test 3: Answer Questions
1. Click on option A, B, C, or D
2. ✅ **Expected**: Selected option highlights in purple with checkmark
3. Click **"Next"** button
4. ✅ **Expected**: Goes to question 2
5. ✅ **Expected**: Progress bar at top updates (shows "1 of 5 answered")
6. Click **"Previous"** button
7. ✅ **Expected**: Goes back to question 1
8. ✅ **Expected**: Previously selected answer is still selected

### Test 4: Question Navigator
1. Look at "Question Navigator" section below the question
2. ✅ **Expected**: 5 numbered boxes (1-5)
3. ✅ **Expected**: Answered questions are purple
4. ✅ **Expected**: Current question has purple border
5. ✅ **Expected**: Unanswered questions are gray
6. Click on number **3** in the navigator
7. ✅ **Expected**: Jumps directly to question 3

### Test 5: Submit Quiz
1. Answer all 5 questions
2. Navigate to the last question (5)
3. ✅ **Expected**: "Submit Quiz" button appears (green with checkmark)
4. Click **"Submit Quiz"**
5. ✅ **Expected**: Shows loading indicator briefly
6. ✅ **Expected**: Results screen appears

### Test 6: View Results
1. Check the results screen
2. ✅ **Expected**: Shows large percentage score (e.g., "80%")
3. ✅ **Expected**: Shows "Passed!" or "Keep Practicing" based on score
4. ✅ **Expected**: Shows statistics:
   - Correct answers (green)
   - Wrong answers (red)
   - Time taken
5. Scroll down to "Answer Review" section
6. ✅ **Expected**: All 5 questions shown with:
   - Your answer
   - Correct answer (if wrong)
   - Explanation
   - Green background for correct, red for wrong

### Test 7: Incomplete Quiz
1. Start a new quiz
2. Answer only 2 out of 5 questions
3. Go to last question and click **"Submit Quiz"**
4. ✅ **Expected**: Dialog appears: "You have 3 unanswered question(s). Submit anyway?"
5. Click **"Cancel"**
6. ✅ **Expected**: Dialog closes, can continue quiz
7. Click **"Submit"** in dialog
8. ✅ **Expected**: Quiz submits with unanswered questions counted as wrong

### Test 8: Quiz History
1. From results screen, click **"View Quiz History"**
2. ✅ **Expected**: Navigates to Quiz History page
3. ✅ **Expected**: Shows your recent attempt at the top
4. ✅ **Expected**: Shows statistics (average score, total attempts, etc.)

### Test 9: Multiple Attempts
1. From Quiz History or Quiz List, start the same quiz again
2. Answer differently this time
3. Submit and check results
4. ✅ **Expected**: New attempt saved
5. ✅ **Expected**: Quiz History shows both attempts
6. ✅ **Expected**: Different scores visible

---

## 🐛 Troubleshooting

### Issue: No quizzes showing
**Cause**: Student profile not set up  
**Solution**: Go to Profile → Set Up Education and add subjects

### Issue: "Quiz not available yet" message
**Cause**: Backend couldn't find questions for subject  
**Solution**: Check `backend/data/quizzes.json` has questions for that subject code

### Issue: Submit button doesn't work
**Cause**: Network error or backend not running  
**Solution**: 
1. Check backend server is running
2. Check console for errors
3. Verify API URL in .env file

### Issue: Results not showing
**Cause**: Backend error calculating score  
**Solution**: Check backend console logs for errors

### Issue: Timer not working
**Cause**: JavaScript interval issue  
**Solution**: Force close and restart app

---

## 📊 Sample Test Data

### Expected Quiz Questions
- **CS101** (Programming in C): 5 questions about C programming
- **CS102** (Data Structures): 5 questions about stacks, queues, trees
- **CS202** (DBMS): 5 questions about SQL, normalization
- All other subjects: 5 questions each

### Scoring System
- **Pass**: 60% or higher (3+ correct answers out of 5)
- **Fail**: Below 60% (less than 3 correct)
- **Percentage**: (Correct / Total) × 100

### Time Tracking
- Timer starts when quiz begins
- Timer stops when quiz is submitted
- Time displayed in MM:SS format
- Time saved in database (seconds)

---

## 🎯 Success Criteria

✅ All quizzes are unlocked (no lock icons)  
✅ Can view quiz questions  
✅ Can select answers  
✅ Timer works correctly  
✅ Can navigate between questions  
✅ Previous answers are preserved  
✅ Question navigator shows status  
✅ Progress bar updates  
✅ Submit validation works  
✅ Results show correct score  
✅ Answer review displays properly  
✅ Quiz history saves attempts  
✅ Can retake quizzes  
✅ Backend logging shows no errors  

---

## 📝 Quick API Tests (Optional)

### Test API Endpoints Manually

1. **Get Available Quizzes**
   ```bash
   curl http://192.168.0.103:3000/api/quiz/available/1
   ```
   Expected: List of quizzes with `hasQuiz: true`

2. **Get Quiz Questions**
   ```bash
   curl http://192.168.0.103:3000/api/quiz/questions/CS101?count=5
   ```
   Expected: 5 questions without correct answers

3. **Submit Quiz** (using Postman or curl)
   ```bash
   curl -X POST http://192.168.0.103:3000/api/quiz/submit/1/CS101 \
     -H "Content-Type: application/json" \
     -d '{"answers":[{"questionId":1,"answer":"B"},{"questionId":2,"answer":"A"}],"timeSpent":120}'
   ```
   Expected: Score and results with correct answers

4. **Get Quiz History**
   ```bash
   curl http://192.168.0.103:3000/api/quiz/history/1
   ```
   Expected: List of past attempts with statistics

---

## 🎉 Expected User Experience

1. **Seamless Flow**: Student can browse → start → take → submit → review quiz in one smooth flow
2. **Clear Feedback**: Visual indicators show answered/unanswered questions
3. **Automatic Scoring**: No manual grading needed
4. **Immediate Results**: Score and answers shown right after submission
5. **History Tracking**: All attempts saved and viewable
6. **Retake Ability**: Can take same quiz multiple times

---

## ✅ Final Checklist

Before marking as complete, verify:

- [ ] Backend server running without errors
- [ ] All quiz routes accessible
- [ ] quizzes.json loaded (check backend logs for "📚 Loaded quizzes for subjects")
- [ ] Student profile exists with subjects
- [ ] Can view quiz list
- [ ] All quizzes show as unlocked
- [ ] Can start a quiz
- [ ] Timer works
- [ ] Can select answers
- [ ] Can navigate between questions
- [ ] Can submit quiz
- [ ] Results display correctly
- [ ] Answer review shows correct/wrong answers
- [ ] Quiz history saves attempts
- [ ] Can retake quizzes
- [ ] No console errors in frontend or backend

---

## 🎊 Success!

If all tests pass, the quiz system is **100% functional** and ready for use! 🚀
