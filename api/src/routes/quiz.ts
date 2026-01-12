import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Submit quiz attempt
router.post('/:quizId/attempt', async (req, res) => {
  const quizId = Number(req.params.quizId);
  const { userId, courseId, moduleId, answers } = req.body || {};

  console.log('Quiz API request:', { quizId, userId, courseId, moduleId, answers });

  if (!quizId || !userId || !courseId || !moduleId) {
    console.log('Quiz API: Missing required fields');
    return res.status(400).json({ message: 'quizId, userId, courseId, and moduleId are required' });
  }

  try {
    // Check if user already attempted this quiz
    const existingAttempt = await pool.query(
      'SELECT COUNT(*) as attempt_count FROM "QuizAttempt" WHERE "moduleId" = $1 AND "userId" = $2',
      [moduleId, userId]
    );

    if (parseInt(existingAttempt.rows[0].attempt_count) > 0) {
      return res.status(400).json({ message: 'You have already attempted this quiz. No retakes are allowed.' });
    }

    // Get all quiz questions for this module
    const quizResult = await pool.query(
      'SELECT * FROM "QuizQuestion" WHERE "moduleId" = $1',
      [moduleId]
    );

    console.log('Quiz API: Found questions:', quizResult.rows.length);

    if (quizResult.rows.length === 0) {
      console.log('Quiz API: Quiz not found');
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const questions = quizResult.rows;
    const totalQuestions = questions.length;

    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question: any) => {
      if (answers[question.id] === question.correctIndex) {
        correctAnswers++;
      }
    });

    const score = Number(((correctAnswers / totalQuestions) * 100).toFixed(2));
    const percentage = Number(((correctAnswers / totalQuestions) * 100).toFixed(2));
    const passed = score >= 70; // 70% passing grade

    // Get quiz points
    const quizPoints = questions[0]?.points || 10;
    const earnedPoints = (percentage / 100) * quizPoints;

    // Store quiz attempt for each question
    const attempts = [];
    for (const question of questions) {
      console.log('Quiz API: Inserting attempt for question:', question.id);
      
      const result = await pool.query(
        `INSERT INTO "QuizAttempt" 
         ("userId", "courseId", "moduleId", "quizId", "score", "totalQuestions", "correctAnswers", "percentage", "passed", "attemptNumber", "completedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         RETURNING *`,
        [userId, courseId, moduleId, question.id, score, totalQuestions, correctAnswers, percentage, passed, 1]
      );
      
      attempts.push(result.rows[0]);
      console.log('Quiz API: Insert successful, ID:', result.rows[0].id);
    }

    // Update enrollment points if quiz passed
    if (passed) {
      // Get enrollment ID first
      const enrollmentResult = await pool.query(
        'SELECT id FROM "Enrollment" WHERE "userId" = $1 AND "courseId" = $2',
        [userId, courseId]
      );

      if (enrollmentResult.rows.length > 0) {
        const enrollmentId = enrollmentResult.rows[0].id;
        
        await pool.query(
          `UPDATE "Enrollment" 
           SET "earnedPoints" = "earnedPoints" + $1
           WHERE id = $2`,
          [earnedPoints, enrollmentId]
        );

        // Recalculate total course points and final grade
        await recalculateQuizEnrollmentGrade(enrollmentId);
      }
    }

    res.status(201).json({
      score,
      totalQuestions,
      correctAnswers,
      percentage,
      passed,
      earnedPoints,
      attemptNumber: 1
    });
  } catch (error) {
    console.error('Quiz attempt error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper function to recalculate enrollment grade for quiz
async function recalculateQuizEnrollmentGrade(enrollmentId: number) {
  try {
    // Get all approved assignments with their points
    const assignmentResult = await pool.query(
      `SELECT s."gradePercent", a.points
       FROM "AssignmentSubmission" s
       JOIN "ModuleAssignment" a ON s."assignmentId" = a.id
       WHERE s."enrollmentId" = $1 AND s.status = 'APPROVED'`,
      [enrollmentId]
    );

    // Get all quiz attempts with their points
    const quizResult = await pool.query(
      `SELECT qa.percentage, q.points
       FROM "QuizAttempt" qa
       JOIN "QuizQuestion" q ON qa."quizId" = q.id
       WHERE qa."userId" = (SELECT "userId" FROM "Enrollment" WHERE id = $1) 
       AND qa."courseId" = (SELECT "courseId" FROM "Enrollment" WHERE id = $1) 
       AND qa.passed = true`,
      [enrollmentId]
    );

    // Calculate total earned points and total possible points
    let earnedPoints = 0;
    let totalPoints = 0;

    assignmentResult.rows.forEach(row => {
      earnedPoints += (row.gradePercent / 100) * row.points;
      totalPoints += row.points;
    });

    quizResult.rows.forEach(row => {
      earnedPoints += (row.percentage / 100) * row.points;
      totalPoints += row.points;
    });

    // Calculate final grade as percentage
    const finalGrade = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    // Determine letter grade
    let gradeLetter = 'F';
    if (finalGrade >= 90) gradeLetter = 'A';
    else if (finalGrade >= 80) gradeLetter = 'B';
    else if (finalGrade >= 70) gradeLetter = 'C';
    else if (finalGrade >= 60) gradeLetter = 'D';

    // Update enrollment
    await pool.query(
      `UPDATE "Enrollment" 
       SET "earnedPoints" = $1, "totalPoints" = $2, "finalGrade" = $3, "gradeLetter" = $4, "updatedAt" = NOW()
       WHERE id = $5`,
      [earnedPoints, totalPoints, finalGrade, gradeLetter, enrollmentId]
    );
  } catch (error) {
    console.error('Recalculate quiz enrollment grade error', error);
  }
}

// Check if user already attempted quiz for this module
router.get('/:moduleId/attempt/:userId', async (req, res) => {
  const moduleId = Number(req.params.moduleId);
  const userId = Number(req.params.userId);

  if (!moduleId || !userId) {
    return res.status(400).json({ message: 'moduleId and userId are required' });
  }

  try {
    const result = await pool.query(
      'SELECT COUNT(*) as attempt_count FROM "QuizAttempt" WHERE "moduleId" = $1 AND "userId" = $2',
      [moduleId, userId]
    );

    const hasAttempted = parseInt(result.rows[0].attempt_count) > 0;
    
    res.json({ hasAttempted, attemptCount: parseInt(result.rows[0].attempt_count) });
  } catch (error) {
    console.error('Check quiz attempt error', error);
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
