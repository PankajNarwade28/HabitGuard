# Data Management Guide

## Overview
All educational content (courses, quizzes, and recommendations) is stored in **separate JSON files** in the `backend/data` folder. This architecture allows you to easily modify, add, or update content without changing any code.

## 📁 File Structure

```
backend/data/
├── courses.json          → Academic course structures (degrees, semesters, subjects)
├── quizzes.json          → Quiz questions for each subject
└── recommendations.json  → Course recommendations from online platforms
```

---

## 1️⃣ courses.json - Academic Course Structure

**Purpose**: Define what subjects exist in each degree program and semester.

### Structure
```json
{
  "courseType": {
    "degreeName": {
      "totalSemesters": number,
      "semesters": {
        "1": [
          {
            "code": "CS101",
            "name": "Programming in C",
            "credits": 4
          }
        ]
      }
    }
  }
}
```

### Course Types Available
- **undergraduate**: BTech, BE, BSc programs
- **postgraduate**: MTech, MCA, MSc programs  
- **diploma**: 3-year diploma courses

### Current Degrees
- Computer Science Engineering
- Information Technology
- Mechanical Engineering
- Master of Computer Applications (MCA)
- Master of Technology (M.Tech)

### How to Add a New Subject

**Example**: Adding "Quantum Computing" to MCA Semester 5

```json
"postgraduate": {
  "Master of Computer Applications": {
    "semesters": {
      "5": [
        { "code": "MCA501", "name": "Advanced Algorithms", "credits": 4 },
        { "code": "MCA502", "name": "Distributed Systems", "credits": 4 },
        { "code": "MCA503", "name": "Quantum Computing", "credits": 3 }  // NEW
      ]
    }
  }
}
```

### How to Add a New Degree

**Example**: Adding MBA program

```json
{
  "postgraduate": {
    "Master of Computer Applications": { ... },
    "Master of Business Administration": {
      "totalSemesters": 4,
      "semesters": {
        "1": [
          { "code": "MBA101", "name": "Principles of Management", "credits": 4 },
          { "code": "MBA102", "name": "Business Economics", "credits": 4 },
          { "code": "MBA103", "name": "Organizational Behavior", "credits": 3 }
        ],
        "2": [
          { "code": "MBA201", "name": "Marketing Management", "credits": 4 },
          { "code": "MBA202", "name": "Financial Management", "credits": 4 }
        ]
      }
    }
  }
}
```

---

## 2️⃣ quizzes.json - Quiz Questions

**Purpose**: Store quiz questions for subjects with multiple-choice answers.

### Structure
```json
{
  "quizzes": [
    {
      "subjectCode": "CS101",
      "subjectName": "Programming in C",
      "questions": [
        {
          "id": 1,
          "question": "What is the correct syntax to print 'Hello World' in C?",
          "options": [
            "echo('Hello World');",
            "printf('Hello World');",
            "print('Hello World');",
            "cout << 'Hello World';"
          ],
          "correctAnswer": 1,  // Index of correct option (0-based)
          "difficulty": "Easy"
        }
      ]
    }
  ]
}
```

### Current Subjects (14 total)
- CS101, CS102, CS103, CS104, CS201, CS202, CS203, CS204, CS205, CS301, CS310
- MCA102, MCA201, MCA204
- MT103, MT201

### How to Add Questions to Existing Subject

**Example**: Adding a 6th question to CS101

```json
{
  "subjectCode": "CS101",
  "subjectName": "Programming in C",
  "questions": [
    { "id": 1, "question": "...", "options": [...], "correctAnswer": 1, "difficulty": "Easy" },
    { "id": 2, "question": "...", "options": [...], "correctAnswer": 2, "difficulty": "Easy" },
    { "id": 3, "question": "...", "options": [...], "correctAnswer": 2, "difficulty": "Medium" },
    { "id": 4, "question": "...", "options": [...], "correctAnswer": 0, "difficulty": "Medium" },
    { "id": 5, "question": "...", "options": [...], "correctAnswer": 3, "difficulty": "Hard" },
    {
      "id": 6,
      "question": "Which operator is used to access structure members?",
      "options": [".", "->", "::", "&"],
      "correctAnswer": 0,
      "difficulty": "Easy"
    }
  ]
}
```

### How to Add a New Subject Quiz

**Example**: Adding quiz for MCA503 (Quantum Computing)

```json
{
  "quizzes": [
    {
      "subjectCode": "CS101",
      "subjectName": "Programming in C",
      "questions": [...]
    },
    {
      "subjectCode": "MCA503",
      "subjectName": "Quantum Computing",
      "questions": [
        {
          "id": 1,
          "question": "What is a qubit?",
          "options": [
            "A classical bit",
            "A quantum bit that can be 0, 1, or both",
            "A unit of quantum entanglement",
            "A quantum gate"
          ],
          "correctAnswer": 1,
          "difficulty": "Easy"
        },
        {
          "id": 2,
          "question": "What is quantum superposition?",
          "options": [
            "Multiple quantum states existing simultaneously",
            "Quantum entanglement",
            "Quantum measurement",
            "Quantum interference"
          ],
          "correctAnswer": 0,
          "difficulty": "Medium"
        }
      ]
    }
  ]
}
```

---

## 3️⃣ recommendations.json - Course Recommendations

**Purpose**: Suggest online courses from platforms like NPTEL, Coursera, Udemy for each subject.

### Structure
```json
{
  "recommendations": [
    {
      "subjectCode": "MCA301",
      "subjectName": "Advanced Web Technologies",
      "courses": [
        {
          "platform": "NPTEL",
          "title": "Cloud Computing and Distributed Systems",
          "url": "https://nptel.ac.in/courses/106105167",
          "instructor": "Prof. Soumya Kanti Ghosh",
          "difficulty": "Advanced",
          "duration": "12 weeks"
        }
      ]
    }
  ]
}
```

### Current Subjects (19 total)
- CS101-CS104, CS201-CS209, CS301, CS310
- MCA102, MCA201, MCA204, MCA301-MCA305
- MT103, MT201

### How to Add Recommendations to Existing Subject

**Example**: Adding a 4th course to MCA301

```json
{
  "subjectCode": "MCA301",
  "subjectName": "Advanced Web Technologies",
  "courses": [
    {
      "platform": "NPTEL",
      "title": "Cloud Computing and Distributed Systems",
      "url": "https://nptel.ac.in/courses/106105167",
      "instructor": "Prof. Soumya Kanti Ghosh",
      "difficulty": "Advanced",
      "duration": "12 weeks"
    },
    {
      "platform": "Udemy",
      "title": "Complete Web Development Bootcamp",
      "url": "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
      "instructor": "Angela Yu",
      "difficulty": "Beginner",
      "duration": "65 hours"
    },
    {
      "platform": "Coursera",
      "title": "Full-Stack Web Development with React",
      "url": "https://www.coursera.org/specializations/full-stack-react",
      "instructor": "Jogesh K. Muppala",
      "difficulty": "Intermediate",
      "duration": "4 months"
    },
    {
      "platform": "edX",
      "title": "CS50's Web Programming with Python and JavaScript",
      "url": "https://www.edx.org/course/cs50s-web-programming-with-python-and-javascript",
      "instructor": "Brian Yu",
      "difficulty": "Intermediate",
      "duration": "12 weeks"
    }
  ]
}
```

### How to Add Recommendations for New Subject

**Example**: Adding recommendations for MCA503 (Quantum Computing)

```json
{
  "recommendations": [
    {
      "subjectCode": "CS101",
      "subjectName": "Programming in C",
      "courses": [...]
    },
    {
      "subjectCode": "MCA503",
      "subjectName": "Quantum Computing",
      "courses": [
        {
          "platform": "NPTEL",
          "title": "Introduction to Quantum Computing",
          "url": "https://nptel.ac.in/courses/106106198",
          "instructor": "Prof. Prabha Mandayam",
          "difficulty": "Advanced",
          "duration": "12 weeks"
        },
        {
          "platform": "Coursera",
          "title": "Quantum Computing Fundamentals",
          "url": "https://www.coursera.org/learn/quantum-computing-fundamentals",
          "instructor": "Dr. Kesha Shah",
          "difficulty": "Intermediate",
          "duration": "4 weeks"
        },
        {
          "platform": "edX",
          "title": "Quantum Mechanics and Quantum Computation",
          "url": "https://www.edx.org/course/quantum-mechanics-and-quantum-computation",
          "instructor": "Umesh Vazirani",
          "difficulty": "Advanced",
          "duration": "10 weeks"
        }
      ]
    }
  ]
}
```

---

## 🔄 How Changes Take Effect

### With Nodemon (Development)
The backend runs with **nodemon**, which automatically watches for file changes:
- ✅ Edit any JSON file → Save
- ✅ Nodemon detects the change → Restarts server automatically
- ✅ New data is loaded → No manual restart needed

### Without Nodemon (Production)
If running with `node server.js`:
- ⚠️ Edit JSON file → Save
- ⚠️ Manually restart backend: `Ctrl+C` then `node server.js`

---

## 🎯 Best Practices

### 1. Subject Code Consistency
- Use same subject code across **all three files**
- Example: If you add `MCA503` in `courses.json`, also add it to `quizzes.json` and `recommendations.json`

### 2. JSON Validation
- Always validate JSON syntax before saving
- Use VS Code's built-in JSON validator (shows errors in red)
- Or use online tools: [jsonlint.com](https://jsonlint.com)

### 3. Question Count
- Each subject should have at least **5 questions** for a complete quiz
- Recommended: 5-10 questions per subject
- Mix difficulty levels: 2 Easy + 2 Medium + 1 Hard

### 4. Recommendation Count
- Each subject should have at least **2-3 course recommendations**
- Include diverse platforms (NPTEL, Coursera, Udemy, edX)
- Mix difficulty levels for different learners

### 5. Data Backup
- Before making major changes, backup these files:
  ```powershell
  Copy-Item backend\data\*.json backend\data\backup\
  ```

---

## 📝 Common Scenarios

### Scenario 1: Add a New Semester to Existing Degree
**Goal**: Add MCA Semester 5 subjects

1. **Edit `courses.json`**:
   ```json
   "Master of Computer Applications": {
     "totalSemesters": 5,  // Update from 4 to 5
     "semesters": {
       "5": [
         { "code": "MCA501", "name": "Advanced Algorithms", "credits": 4 },
         { "code": "MCA502", "name": "Distributed Systems", "credits": 4 }
       ]
     }
   }
   ```

2. **Edit `quizzes.json`** (add 5 questions for each new subject):
   ```json
   {
     "subjectCode": "MCA501",
     "subjectName": "Advanced Algorithms",
     "questions": [/* 5 questions */]
   }
   ```

3. **Edit `recommendations.json`** (add 3 courses for each new subject):
   ```json
   {
     "subjectCode": "MCA501",
     "subjectName": "Advanced Algorithms",
     "courses": [/* 3 courses */]
   }
   ```

### Scenario 2: Update Question Difficulty
**Goal**: Make CS101 questions harder

1. Open `backend/data/quizzes.json`
2. Find `"subjectCode": "CS101"`
3. Change `"difficulty": "Easy"` → `"difficulty": "Medium"`
4. Update question content if needed
5. Save → Nodemon auto-reloads

### Scenario 3: Add Platform to Recommendations
**Goal**: Add YouTube courses to recommendations

1. Open `backend/data/recommendations.json`
2. Find any subject (e.g., `MCA301`)
3. Add new course object:
   ```json
   {
     "platform": "YouTube",
     "title": "Web Development Full Course",
     "url": "https://youtube.com/watch?v=...",
     "instructor": "freeCodeCamp",
     "difficulty": "Beginner",
     "duration": "10 hours"
   }
   ```
4. Save → Nodemon auto-reloads

---

## 🚀 Quick Reference

| Action | Files to Edit | Required Fields |
|--------|--------------|-----------------|
| Add new subject to semester | `courses.json` | code, name, credits |
| Add quiz for subject | `quizzes.json` | subjectCode, subjectName, questions (min 5) |
| Add course recommendations | `recommendations.json` | subjectCode, subjectName, courses (min 2) |
| Add new degree program | `courses.json` | courseType, degreeName, totalSemesters, semesters |
| Update question difficulty | `quizzes.json` | difficulty field |
| Add new platform recommendation | `recommendations.json` | platform, title, url, instructor, difficulty, duration |

---

## ⚠️ Important Notes

1. **Subject Code Linking**: The `subjectCode` field links data across all three files:
   - `courses.json` defines the subject exists
   - `quizzes.json` provides quiz questions for it
   - `recommendations.json` suggests online courses for it

2. **Automatic Reloading**: Backend automatically reloads when JSON files change (nodemon)

3. **No Code Changes Needed**: You can add unlimited subjects, questions, and recommendations by just editing JSON files

4. **Frontend Auto-Fetches**: The mobile app fetches fresh data from backend on every load

5. **Database Independence**: These JSON files are separate from the MySQL database (which stores user profiles, quiz attempts, study time, etc.)

---

## 🛠️ Testing Your Changes

After editing any JSON file:

1. **Check Backend Logs**:
   ```
   Server running on port 3000
   ✅ Successfully connected to MySQL database
   📚 Loaded quizzes for subjects: [CS101, CS102, ..., MCA503]  // Should include your new subjects
   ```

2. **Test API Endpoints**:
   ```powershell
   # Test courses
   Invoke-RestMethod -Uri "http://192.168.0.103:3000/api/student/courses"
   
   # Test recommendations (replace 4 with actual user ID)
   Invoke-RestMethod -Uri "http://192.168.0.103:3000/api/student/recommendations/4"
   
   # Test quizzes
   Invoke-RestMethod -Uri "http://192.168.0.103:3000/api/student/quizzes/4"
   ```

3. **Check Mobile App**:
   - Open student section in app
   - Navigate to Courses → Should see new subjects
   - Navigate to Recommendations → Should see new courses
   - Start Quiz → Should see new questions

---

## 📞 Troubleshooting

### Issue: Changes not reflecting in app
**Solution**: 
1. Check if nodemon restarted backend (look for restart message in terminal)
2. Clear app cache: Stop Expo → Run `npx expo start --clear`
3. Restart backend manually if needed

### Issue: JSON syntax error
**Solution**:
1. Backend will show error: `SyntaxError: Unexpected token`
2. Use VS Code's JSON validator (red underlines)
3. Check for: missing commas, extra commas, unclosed brackets/braces

### Issue: Subject not showing in app
**Solution**:
1. Verify subject exists in all 3 files with same `subjectCode`
2. Check if user's profile includes this subject in database
3. Test API endpoint directly to confirm backend returns data

---

## 🎓 Summary

✅ **courses.json** = What subjects exist (academic structure)  
✅ **quizzes.json** = Quiz questions for each subject  
✅ **recommendations.json** = Online course suggestions for each subject

All three files work together to provide complete educational content for students. Edit any file → Save → Backend auto-reloads → App fetches fresh data. No code changes ever needed! 🚀
