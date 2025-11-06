const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Load quiz data from JSON file
const quizzesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/quizzes.json'), 'utf8')
);

// Convert quiz data to a more accessible format
const quizQuestions = {};
quizzesData.quizzes.forEach(quiz => {
  quizQuestions[quiz.subjectCode] = quiz.questions.map(q => ({
    question: q.question,
    option_a: q.options[0],
    option_b: q.options[1],
    option_c: q.options[2],
    option_d: q.options[3],
    correct_answer: ['A', 'B', 'C', 'D'][q.correctAnswer],
    difficulty: q.difficulty,
    explanation: `The correct answer is ${q.options[q.correctAnswer]}`
  }));
});

console.log('📚 Loaded quizzes for subjects:', Object.keys(quizQuestions));

// Get quiz questions for a subject
exports.getQuizQuestions = async (req, res) => {
  try {
    const { subjectCode } = req.params;
    const { count = 5 } = req.query;

    console.log(`📝 Getting questions for subject: ${subjectCode}`);
    console.log(`📚 Available subjects:`, Object.keys(quizQuestions));

    // Get questions from cached object
    let questions = quizQuestions[subjectCode];

    if (!questions || questions.length === 0) {
      // Try to find in original data
      const quizData = quizzesData.quizzes.find(q => q.subjectCode === subjectCode);
      if (quizData && quizData.questions) {
        console.log(`✅ Found ${quizData.questions.length} questions in JSON for ${subjectCode}`);
        // Convert to the expected format
        questions = quizData.questions.map(q => ({
          question: q.question,
          option_a: q.options[0],
          option_b: q.options[1],
          option_c: q.options[2],
          option_d: q.options[3],
          correct_answer: ['A', 'B', 'C', 'D'][q.correctAnswer],
          difficulty: q.difficulty,
          explanation: `The correct answer is ${q.options[q.correctAnswer]}`
        }));
      } else {
        console.log(`❌ No questions found for ${subjectCode}`);
        return res.json({
          success: true,
          message: 'No specific quiz available for this subject yet',
          questions: []
        });
      }
    }

    // Shuffle and limit questions
    const shuffledQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, parseInt(count));

    // Remove correct_answer and explanation from response (sent after submission)
    const responseQuestions = shuffledQuestions.map((q, index) => ({
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

    console.log(`✅ Sending ${responseQuestions.length} questions for ${subjectCode}`);

    res.json({
      success: true,
      subjectCode,
      totalQuestions: responseQuestions.length,
      questions: responseQuestions
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
    const questions = quizQuestions[subjectCode] || [];
    
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
      // Get subject name from quizzes data
      const subjectName = quizzesData.quizzes.find(q => q.subjectCode === subjectCode)?.subjectName || subjectCode;
      
      await db.query(
        `INSERT INTO quiz_attempts 
        (user_id, subject_name, total_questions, correct_answers, score_percentage, time_taken_seconds) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, subjectName, questions.length, correctAnswers, scorePercentage, timeSpent || 0]
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
      // Calculate passed count (60% or higher)
      stats.passedCount = attempts.filter(a => a.score_percentage >= 60).length;
      stats.failedCount = attempts.length - stats.passedCount;
      stats.totalTimeSpent = attempts.reduce((sum, a) => sum + (a.time_taken_seconds || 0), 0);
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

    // Return all quizzes from JSON file - no profile required
    // Only return quizzes that actually have questions
    const availableQuizzes = quizzesData.quizzes
      .filter(quiz => quiz.questions && quiz.questions.length > 0)
      .map((quiz, index) => ({
        subjectCode: quiz.subjectCode,
        subjectName: quiz.subjectName,
        semester: Math.ceil((index + 1) / 2), // Distribute across semesters
        hasQuiz: true, // All quizzes unlocked
        questionCount: quiz.questions.length
      }));

    console.log(`✅ Returning ${availableQuizzes.length} quizzes`);

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
