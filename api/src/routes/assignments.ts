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

    // Update enrollment assignment grade (60% weight)
    if (updatedSubmission.status === 'APPROVED' && typeof updatedSubmission.gradePercent === 'number') {
      await pool.query(
        `UPDATE "Enrollment" 
         SET "assignmentGrade" = $1 
         WHERE "id" = $2`,
        [updatedSubmission.gradePercent, updatedSubmission.enrollmentId]
      );

      // Calculate final grade (60% assignments + 40% quizzes)
      const enrollmentResult = await pool.query(
        `SELECT "assignmentGrade", "quizGrade" FROM "Enrollment" WHERE id = $1`,
        [updatedSubmission.enrollmentId]
      );

      if (enrollmentResult.rows.length > 0) {
        const enrollment = enrollmentResult.rows[0];
        const assignmentGrade = enrollment.assignmentGrade || 0;
        const quizGrade = enrollment.quizGrade || 0;
        const finalGrade = (assignmentGrade * 0.6) + (quizGrade * 0.4);
        
        // Determine letter grade
        let gradeLetter = 'F';
        if (finalGrade >= 90) gradeLetter = 'A';
        else if (finalGrade >= 80) gradeLetter = 'B';
        else if (finalGrade >= 70) gradeLetter = 'C';
        else if (finalGrade >= 60) gradeLetter = 'D';

        await pool.query(
          `UPDATE "Enrollment" 
           SET "finalGrade" = $1, "gradeLetter" = $2, "updatedAt" = NOW()
           WHERE id = $3`,
          [finalGrade, gradeLetter, updatedSubmission.enrollmentId]
        );
      }
    }

    res.json(updatedSubmission);
  } catch (err) {
    console.error('Update assignment submission error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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

  if (!userId || !courseId) {
    return res.status(400).json({ message: 'userId and courseId are required' });
  }

  try {
    // Get enrollment with final grade
    const enrollmentResult = await pool.query(
      `SELECT e.*, u.name as "userName", c.title as "courseTitle"
       FROM "Enrollment" e
       JOIN "User" u ON e."userId" = u.id
       JOIN "Course" c ON e."courseId" = c.id
       WHERE e."userId" = $1 AND e."courseId" = $2`,
      [Number(userId), Number(courseId)]
    );

    if (enrollmentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    const enrollment = enrollmentResult.rows[0];

    // Check if user has completed all requirements
    if (enrollment.finalGrade === null || enrollment.finalGrade < 70) {
      return res.status(400).json({ 
        message: 'Course not completed or grade below 70%',
        finalGrade: enrollment.finalGrade 
      });
    }

    // Check if certificate already issued
    if (enrollment.certificateIssued) {
      return res.status(400).json({ message: 'Certificate already issued' });
    }

    // Generate certificate data
    const certificateData = {
      studentName: enrollment.userName,
      courseTitle: enrollment.courseTitle,
      finalGrade: enrollment.finalGrade,
      gradeLetter: enrollment.gradeLetter,
      completedAt: new Date().toISOString(),
      certificateId: `CERT-${Date.now()}-${userId}-${courseId}`
    };

    // Mark certificate as issued
    await pool.query(
      `UPDATE "Enrollment" 
       SET "certificateIssued" = TRUE, "updatedAt" = NOW()
       WHERE "id" = $1`,
      [enrollment.id]
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


