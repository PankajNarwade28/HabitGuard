# 🚀 Quiz System - Quick Start Guide

## ⚡ Quick Setup (5 Minutes)

### Step 1: Database Setup (1 min)
```bash
# Connect to MySQL
mysql -u root -p

# Select database
USE habitguard;

# Run migration (creates quiz_attempts table)
SOURCE backend/database/quiz-attempts-migration.sql;

# Verify table exists
SHOW TABLES LIKE 'quiz_attempts';
```

### Step 2: Start Backend (1 min)
```bash
# Navigate to backend folder
cd backend

# Start server
node server.js
```

**Expected Output:**
```
✅ Connected to MySQL database
📚 Loaded quizzes for subjects: [
  'CS101', 'CS102', 'CS202', 'CS301', 'CS302',
  'CS310', 'CS308', 'CS208', 'CS305', 'CS304',
  'MCA102', 'MCA204', 'MT103', 'MT201'
]
🚀 Server running on port 3000

📝 Quiz routes:
  GET  /api/quiz/available/:userId
  GET  /api/quiz/questions/:subjectCode
  POST /api/quiz/submit/:userId/:subjectCode
  GET  /api/quiz/history/:userId
```

### Step 3: Start Frontend (1 min)
```bash
# In a new terminal, navigate to project root
cd HabitGuard

# Start Expo
npx expo start
```

### Step 4: Test Quiz (2 min)
1. Open app on your device/emulator
2. Login as a student
3. Go to **Profile** → **View Quizzes**
4. Click any subject → Click **Start Quiz**
5. Answer questions → Click **Submit Quiz**
6. View results!

---

## 🧪 Quick Test Scenarios

### Test 1: Verify All Quizzes Unlocked (30 seconds)
```
1. Profile → View Quizzes
2. ✅ Check: All subjects show "X Questions" (not locked)
3. ✅ Check: No lock icons visible
```

### Test 2: Take Complete Quiz (2 minutes)
```
1. Click "Programming in C"
2. Click "Start Quiz"
3. Answer all 5 questions
4. Click "Submit Quiz"
5. ✅ Check: Score shows correctly (e.g., 80%)
6. ✅ Check: Pass/Fail status correct (60% threshold)
7. ✅ Check: Answer review shows all questions
```

### Test 3: Verify Timer Works (1 minute)
```
1. Start any quiz
2. ✅ Check: Timer shows 0:00 initially
3. Wait 30 seconds
4. ✅ Check: Timer shows 0:30
5. Submit quiz
6. ✅ Check: Results show correct time (0:30 or more)
```

### Test 4: Test Navigation (1 minute)
```
1. Start quiz
2. Answer question 1, click "Next"
3. ✅ Check: Goes to question 2
4. Click "Previous"
5. ✅ Check: Back to question 1, answer still selected
6. Click number "5" in question navigator
7. ✅ Check: Jumps to question 5
```

### Test 5: Verify Automatic Marking (1 minute)
```
1. Take quiz and purposely get 3 correct, 2 wrong
2. Submit quiz
3. ✅ Check: Score shows 60%
4. ✅ Check: "Passed!" message (exactly 60%)
5. ✅ Check: Answer review shows:
   - 3 green cards (correct)
   - 2 red cards (wrong)
   - Correct answers displayed for wrong ones
```

---

## 🎯 One-Command Test

### Run All API Endpoints (Verify Backend)
```bash
# Get available quizzes (replace :userId with actual ID)
curl http://localhost:3000/api/quiz/available/1

# Get questions for CS101
curl http://localhost:3000/api/quiz/questions/CS101?count=5

# Submit quiz (example)
curl -X POST http://localhost:3000/api/quiz/submit/1/CS101 \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"questionId": 1, "answer": "B"},
      {"questionId": 2, "answer": "A"},
      {"questionId": 3, "answer": "D"},
      {"questionId": 4, "answer": "C"},
      {"questionId": 5, "answer": "B"}
    ],
    "timeSpent": 120
  }'

# Get quiz history
curl http://localhost:3000/api/quiz/history/1
```

---

## 📊 Expected Results

### Available Quizzes Response
```json
{
  "success": true,
  "quizzes": [
    {
      "subjectCode": "CS101",
      "subjectName": "Programming in C",
      "semester": 1,
      "hasQuiz": true,
      "questionCount": 5
    }
    // ... 13 more subjects
  ]
}
```

### Quiz Questions Response
```json
{
  "success": true,
  "subjectCode": "CS101",
  "totalQuestions": 5,
  "questions": [
    {
      "id": 1,
      "question": "What is...",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "difficulty": "Easy"
    }
    // ... 4 more questions
  ]
}
```

### Submit Quiz Response
```json
{
  "success": true,
  "score": {
    "totalQuestions": 5,
    "correctAnswers": 4,
    "wrongAnswers": 1,
    "scorePercentage": 80,
    "passed": true,
    "timeSpent": 120
  },
  "results": [
    {
      "questionId": 1,
      "question": "What is...",
      "userAnswer": "B",
      "correctAnswer": "B",
      "isCorrect": true,
      "explanation": "The correct answer is..."
    }
    // ... 4 more results
  ]
}
```

---

## 🐛 Common Issues & Fixes

### Issue 1: Backend doesn't start
**Error:** "Cannot find module './data/quizzes.json'"
**Fix:**
```bash
# Verify file exists
ls backend/data/quizzes.json

# If missing, check project structure
```

### Issue 2: No quizzes showing in app
**Cause:** Student profile not set up
**Fix:**
```
1. Go to Profile
2. Click "Set Up Education"
3. Add university, course, semester
4. Add at least one subject
5. Return to quizzes
```

### Issue 3: "Quiz not available yet"
**Cause:** Subject code mismatch
**Fix:**
```
1. Check backend logs: "Loaded quizzes for subjects: [...]"
2. Ensure subject codes match between:
   - student_subjects table (database)
   - quizzes.json (backend/data/)
3. Example: If subject is "CS101" in database, must be "CS101" in JSON
```

### Issue 4: Submit doesn't work
**Cause:** Network connection or API URL issue
**Fix:**
```
1. Check backend is running (port 3000)
2. Verify .env file has correct API_URL
3. Check frontend console for errors
4. Test API manually with curl (see above)
```

### Issue 5: Timer doesn't start
**Cause:** JavaScript interval not clearing
**Fix:**
```
1. Force close app
2. Restart app
3. Try again
```

---

## ✅ Success Checklist

Before marking complete, verify:

**Backend:**
- [ ] Server starts without errors
- [ ] Logs show "Loaded quizzes for subjects: [14 subjects]"
- [ ] All 4 API endpoints respond correctly
- [ ] quiz_attempts table exists in database

**Frontend:**
- [ ] Can view quiz list
- [ ] All quizzes show as unlocked
- [ ] Can start a quiz
- [ ] Timer starts automatically
- [ ] Can select answers
- [ ] Can navigate between questions
- [ ] Can submit quiz
- [ ] Results display correctly
- [ ] Answer review shows all questions
- [ ] Can view quiz history

**Functionality:**
- [ ] Score calculated correctly
- [ ] Pass/Fail determined correctly (60% threshold)
- [ ] Time tracked accurately
- [ ] Attempts saved to database
- [ ] Can retake quizzes
- [ ] No console errors

---

## 📱 Mobile Testing

### On Physical Device (Recommended)
```bash
# 1. Ensure device and computer on same WiFi
# 2. Start Expo
npx expo start

# 3. Scan QR code with:
#    - iOS: Camera app
#    - Android: Expo Go app
```

### On Emulator
```bash
# iOS (Mac only)
npx expo start --ios

# Android
npx expo start --android
```

---

## 🎉 You're Done!

If all tests pass, the quiz system is fully functional!

### What You Have:
✅ 14 subjects with 70 questions  
✅ Complete quiz-taking interface  
✅ Automatic marking system  
✅ Real-time timer  
✅ Detailed results and answer review  
✅ Quiz history tracking  
✅ All quizzes unlocked  

### Next Steps:
1. Add more questions (currently 5 per subject)
2. Add difficulty-based filtering
3. Add leaderboards
4. Add quiz scheduling
5. Export results as PDF

---

## 📞 Need Help?

### Check Documentation:
- `QUIZ_SYSTEM_COMPLETE.md` - Full implementation details
- `QUIZ_TESTING_GUIDE.md` - Comprehensive testing guide
- `QUIZ_FLOW_DIAGRAM.md` - Visual flow diagram
- `QUIZ_IMPLEMENTATION_SUMMARY.md` - Overview

### Debug Steps:
1. Check backend console for errors
2. Check frontend console (React Native Debugger)
3. Verify API_URL in .env matches backend IP
4. Test API endpoints manually with curl
5. Check database tables exist

---

## 🚀 Ready to Go!

The quiz system is **100% complete** and ready for production use!

**Estimated Setup Time:** 5 minutes  
**Estimated Test Time:** 5 minutes  
**Total:** 10 minutes to full functionality! 🎊
