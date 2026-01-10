import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

router.get('/summary', async (req, res) => {
  try {
    // Get user counts by role
    const userStatsResult = await pool.query(`
      SELECT 
        role,
        COUNT(*) as count
      FROM "User" 
      GROUP BY role
    `);

    // Get course counts
    const courseStatsResult = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM "Course" 
      GROUP BY status
    `);

    // Get total enrollments
    const enrollmentResult = await pool.query(`
      SELECT COUNT(*) as total_enrollments
      FROM "Enrollment"
    `);

    // Get completion stats
    const completionResult = await pool.query(`
      SELECT 
        COUNT(*) as total_enrollments,
        COUNT(CASE WHEN "progressPercent" = 100 THEN 1 END) as completed,
        ROUND(AVG("progressPercent"), 2) as avg_progress
      FROM "Enrollment"
    `);

    const userStats = userStatsResult.rows.reduce((acc: any, row: any) => {
      acc[row.role] = parseInt(row.count);
      return acc;
    }, {});

    const courseStats = courseStatsResult.rows.reduce((acc: any, row: any) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});

    const summary = {
      users: {
        total: (userStats.student || 0) + (userStats.teacher || 0) + (userStats.admin || 0),
        students: userStats.student || 0,
        teachers: userStats.teacher || 0,
        admins: userStats.admin || 0
      },
      courses: {
        total: Object.values(courseStats).reduce((sum: number, count: any) => sum + count, 0),
        active: courseStats.ACTIVE || 0,
        pending: courseStats.PENDING || 0,
        draft: courseStats.DRAFT || 0
      },
      enrollments: {
        total: parseInt(enrollmentResult.rows[0].total_enrollments),
        completed: parseInt(completionResult.rows[0].completed),
        average_progress: parseFloat(completionResult.rows[0].avg_progress) || 0
      }
    };

    res.json(summary);
  } catch (err) {
    console.error('Admin summary error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/teachers', async (req, res) => {
  const { name, email, password, phoneNumber } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const result = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    const existing = result.rows[0];
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const insertResult = await pool.query(
      'INSERT INTO "User" (name, email, password, "phoneNumber", role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, password, phoneNumber, 'teacher']
    );
    const user = insertResult.rows[0];

    return res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error('Create teacher error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/courses/pending', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, "durationMinutes", level, price FROM "Course" WHERE status = $1',
      ['PENDING']
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error('Get pending courses error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/courses/:courseId/approve', async (req, res) => {
  const courseId = Number(req.params.courseId);
  
  if (!courseId) {
    return res.status(400).json({ message: 'Invalid course id' });
  }

  try {
    const result = await pool.query(
      'UPDATE "Course" SET status = $1 WHERE id = $2 RETURNING *',
      ['ACTIVE', courseId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Approve course error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/courses/:courseId/reject', async (req, res) => {
  const courseId = Number(req.params.courseId);
  
  if (!courseId) {
    return res.status(400).json({ message: 'Invalid course id' });
  }

  try {
    const result = await pool.query(
      'UPDATE "Course" SET status = $1 WHERE id = $2 RETURNING *',
      ['REJECTED', courseId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Reject course error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get enrolled users (users with at least one enrollment)
router.get('/users/enrolled', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u."phoneNumber",
        COUNT(e.id) as enrollment_count
      FROM "User" u
      INNER JOIN "Enrollment" e ON u.id = e."userId"
      GROUP BY u.id, u.name, u.email, u.role, u."phoneNumber"
      ORDER BY u.id DESC
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Get enrolled users error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get non-enrolled users (users with no enrollments)
router.get('/users/non-enrolled', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u."phoneNumber"
      FROM "User" u
      LEFT JOIN "Enrollment" e ON u.id = e."userId"
      WHERE e.id IS NULL AND u.role IN ('student')
      ORDER BY u.id DESC
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Get non-enrolled users error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
