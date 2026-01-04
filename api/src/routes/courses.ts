import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// List all courses
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
      price: c.price,
      status: c.status,
    }));

    res.json(summaries);
  } catch (err) {
    console.error('List courses error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get courses for a specific instructor
router.get('/instructor/:instructorId', async (req, res) => {
  const instructorId = Number(req.params.instructorId);
  
  if (!instructorId) {
    return res.status(400).json({ message: 'Invalid instructor id' });
  }

  try {
    const result = await pool.query(
      'SELECT id, title, description, "durationMinutes", level, price, status FROM "Course" WHERE "instructorId" = $1',
      [instructorId]
    );
    const courses = result.rows;
 

    const summaries = courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      durationMinutes: c.durationMinutes,
      level: c.level,
      price: c.price,
      status: c.status,
    }));

    res.json(summaries);
  } catch (err) {
    console.error('Get instructor courses error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new course
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

      // Insert videos - handle both old and new formats
      const videos = moduleData.videos || moduleData.videoUrls || [];
      for (let i = 0; i < videos.length; i++) {
        let videoUrl, videoType = 'youtube', videoTitle = 'Video';
        
        if (moduleData.videos && moduleData.videos[i]) {
          // New format with video objects
          const video = moduleData.videos[i];
          videoUrl = video.url;
          videoType = video.type || 'youtube';
          videoTitle = video.title;
        } else if (moduleData.videoUrls && moduleData.videoUrls[i]) {
          // Old format with just URLs
          videoUrl = moduleData.videoUrls[i];
          videoType = 'youtube';
          videoTitle = 'Video ' + (i + 1);
        }
        
        await client.query(
          'INSERT INTO "ModuleVideo" ("moduleId", "videoUrl", "videoType", "videoTitle", "orderIndex") VALUES ($1, $2, $3, $4, $5)',
          [module.id, videoUrl, videoType, videoTitle, i]
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

      // Insert assignment if exists
      if (moduleData.assignment) {
        await client.query(
          'INSERT INTO "Assignment" ("moduleId", title, description, instructions, "passingPercent", points) VALUES ($1, $2, $3, $4, $5, $6)',
          [module.id, moduleData.assignment.title, moduleData.assignment.description, moduleData.assignment.instructions, moduleData.assignment.passingPercent, moduleData.assignment.points ?? 10]
        );
      }
    }

    await client.query('COMMIT');

    // Fetch the complete course with all modules
    const responseCourse = await pool.query(
      `SELECT c.*, u.name as "instructorName", u.email as "instructorEmail" 
       FROM "Course" c 
       JOIN "User" u ON c."instructorId" = u.id 
       WHERE c.id = $1`,
      [course.id]
    );

    res.status(201).json(responseCourse.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create course error', err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Get a specific course with modules and content
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
      // Get videos for this module - handle new structure
      const videosResult = await pool.query(
        'SELECT * FROM "ModuleVideo" WHERE "moduleId" = $1 ORDER BY "orderIndex" ASC',
        [module.id]
      );
      
      // Convert videos to the expected format
      const videos = videosResult.rows.map(video => ({
        id: video.id.toString(),
        url: video.videoUrl,
        title: video.title || 'Video ' + (video.orderIndex + 1),
        type: video.videoUrl.startsWith('/uploads/') ? 'upload' : 'youtube'
      }));
      
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
        id: module.id.toString(),
        title: module.title,
        videos: videos,
        materials: materialsResult.rows,
        questions: questionsResult.rows,
        assignment: assignment
      });
    }

    res.json({
      ...course,
      modules: modules
    });
  } catch (err) {
    console.error('Get course error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
