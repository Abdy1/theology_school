import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Get certificate by ID
router.get('/:certificateId', async (req, res) => {
  const { certificateId } = req.params;

  try {
    // Find enrollment with this certificate ID
    const enrollmentResult = await pool.query(
      `SELECT e.*, u.name as "userName", c.title as "courseTitle"
       FROM "Enrollment" e
       JOIN "User" u ON e."userId" = u.id
       JOIN "Course" c ON e."courseId" = c.id
       WHERE e."certificateId" = $1 AND e."certificateIssued" = TRUE`,
      [certificateId]
    );

    if (enrollmentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const enrollment = enrollmentResult.rows[0];

    // Get assignment breakdown
    const assignmentBreakdown = await pool.query(
      `SELECT a.title, s."gradePercent", a.points, (s."gradePercent"/100 * a.points) as "earnedPoints"
       FROM "AssignmentSubmission" s
       JOIN "ModuleAssignment" a ON s."assignmentId" = a.id
       WHERE s."enrollmentId" = $1 AND s.status = 'APPROVED'
       ORDER BY a.title`,
      [enrollment.id]
    );

    // Get quiz breakdown
    const quizBreakdown = await pool.query(
      `SELECT q."questionText" as title, qa.percentage as "gradePercent", q.points, (qa.percentage/100 * q.points) as "earnedPoints"
       FROM "QuizAttempt" qa
       JOIN "QuizQuestion" q ON qa."quizId" = q.id
       WHERE qa."userId" = $1 AND qa."courseId" = $2 AND qa.passed = true
       ORDER BY q."questionText"`,
      [enrollment.userId, enrollment.courseId]
    );

    const certificateData = {
      certificateId: enrollment.certificateId,
      studentName: enrollment.userName,
      courseTitle: enrollment.courseTitle,
      finalGrade: Number(enrollment.finalGrade),
      gradeLetter: enrollment.gradeLetter || 'N/A',
      earnedPoints: Number(enrollment.earnedPoints) || 0,
      totalPoints: Number(enrollment.totalPoints) || 0,
      completedAt: enrollment.updatedAt,
      breakdown: {
        assignments: assignmentBreakdown.rows,
        quizzes: quizBreakdown.rows
      }
    };

    res.json(certificateData);
  } catch (error) {
    console.error('Get certificate error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate PDF for certificate
router.post('/:certificateId/pdf', async (req, res) => {
  const { certificateId } = req.params;

  try {
    // Get certificate data
    const certResponse = await fetch(`http://localhost:8081/api/certificates/${certificateId}`);
    if (!certResponse.ok) {
      throw new Error('Certificate not found');
    }

    const certificate = await certResponse.json();

    // For now, return a simple PDF generation response
    // In a real implementation, you would use a PDF library like Puppeteer or PDFKit
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Certificate-${certificateId}.pdf"`);

    // Simple PDF placeholder - in production, generate actual PDF
    const pdfContent = `
Certificate of Completion

This certifies that ${certificate.studentName}
has successfully completed the course
${certificate.courseTitle}

Final Grade: ${certificate.finalGrade}%
Grade: ${certificate.gradeLetter}
Points: ${certificate.earnedPoints}/${certificate.totalPoints}

Completed: ${new Date(certificate.completedAt).toLocaleDateString()}
Certificate ID: ${certificate.certificateId}

This is a placeholder PDF. In production, this would be a professionally designed certificate.
    `;

    res.send(pdfContent);
  } catch (error) {
    console.error('Generate PDF error', error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});

// Verify certificate
router.get('/:certificateId/verify', async (req, res) => {
  const { certificateId } = req.params;

  try {
    const enrollmentResult = await pool.query(
      `SELECT e."certificateIssued", u.name as "userName", c.title as "courseTitle", e.finalGrade
       FROM "Enrollment" e
       JOIN "User" u ON e."userId" = u.id
       JOIN "Course" c ON e."courseId" = c.id
       WHERE e."certificateId" = $1`,
      [certificateId]
    );

    if (enrollmentResult.rows.length === 0) {
      return res.json({
        valid: false,
        message: 'Certificate not found'
      });
    }

    const enrollment = enrollmentResult.rows[0];

    res.json({
      valid: true,
      issued: enrollment.certificateIssued,
      studentName: enrollment.userName,
      courseTitle: enrollment.courseTitle,
      finalGrade: enrollment.finalGrade
    });
  } catch (error) {
    console.error('Verify certificate error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
