import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRouter from './routes/auth';
import coursesRouter from './routes/courses';
import enrollmentsRouter from './routes/enrollments';
import adminRouter from './routes/admin';
import uploadRouter from './routes/upload';
import assignmentsRouter from './routes/assignments';
import quizRouter from './routes/quiz';
import certificatesRouter from './routes/certificates';

const app = express();

app.use(cors());
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/enrollments', enrollmentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/certificates', certificatesRouter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const PORT = 8081;

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
