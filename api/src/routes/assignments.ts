import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a submission for an assignment (student side)
router.post('/:assignmentId/submissions', async (req, res) => {
  const assignmentId = Number(req.params.assignmentId);
  const { enrollmentId, userId, answerText, attachmentUrl } = req.body || {};

  if (!assignmentId || !enrollmentId || !userId) {
    return res.status(400).json({ message: 'assignmentId, enrollmentId and userId are required' });
  }

  try {
    // Check if submission already exists
    const existingSubmission = await pool.query(
      'SELECT id FROM "AssignmentSubmission" WHERE "assignmentId" = $1 AND "enrollmentId" = $2 AND "userId" = $3',
      [assignmentId, Number(enrollmentId), Number(userId)]
    );

    if (existingSubmission.rows.length > 0) {
      return res.status(409).json({ message: 'You have already submitted this assignment' });
    }

    const result = await pool.query(
      `INSERT INTO "AssignmentSubmission"
       ("assignmentId", "enrollmentId", "userId", "answerText", "attachmentUrl", "weight", "status", "submittedAt")
       VALUES ($1, $2, $3, $4, $5, 1.0, 'PENDING', NOW())
       RETURNING *`,
      [assignmentId, Number(enrollmentId), Number(userId), answerText ?? '', attachmentUrl ?? '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Create assignment submission error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current student's submission for an assignment (latest one)
router.get('/:assignmentId/my', async (req, res) => {
  const assignmentId = Number(req.params.assignmentId);
  const { enrollmentId, userId } = req.query || {};

  if (!assignmentId || !enrollmentId || !userId) {
    return res.status(400).json({ message: 'assignmentId, enrollmentId and userId are required' });
  }

  try {
    const result = await pool.query(
      `
      SELECT s.*, a."passingPercent"
      FROM "AssignmentSubmission" s
      JOIN "ModuleAssignment" a ON s."assignmentId" = a.id
      WHERE s."assignmentId" = $1
        AND s."enrollmentId" = $2
        AND s."userId" = $3
      ORDER BY s."submittedAt" DESC
      LIMIT 1
      `,
      [assignmentId, Number(enrollmentId), Number(userId)],
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    const row = result.rows[0];
    const passed =
      row.status === 'APPROVED' &&
      typeof row.gradePercent === 'number' &&
      row.gradePercent >= row.passingPercent;

    res.json({
      id: row.id,
      status: row.status,
      gradePercent: row.gradePercent,
      submittedAt: row.submittedAt,
      reviewedAt: row.reviewedAt,
      answerText: row.answerText,
      attachmentUrl: row.attachmentUrl,
      passed,
    });
  } catch (err) {
    console.error('Get my assignment submission error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// List submissions for instructor dashboard
// Optional filters: courseId, moduleId, status
router.get('/submissions', async (req, res) => {
  const { courseId, moduleId, status } = req.query || {};

  try {
    const params: any[] = [];
    const where: string[] = [];

    if (courseId) {
      params.push(Number(courseId));
      where.push(`e."courseId" = $${params.length}`);
    }

    if (moduleId) {
      params.push(Number(moduleId));
      where.push(`a."moduleId" = $${params.length}`);
    }

    if (status) {
      params.push(String(status));
      where.push(`s.status = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const result = await pool.query(
      `
      SELECT
        s.id,
        s.status,
        s."gradePercent",
        s."submittedAt",
        s."reviewedAt",
        s."answerText",
        s."attachmentUrl",
        s."assignmentId",
        s."enrollmentId",
        s."userId",
        u.name       AS "studentName",
        u.email      AS "studentEmail",
        e."courseId" AS "courseId",
        c.title      AS "courseTitle",
        a."moduleId" AS "moduleId",
        m.title      AS "moduleTitle",
        a.title      AS "assignmentTitle",
        a."passingPercent" AS "assignmentPassingPercent"
      FROM "AssignmentSubmission" s
      JOIN "User" u             ON s."userId" = u.id
      JOIN "Enrollment" e       ON s."enrollmentId" = e.id
      JOIN "Course" c           ON e."courseId" = c.id
      JOIN "ModuleAssignment" a ON s."assignmentId" = a.id
      JOIN "CourseModule" m     ON a."moduleId" = m.id
      ${whereSql}
      ORDER BY s."submittedAt" DESC
      `,
      params,
    );

    res.json(result.rows);
  } catch (err) {
    console.error('List assignment submissions error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a single submission in detail (for review)
router.get('/submissions/:submissionId', async (req, res) => {
  const submissionId = Number(req.params.submissionId);
  if (!submissionId) {
    return res.status(400).json({ message: 'Invalid submission id' });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        s.*,
        u.name       AS "studentName",
        u.email      AS "studentEmail",
        e."courseId" AS "courseId",
        c.title      AS "courseTitle",
        a."moduleId" AS "moduleId",
        m.title      AS "moduleTitle",
        a.title      AS "assignmentTitle",
        a.description AS "assignmentDescription",
        a.instructions AS "assignmentInstructions",
        a."passingPercent" AS "assignmentPassingPercent"
      FROM "AssignmentSubmission" s
      JOIN "User" u             ON s."userId" = u.id
      JOIN "Enrollment" e       ON s."enrollmentId" = e.id
      JOIN "Course" c           ON e."courseId" = c.id
      JOIN "ModuleAssignment" a ON s."assignmentId" = a.id
      JOIN "CourseModule" m     ON a."moduleId" = m.id
      WHERE s.id = $1
      `,
      [submissionId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get assignment submission error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Grade / approve / reject a submission (instructor side)
router.patch('/submissions/:submissionId', async (req, res) => {
  const submissionId = Number(req.params.submissionId);
  const { status, gradePercent } = req.body || {};

  if (!submissionId) {
    return res.status(400).json({ message: 'Invalid submission id' });
  }

  if (status && !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const fields: string[] = [];
    const params: any[] = [];

    if (typeof gradePercent === 'number') {
      params.push(gradePercent);
      fields.push(`"gradePercent" = $${params.length}`);
    }

    if (status) {
      params.push(status);
      fields.push(`status = $${params.length}`);
    }

    if (!fields.length) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    params.push(new Date());
    fields.push(`"reviewedAt" = $${params.length}`);

    params.push(submissionId);

    const result = await pool.query(
      `UPDATE "AssignmentSubmission"
       SET ${fields.join(', ')}, "updatedAt" = NOW()
       WHERE id = $${params.length}
       RETURNING *`,
      params,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const updatedSubmission = result.rows[0];

    // Update enrollment points when assignment is approved
    if (updatedSubmission.status === 'APPROVED' && typeof updatedSubmission.gradePercent === 'number') {
      // Get assignment points
      const assignmentResult = await pool.query(
        'SELECT points FROM "ModuleAssignment" WHERE id = $1',
        [updatedSubmission.assignmentId]
      );

      if (assignmentResult.rows.length > 0) {
        const assignmentPoints = assignmentResult.rows[0].points;
        const earnedPoints = (updatedSubmission.gradePercent / 100) * assignmentPoints;

        // Update enrollment with earned points
        await pool.query(
          `UPDATE "Enrollment" 
           SET "earnedPoints" = "earnedPoints" + $1
           WHERE id = $2`,
          [earnedPoints, updatedSubmission.enrollmentId]
        );

        // Recalculate total course points and final grade
        await recalculateEnrollmentGrade(updatedSubmission.enrollmentId);
      }
    }

    res.json(updatedSubmission);
  } catch (err) {
    console.error('Update assignment submission error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper function to recalculate enrollment grade
async function recalculateEnrollmentGrade(enrollmentId: number) {
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
    console.error('Recalculate enrollment grade error', error);
  }
}

// Review submission endpoint (for instructor dashboard)
router.patch('/submissions/:submissionId/review', async (req, res) => {
  const submissionId = Number(req.params.submissionId);
  const { status, gradePercent, reviewText } = req.body || {};

  if (!submissionId || !status) {
    return res.status(400).json({ message: 'submissionId and status are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE "AssignmentSubmission" SET status = $1, "gradePercent" = $2::numeric, "reviewedAt" = NOW() WHERE id = $3 RETURNING *',
      [status, gradePercent, submissionId]
    );
    
    const updatedSubmission = result.rows[0];
    res.json(updatedSubmission);
  } catch (error) {
    console.error('Review submission error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate certificate for completed course
router.post('/certificate/generate', async (req, res) => {
  const { userId, courseId } = req.body || {};

  console.log('Certificate API request:', { userId, courseId });

  if (!userId || !courseId) {
    console.log('Certificate API: Missing userId or courseId');
    return res.status(400).json({ message: 'userId and courseId are required' });
  }

  try {
    // Get enrollment with final grade and points
    const enrollmentResult = await pool.query(
      `SELECT e.*, u.name as "userName", c.title as "courseTitle"
       FROM "Enrollment" e
       JOIN "User" u ON e."userId" = u.id
       JOIN "Course" c ON e."courseId" = c.id
       WHERE e."userId" = $1 AND e."courseId" = $2`,
      [Number(userId), Number(courseId)]
    );

    console.log('Certificate API: Enrollment query result rows:', enrollmentResult.rows.length);

    if (enrollmentResult.rows.length === 0) {
      console.log('Certificate API: Enrollment not found');
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    const enrollment = enrollmentResult.rows[0];
    
    console.log('Certificate API: Enrollment data:', {
      finalGrade: enrollment.finalGrade,
      certificateIssued: enrollment.certificateIssued,
      earnedPoints: enrollment.earnedPoints,
      totalPoints: enrollment.totalPoints
    });

    // If finalGrade is null, 0, or NaN, calculate it manually
    if (enrollment.finalGrade === null || enrollment.finalGrade === '0.00' || Number(enrollment.finalGrade) === 0 || isNaN(Number(enrollment.earnedPoints)) || isNaN(Number(enrollment.totalPoints))) {
      console.log('Certificate API: Calculating final grade manually');
      
      // Calculate total earned and possible points
      const assignmentPointsResult = await pool.query(
        `SELECT COALESCE(SUM(CASE WHEN s.status = 'APPROVED' THEN a.points ELSE 0 END), 0) as earnedPoints,
                COALESCE(SUM(a.points), 0) as totalPoints
         FROM "AssignmentSubmission" s
         JOIN "ModuleAssignment" a ON s."assignmentId" = a.id
         JOIN "CourseModule" cm ON a."moduleId" = cm.id
         WHERE s."userId" = $1 AND cm."courseId" = $2`,
        [Number(userId), Number(courseId)]
      );

      const quizPointsResult = await pool.query(
        `SELECT COALESCE(SUM(
           CASE WHEN qa.passed = true THEN q.points ELSE 0 END
         ), 0) as earnedPoints,
                COALESCE(SUM(q.points), 0) as totalPoints
         FROM "QuizAttempt" qa
         JOIN "QuizQuestion" q ON qa."quizId" = q.id
         WHERE qa."userId" = $1 AND qa."courseId" = $2`,
        [Number(userId), Number(courseId)]
      );

      const assignmentPoints = assignmentPointsResult.rows[0];
      const quizPoints = quizPointsResult.rows[0];
      
      console.log('Certificate API: Assignment points:', assignmentPoints);
      console.log('Certificate API: Quiz points:', quizPoints);
      
      const totalEarnedPoints = Number(assignmentPoints.earnedpoints || 0) + Number(quizPoints.earnedpoints || 0);
      const totalPossiblePoints = Number(assignmentPoints.totalpoints || 0) + Number(quizPoints.totalpoints || 0);
      
      const calculatedFinalGrade = totalPossiblePoints > 0 ? (totalEarnedPoints / totalPossiblePoints) * 100 : 0;
      
      console.log('Certificate API: Manual grade calculation', {
        totalEarnedPoints,
        totalPossiblePoints,
        calculatedFinalGrade
      });

      // Update enrollment with calculated grade
      await pool.query(
        `UPDATE "Enrollment" 
         SET "earnedPoints" = $1, "totalPoints" = $2, "finalGrade" = $3, "updatedAt" = NOW()
         WHERE "userId" = $4 AND "courseId" = $5`,
        [totalEarnedPoints, totalPossiblePoints, calculatedFinalGrade, Number(userId), Number(courseId)]
      );

      enrollment.finalGrade = calculatedFinalGrade;
      enrollment.earnedPoints = totalEarnedPoints;
      enrollment.totalPoints = totalPossiblePoints;
    }

    // Check if user has completed all requirements
    if (enrollment.finalGrade === null || enrollment.finalGrade < 70) {
      console.log('Certificate API: Grade check failed', { finalGrade: enrollment.finalGrade });
      return res.status(400).json({ 
        message: 'Course not completed or grade below 70%',
        finalGrade: enrollment.finalGrade,
      });
    }

    // Check if certificate already issued
    if (enrollment.certificateIssued) {
      return res.status(400).json({ message: 'Certificate already issued' });
    }

    // Get detailed breakdown for certificate
    const assignmentBreakdown = await pool.query(
      `SELECT a.title, s."gradePercent", a.points, (s."gradePercent"/100 * a.points) as "earnedPoints"
       FROM "AssignmentSubmission" s
       JOIN "ModuleAssignment" a ON s."assignmentId" = a.id
       WHERE s."enrollmentId" = $1 AND s.status = 'APPROVED'
       ORDER BY a.title`,
      [enrollment.id]
    );

    const quizBreakdown = await pool.query(
      `SELECT q."questionText" as title, qa.percentage as "gradePercent", q.points, (qa.percentage/100 * q.points) as "earnedPoints"
       FROM "QuizAttempt" qa
       JOIN "QuizQuestion" q ON qa."quizId" = q.id
       WHERE qa."userId" = $1 AND qa."courseId" = $2 AND qa.passed = true
       ORDER BY q."questionText"`,
      [Number(userId), Number(courseId)]
    );

    // Generate certificate data with points breakdown
    const certificateId = `CERT-${Date.now()}-${userId}-${courseId}`;
    const certificateData = {
      studentName: enrollment.userName,
      courseTitle: enrollment.courseTitle,
      finalGrade: enrollment.finalGrade,
      gradeLetter: enrollment.gradeLetter,
      earnedPoints: enrollment.earnedPoints,
      totalPoints: enrollment.totalPoints,
      completedAt: new Date().toISOString(),
      certificateId: certificateId,
      breakdown: {
        assignments: assignmentBreakdown.rows,
        quizzes: quizBreakdown.rows
      }
    };

    // Mark certificate as issued and store certificate ID
    await pool.query(
      `UPDATE "Enrollment" 
       SET "certificateIssued" = TRUE, "certificateId" = $1, "updatedAt" = NOW()
       WHERE "id" = $2`,
      [certificateId, enrollment.id]
    );

    res.json({
      success: true,
      certificate: certificateData,
      message: 'Certificate generated successfully'
    });
  } catch (error) {
    console.error('Generate certificate error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;


