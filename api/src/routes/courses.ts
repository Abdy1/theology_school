import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
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
  const { title, description, durationMinutes, level, price, status, modules } = req.body || {};

  if (!title || !description || !durationMinutes || !level || !modules) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert course
    const courseResult = await client.query(
      'INSERT INTO "Course" (title, description, "durationMinutes", level, price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, durationMinutes, level, price, status || 'PENDING']
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
          'INSERT INTO "QuizQuestion" ("moduleId", "questionText", options, "correctIndex") VALUES ($1, $2, $3, $4)',
          [module.id, question.questionText, question.options, question.correctIndex]
        );
      }

      // Insert assignment if provided
      if (moduleData.assignment) {
        const a = moduleData.assignment;
        await client.query(
          'INSERT INTO "ModuleAssignment" ("moduleId", title, description, instructions, "passingPercent") VALUES ($1, $2, $3, $4, $5)',
          [module.id, a.title, a.description ?? null, a.instructions ?? null, a.passingPercent ?? 70]
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

export default router;
