import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

router.post('/', async (req, res) => {
  const { userId, courseId } = req.body || {};
  if (!userId || !courseId) {
    return res.status(400).json({ message: 'userId and courseId are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO "Enrollment" ("userId", "courseId", status, "progressPercent", "createdAt", "updatedAt") VALUES ($1, $2, $3, 0, NOW(), NOW()) RETURNING *',
      [Number(userId), Number(courseId), 'ACTIVE']
    );
    const enrollment = result.rows[0];

    res.status(201).json(enrollment);
  } catch (err) {
    console.error('Create enrollment error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/my', async (req, res) => {
  const userIdParam = req.query.userId;
  const userId = Number(userIdParam);
  if (!userId) {
    return res.status(400).json({ message: 'userId query param is required' });
  }

  try {
    const result = await pool.query(
      'SELECT e.*, c.title FROM "Enrollment" e LEFT JOIN "Course" c ON e."courseId" = c.id WHERE e."userId" = $1',
      [userId]
    );
    const list = result.rows;

    console.log('DEBUG: Enrollment data for user', userId, ':', JSON.stringify(list, null, 2));

    const view = list.map((e: any) => ({
      enrollmentId: e.id,
      courseId: e.courseId,
      title: e.title ?? '',
      status: e.status,
      progressPercent: e.progressPercent,
      finalGrade: e.finalGrade,
      gradeLetter: e.gradeLetter,
      earnedPoints: e.earnedPoints,
      totalPoints: e.totalPoints,
      certificateIssued: e.certificateIssued,
      certificateId: e.certificateId
    }));
    
    console.log('DEBUG: Processed enrollment view:', JSON.stringify(view, null, 2));
    
    res.json(view);
   
   
  } catch (error) {
    console.error('List enrollments error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/:enrollmentId/progress', async (req, res) => {
  const enrollmentId = Number(req.params.enrollmentId);
  const { progressPercent } = req.body || {};

  if (!enrollmentId || progressPercent === undefined) {
    return res.status(400).json({ message: 'enrollmentId and progressPercent are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE "Enrollment" SET "progressPercent" = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      [progressPercent, enrollmentId]
    );
    const updatedEnrollment = result.rows[0];
    res.json(updatedEnrollment);
  } catch (error: any) {
    console.error('Update progress error', error);
    if (error.code === '23503') {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get enrollments by course (for instructors to see their students)
router.get('/course/:courseId', async (req, res) => {
  const courseId = Number(req.params.courseId);
  
  if (!courseId) {
    return res.status(400).json({ message: 'courseId is required' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        e.*,
        u.name as "userName",
        u.email as "userEmail",
        c.title as "courseTitle"
      FROM "Enrollment" e
      JOIN "User" u ON e."userId" = u.id
      JOIN "Course" c ON e."courseId" = c.id
      WHERE e."courseId" = $1
      ORDER BY e."createdAt" DESC
    `, [courseId]);
    
    const enrollments = result.rows;
    res.json(enrollments);
  } catch (error) {
    console.error('Get enrollments by course error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all enrollments (for instructors to see all their students)
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.*,
        u.name as "userName",
        u.email as "userEmail",
        c.title as "courseTitle",
        c."instructorId"
      FROM "Enrollment" e
      JOIN "User" u ON e."userId" = u.id
      JOIN "Course" c ON e."courseId" = c.id
      ORDER BY e."createdAt" DESC
    `);
    
    const enrollments = result.rows;
    res.json(enrollments);
  } catch (error) {
    console.error('Get all enrollments error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Assignment submission routes
router.get('/submissions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.*,
        u.name as "studentName",
        u.email as "studentEmail",
        c.title as "courseTitle",
        m.title as "moduleTitle",
        a.title as "assignmentTitle",
        a."passingPercent" as "assignmentPassingPercent"
      FROM "AssignmentSubmission" s
      JOIN "User" u ON s."userId" = u.id
      JOIN "Enrollment" e ON s."enrollmentId" = e.id
      JOIN "Course" c ON e."courseId" = c.id
      JOIN "CourseModule" m ON s."moduleId" = m.id
      JOIN "Assignment" a ON s."assignmentId" = a.id
      ORDER BY s."submittedAt" DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get submissions error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/submissions/:submissionId', async (req, res) => {
  const submissionId = Number(req.params.submissionId);

  if (!submissionId) {
    return res.status(400).json({ message: 'submissionId is required' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        s.*,
        u.name as "studentName",
        u.email as "studentEmail",
        c.title as "courseTitle",
        m.title as "moduleTitle",
        a.title as "assignmentTitle",
        a."passingPercent" as "assignmentPassingPercent"
      FROM "AssignmentSubmission" s
      JOIN "User" u ON s."userId" = u.id
      JOIN "Enrollment" e ON s."enrollmentId" = e.id
      JOIN "Course" c ON e."courseId" = c.id
      JOIN "CourseModule" m ON s."moduleId" = m.id
      JOIN "Assignment" a ON s."assignmentId" = a.id
      WHERE s.id = $1
    `, [submissionId]);
    
    const submission = result.rows[0];
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Get submission error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/submissions/:submissionId/review', async (req, res) => {
  const submissionId = Number(req.params.submissionId);
  const { status, gradePercent, reviewText } = req.body || {};

  if (!submissionId || !status) {
    return res.status(400).json({ message: 'submissionId and status are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE "AssignmentSubmission" SET status = $1, "gradePercent" = $2, "reviewText" = $3, "reviewedAt" = NOW() WHERE id = $4 RETURNING *',
      [status, gradePercent || null, reviewText || null, submissionId]
    );
    
    const updatedSubmission = result.rows[0];
    res.json(updatedSubmission);
  } catch (error) {
    console.error('Review submission error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
