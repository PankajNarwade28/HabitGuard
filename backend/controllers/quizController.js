const db = require('../config/db');

// Sample quiz questions (in production, these would come from database)
const sampleQuizQuestions = {
  'CS101': [
    {
      question: 'Which of the following is not a valid C variable name?',
      option_a: 'int_number',
      option_b: '2nd_value',
      option_c: 'value_2',
      option_d: '_count',
      correct_answer: 'B',
      difficulty: 'Easy',
      explanation: 'Variable names in C cannot start with a digit.'
    },
    {
      question: 'What is the size of int data type in C (on a 32-bit system)?',
      option_a: '2 bytes',
      option_b: '4 bytes',
      option_c: '8 bytes',
      option_d: '1 byte',
      correct_answer: 'B',
      difficulty: 'Easy',
      explanation: 'On a 32-bit system, int typically occupies 4 bytes.'
    }
  ],
  'CS102': [
    {
      question: 'What is the time complexity of searching in a binary search tree (average case)?',
      option_a: 'O(1)',
      option_b: 'O(n)',
      option_c: 'O(log n)',
      option_d: 'O(n log n)',
      correct_answer: 'C',
      difficulty: 'Medium',
      explanation: 'Binary search tree has O(log n) average case search complexity due to its divide-and-conquer approach.'
    },
    {
      question: 'Which data structure uses LIFO (Last In First Out) principle?',
      option_a: 'Queue',
      option_b: 'Stack',
      option_c: 'Array',
      option_d: 'Linked List',
      correct_answer: 'B',
      difficulty: 'Easy',
      explanation: 'Stack follows LIFO principle where the last element inserted is the first to be removed.'
    }
  ],
  'CS202': [
    {
      question: 'Which SQL command is used to retrieve data from a database?',
      option_a: 'GET',
      option_b: 'FETCH',
      option_c: 'SELECT',
      option_d: 'RETRIEVE',
      correct_answer: 'C',
      difficulty: 'Easy',
      explanation: 'SELECT is the SQL command used to query and retrieve data from database tables.'
    },
    {
      question: 'What is a foreign key in a relational database?',
      option_a: 'A unique identifier for a table',
      option_b: 'A key from another table that creates a relationship',
      option_c: 'An encrypted key',
      option_d: 'A primary key in a foreign table',
      correct_answer: 'B',
      difficulty: 'Medium',
      explanation: 'A foreign key is a field in one table that refers to the primary key in another table, establishing relationships.'
    }
  ],
  'CS302': [
    {
      question: 'Which algorithm is commonly used for classification in Machine Learning?',
      option_a: 'K-Means',
      option_b: 'Decision Tree',
      option_c: 'PCA',
      option_d: 'Apriori',
      correct_answer: 'B',
      difficulty: 'Medium',
      explanation: 'Decision Tree is a supervised learning algorithm used for classification tasks.'
    },
    {
      question: 'What is overfitting in machine learning?',
      option_a: 'Model performs well on both training and test data',
      option_b: 'Model performs poorly on training data',
      option_c: 'Model performs well on training but poorly on test data',
      option_d: 'Model cannot learn from data',
      correct_answer: 'C',
      difficulty: 'Medium',
      explanation: 'Overfitting occurs when a model learns the training data too well, including noise, and fails to generalize to new data.'
    }
  ]
};

// Get quiz questions for a subject
exports.getQuizQuestions = async (req, res) => {
  try {
    const { subjectCode } = req.params;
    const { count = 5 } = req.query;

    // Get questions from sample data (in production, fetch from database)
    let questions = sampleQuizQuestions[subjectCode];

    if (!questions || questions.length === 0) {
      // If no questions for specific subject, provide general questions
      return res.json({
        success: true,
        message: 'No specific quiz available for this subject yet',
        questions: []
      });
    }

    // Shuffle and limit questions
    questions = questions.sort(() => 0.5 - Math.random()).slice(0, parseInt(count));

    // Remove correct_answer and explanation from response (sent after submission)
    const quizQuestions = questions.map((q, index) => ({
      id: index + 1,
      question: q.question,
      options: {
        A: q.option_a,
        B: q.option_b,
        C: q.option_c,
        D: q.option_d
      },
      difficulty: q.difficulty
    }));

    res.json({
      success: true,
      subjectCode,
      totalQuestions: quizQuestions.length,
      questions: quizQuestions
    });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch quiz questions' 
    });
  }
};

// Submit quiz and calculate score
exports.submitQuiz = async (req, res) => {
  try {
    const { userId, subjectCode } = req.params;
    const { answers, timeSpent } = req.body; // answers: [{questionId: 1, answer: 'B'}]

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid answers format' 
      });
    }

    // Get correct answers
    const questions = sampleQuizQuestions[subjectCode] || [];
    
    if (questions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quiz not found for this subject' 
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = answers.map((ans, index) => {
      const question = questions[index];
      if (!question) return null;

      const isCorrect = ans.answer === question.correct_answer;
      if (isCorrect) correctAnswers++;

      return {
        questionId: ans.questionId || index + 1,
        question: question.question,
        userAnswer: ans.answer,
        correctAnswer: question.correct_answer,
        isCorrect,
        explanation: question.explanation
      };
    }).filter(r => r !== null);

    const scorePercentage = (correctAnswers / questions.length) * 100;
    const passed = scorePercentage >= 60;

    // Save quiz attempt to database
    try {
      await db.query(
        `INSERT INTO quiz_attempts 
        (user_id, subject_code, total_questions, correct_answers, score_percentage, time_taken_seconds, passed) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, subjectCode, questions.length, correctAnswers, scorePercentage, timeSpent || 0, passed]
      );
    } catch (dbError) {
      console.error('Error saving quiz attempt:', dbError);
      // Continue even if DB save fails
    }

    res.json({
      success: true,
      score: {
        totalQuestions: questions.length,
        correctAnswers,
        wrongAnswers: questions.length - correctAnswers,
        scorePercentage: Math.round(scorePercentage * 10) / 10,
        passed,
        timeSpent: timeSpent || 0
      },
      results
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit quiz' 
    });
  }
};

// Get quiz history for a user
exports.getQuizHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const [attempts] = await db.query(
      `SELECT * FROM quiz_attempts 
      WHERE user_id = ? 
      ORDER BY attempted_at DESC 
      LIMIT 20`,
      [userId]
    );

    // Calculate statistics
    const stats = {
      totalAttempts: attempts.length,
      averageScore: 0,
      passedCount: 0,
      failedCount: 0,
      totalTimeSpent: 0
    };

    if (attempts.length > 0) {
      stats.averageScore = Math.round(
        (attempts.reduce((sum, a) => sum + a.score_percentage, 0) / attempts.length) * 10
      ) / 10;
      stats.passedCount = attempts.filter(a => a.passed).length;
      stats.failedCount = attempts.length - stats.passedCount;
      stats.totalTimeSpent = attempts.reduce((sum, a) => sum + a.time_taken_seconds, 0);
    }

    res.json({
      success: true,
      stats,
      attempts
    });
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch quiz history' 
    });
  }
};

// Get available quiz subjects for a student
exports.getAvailableQuizzes = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get student's subjects
    const [profiles] = await db.query(
      'SELECT profile_id FROM student_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }

    const [subjects] = await db.query(
      'SELECT * FROM student_subjects WHERE profile_id = ?',
      [profiles[0].profile_id]
    );

    // Map to available quizzes
    const availableQuizzes = subjects.map(subject => ({
      subjectCode: subject.subject_code,
      subjectName: subject.subject_name,
      semester: subject.semester,
      hasQuiz: !!sampleQuizQuestions[subject.subject_code],
      questionCount: sampleQuizQuestions[subject.subject_code]?.length || 0
    }));

    res.json({
      success: true,
      quizzes: availableQuizzes
    });
  } catch (error) {
    console.error('Error fetching available quizzes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch available quizzes' 
    });
  }
};

module.exports = exports;
