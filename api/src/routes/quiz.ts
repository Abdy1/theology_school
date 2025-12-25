import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Submit quiz attempt
router.post('/:quizId/attempt', async (req, res) => {
  const quizId = Number(req.params.quizId);
  const { userId, courseId, moduleId } = req.body || {};

  if (!quizId || !userId || !courseId || !moduleId) {
    return res.status(400).json({ message: 'quizId, userId, courseId, and moduleId are required' });
  }

  try {
    // Get quiz questions
    const quizResult = await pool.query(
      'SELECT * FROM "QuizQuestion" WHERE id = $1',
      [quizId]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const questions = quizResult.rows;
    const totalQuestions = questions.length;

    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question: any) => {
      if (req.body.answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Number(((correctAnswers / totalQuestions) * 100).toFixed(2));
    const percentage = Number(((correctAnswers / totalQuestions) * 100).toFixed(2));
    const passed = score >= 70; // 70% passing grade

    // Store quiz attempt
    const result = await pool.query(
      `INSERT INTO "QuizAttempt" 
       ("userId", "courseId", "moduleId", "quizId", "score", "totalQuestions", "correctAnswers", "percentage", "passed", "attemptNumber", "completedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       RETURNING *`,
      [userId, courseId, moduleId, quizId, score, totalQuestions, correctAnswers, percentage, passed, 1]
    );

    // Update enrollment quiz grade (40% weight)
    await pool.query(
      `UPDATE "Enrollment" 
       SET "quizGrade" = $1 
       WHERE "userId" = $2 AND "courseId" = $3`,
      [percentage, userId, courseId]
    );

    res.status(201).json({
      score,
      totalQuestions,
      correctAnswers,
      percentage,
      passed,
      attemptNumber: 1
    });
  } catch (error) {
    console.error('Quiz attempt error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get quiz attempts for a user
router.get('/:courseId/attempts/:userId', async (req, res) => {
  const courseId = Number(req.params.courseId);
  const userId = Number(req.params.userId);

  if (!courseId || !userId) {
    return res.status(400).json({ message: 'courseId and userId are required' });
  }

  try {
    const result = await pool.query(
      `SELECT qa.*, cm.title as "moduleTitle"
       FROM "QuizAttempt" qa
       JOIN "CourseModule" cm ON qa."moduleId" = cm.id
       WHERE qa."courseId" = $1 AND qa."userId" = $2
       ORDER BY qa."completedAt" DESC`,
      [courseId, userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get quiz attempts error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
