import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Get courses for a specific instructor
router.get('/instructor/:instructorId', async (req, res) => {
  const instructorId = Number(req.params.instructorId);
  
  console.log('API: Fetching courses for instructorId:', instructorId);
  
  if (!instructorId) {
    console.log('API: Invalid instructor id');
    return res.status(400).json({ message: 'Invalid instructor id' });
  }

  try {
    const result = await pool.query(
      'SELECT id, title, description, "durationMinutes", level, price, status FROM "Course" WHERE "instructorId" = $1',
      [instructorId]
    );
    const courses = result.rows;
    
    console.log('API: Found courses:', courses.length);
    console.log('API: Courses data:', courses);

    const summaries = courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      durationMinutes: c.durationMinutes,
      level: c.level,
      price: Number(c.price),
      status: c.status,
    }));

    res.json(summaries);
  } catch (err) {
    console.error('Get instructor courses error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, "durationMinutes", level, price, status FROM "Course"'
    );
    const courses = result.rows;

    const summaries = courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      durationMinutes: c.durationMinutes,
      level: c.level,
      price: Number(c.price),
      status: c.status,
    }));

    res.json(summaries);
  } catch (err) {
    console.error('List courses error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:courseId', async (req, res) => {
  const id = Number(req.params.courseId);
  if (!id) {
    return res.status(400).json({ message: 'Invalid course id' });
  }

  try {
    const courseResult = await pool.query(
      'SELECT * FROM "Course" WHERE id = $1',
      [id]
    );
    const course = courseResult.rows[0];

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get modules with their related data
    const modulesResult = await pool.query(
      'SELECT * FROM "CourseModule" WHERE "courseId" = $1 ORDER BY "orderIndex" ASC',
      [id]
    );
    
    const modules = [];
    for (const module of modulesResult.rows) {
      // Get videos for this module
      const videosResult = await pool.query(
        'SELECT * FROM "ModuleVideo" WHERE "moduleId" = $1 ORDER BY "orderIndex" ASC',
        [module.id]
      );
      
      // Get materials for this module
      const materialsResult = await pool.query(
        'SELECT * FROM "ModuleMaterial" WHERE "moduleId" = $1',
        [module.id]
      );
      
      // Get questions for this module
      const questionsResult = await pool.query(
        'SELECT * FROM "QuizQuestion" WHERE "moduleId" = $1',
        [module.id]
      );

      // Get assignment for this module (if any)
      const assignmentResult = await pool.query(
        'SELECT * FROM "ModuleAssignment" WHERE "moduleId" = $1 LIMIT 1',
        [module.id]
      );
      const assignment = assignmentResult.rows[0];
      
      modules.push({
        id: module.id,
        title: module.title,
        orderIndex: module.orderIndex,
        videoUrls: videosResult.rows.map(v => v.youtubeUrl),
        materials: materialsResult.rows.map(mat => ({
          id: mat.id,
          title: mat.title,
          fileType: mat.fileType,
          url: mat.url,
        })),
        questions: questionsResult.rows.map(q => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options,
          correctIndex: q.correctIndex,
        })),
        assignment: assignment ? {
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          instructions: assignment.instructions,
          passingPercent: assignment.passingPercent,
        } : null,
      });
    }

    const dto = {
      id: course.id,
      title: course.title,
      description: course.description,
      durationMinutes: course.durationMinutes,
      level: course.level,
      price: Number(course.price),
      status: course.status,
      modules: modules,
    };

    res.json(dto);
  } catch (err) {
    console.error('Get course error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  const { title, description, durationMinutes, level, price, status, modules, instructorId } = req.body || {};

  if (!title || !description || !durationMinutes || !level || !modules || !instructorId) {
    return res.status(400).json({ message: 'Missing required fields including instructorId' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert course with instructor ID
    const courseResult = await client.query(
      'INSERT INTO "Course" (title, description, "durationMinutes", level, price, status, "instructorId") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, durationMinutes, level, price, status || 'PENDING', instructorId]
    );
    const course = courseResult.rows[0];

    // Insert modules and their content
    for (const moduleData of modules) {
      const moduleResult = await client.query(
        'INSERT INTO "CourseModule" (title, "courseId", "orderIndex") VALUES ($1, $2, $3) RETURNING *',
        [moduleData.title, course.id, moduleData.orderIndex]
      );
      const module = moduleResult.rows[0];

      // Insert videos
      for (let i = 0; i < moduleData.videoUrls.length; i++) {
        await client.query(
          'INSERT INTO "ModuleVideo" ("moduleId", "youtubeUrl", "orderIndex") VALUES ($1, $2, $3)',
          [module.id, moduleData.videoUrls[i], i]
        );
      }

      // Insert materials
      for (const material of moduleData.materials) {
        await client.query(
          'INSERT INTO "ModuleMaterial" ("moduleId", title, url, "fileType") VALUES ($1, $2, $3, $4)',
          [module.id, material.title, material.url, material.fileType]
        );
      }

      // Insert quiz questions
      for (const question of moduleData.questions) {
        await client.query(
          'INSERT INTO "QuizQuestion" ("moduleId", "questionText", options, "correctIndex", points) VALUES ($1, $2, $3, $4, $5)',
          [module.id, question.questionText, question.options, question.correctIndex, question.points ?? 10]
        );
      }

      // Insert assignment if provided
      if (moduleData.assignment) {
        const a = moduleData.assignment;
        await client.query(
          'INSERT INTO "ModuleAssignment" ("moduleId", title, description, instructions, "passingPercent", points) VALUES ($1, $2, $3, $4, $5, $6)',
          [module.id, a.title, a.description ?? null, a.instructions ?? null, a.passingPercent ?? 70, a.points ?? 10]
        );
      }
    }

    await client.query('COMMIT');

    const responseCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      durationMinutes: course.durationMinutes,
      level: course.level,
      price: Number(course.price),
      status: course.status,
    };

    res.status(201).json(responseCourse);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create course error', err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

router.put('/:courseId', async (req, res) => {
  const courseId = Number(req.params.courseId);
  const { title, description, durationMinutes, level, price, status, modules, instructorId } = req.body || {};

  if (!courseId || !title || !description || !durationMinutes || !level || !modules || !instructorId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify instructor owns this course
    const courseCheck = await client.query(
      'SELECT id FROM "Course" WHERE id = $1 AND "instructorId" = $2',
      [courseId, instructorId]
    );

    if (courseCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Course not found or access denied' });
    }

    // Update course (preserve instructorId)
    const courseResult = await client.query(
      'UPDATE "Course" SET title = $1, description = $2, "durationMinutes" = $3, level = $4, price = $5, status = $6 WHERE id = $7 RETURNING *',
      [title, description, durationMinutes, level, price, status || 'PENDING', courseId]
    );
    
    if (courseResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Course not found' });
    }

    // Delete existing modules and their content
    await client.query('DELETE FROM "ModuleAssignment" WHERE "moduleId" IN (SELECT id FROM "CourseModule" WHERE "courseId" = $1)', [courseId]);
    await client.query('DELETE FROM "QuizQuestion" WHERE "moduleId" IN (SELECT id FROM "CourseModule" WHERE "courseId" = $1)', [courseId]);
    await client.query('DELETE FROM "ModuleMaterial" WHERE "moduleId" IN (SELECT id FROM "CourseModule" WHERE "courseId" = $1)', [courseId]);
    await client.query('DELETE FROM "ModuleVideo" WHERE "moduleId" IN (SELECT id FROM "CourseModule" WHERE "courseId" = $1)', [courseId]);
    await client.query('DELETE FROM "CourseModule" WHERE "courseId" = $1', [courseId]);

    // Re-insert modules and their content
    for (const moduleData of modules) {
      const moduleResult = await client.query(
        'INSERT INTO "CourseModule" (title, "courseId", "orderIndex") VALUES ($1, $2, $3) RETURNING *',
        [moduleData.title, courseId, moduleData.orderIndex]
      );
      const module = moduleResult.rows[0];

      // Insert videos
      for (let i = 0; i < moduleData.videoUrls.length; i++) {
        await client.query(
          'INSERT INTO "ModuleVideo" ("moduleId", "youtubeUrl", "orderIndex") VALUES ($1, $2, $3)',
          [module.id, moduleData.videoUrls[i], i]
        );
      }

      // Insert materials
      for (const material of moduleData.materials) {
        await client.query(
          'INSERT INTO "ModuleMaterial" ("moduleId", title, url, "fileType") VALUES ($1, $2, $3, $4)',
          [module.id, material.title, material.url, material.fileType]
        );
      }

      // Insert quiz questions
      for (const question of moduleData.questions) {
        await client.query(
          'INSERT INTO "QuizQuestion" ("moduleId", "questionText", options, "correctIndex", points) VALUES ($1, $2, $3, $4, $5)',
          [module.id, question.questionText, question.options, question.correctIndex, question.points ?? 10]
        );
      }

      // Insert assignment if provided
      if (moduleData.assignment) {
        const a = moduleData.assignment;
        await client.query(
          'INSERT INTO "ModuleAssignment" ("moduleId", title, description, instructions, "passingPercent", points) VALUES ($1, $2, $3, $4, $5, $6)',
          [module.id, a.title, a.description ?? null, a.instructions ?? null, a.passingPercent ?? 70, a.points ?? 10]
        );
      }
    }

    await client.query('COMMIT');

    const responseCourse = {
      id: courseResult.rows[0].id,
      title: courseResult.rows[0].title,
      description: courseResult.rows[0].description,
      durationMinutes: courseResult.rows[0].durationMinutes,
      level: courseResult.rows[0].level,
      price: Number(courseResult.rows[0].price),
      status: courseResult.rows[0].status,
    };

    res.json(responseCourse);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update course error', err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

router.delete('/:courseId', async (req, res) => {
  const courseId = Number(req.params.courseId);
  const { instructorId } = req.body || {};
  
  if (!courseId) {
    return res.status(400).json({ message: 'Invalid course id' });
  }

  if (!instructorId) {
    return res.status(400).json({ message: 'Instructor ID required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify instructor owns this course
    const courseCheck = await client.query(
      'SELECT id FROM "Course" WHERE id = $1 AND "instructorId" = $2',
      [courseId, instructorId]
    );

    if (courseCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Course not found or access denied' });
    }

    // Delete course content in order to respect foreign key constraints
    await client.query('DELETE FROM "AssignmentSubmission" WHERE "assignmentId" IN (SELECT id FROM "ModuleAssignment" WHERE "moduleId" IN (SELECT id FROM "CourseModule" WHERE "courseId" = $1))', [courseId]);
    await client.query('DELETE FROM "QuizAttempt" WHERE "courseId" = $1', [courseId]);
    await client.query('DELETE FROM "ModuleAssignment" WHERE "moduleId" IN (SELECT id FROM "CourseModule" WHERE "courseId" = $1)', [courseId]);
    await client.query('DELETE FROM "QuizQuestion" WHERE "moduleId" IN (SELECT id FROM "CourseModule" WHERE "courseId" = $1)', [courseId]);
    await client.query('DELETE FROM "ModuleMaterial" WHERE "moduleId" IN (SELECT id FROM "CourseModule" WHERE "courseId" = $1)', [courseId]);
    await client.query('DELETE FROM "ModuleVideo" WHERE "moduleId" IN (SELECT id FROM "CourseModule" WHERE "courseId" = $1)', [courseId]);
    await client.query('DELETE FROM "CourseModule" WHERE "courseId" = $1', [courseId]);
    
    // Delete enrollments
    await client.query('DELETE FROM "Enrollment" WHERE "courseId" = $1', [courseId]);
    
    // Delete the course
    const result = await client.query('DELETE FROM "Course" WHERE id = $1 RETURNING *', [courseId]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Course not found' });
    }

    await client.query('COMMIT');
    
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete course error', err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;
