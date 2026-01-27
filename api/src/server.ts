import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRouter from './routes/auth';
import booksRouter from './routes/books';
import paymentRouter from './routes/payment';
import chapaWebhook from './webhooks/chapa';
import uploadRouter from './routes/upload';
import assignmentsRouter from './routes/assignments';
import quizRouter from './routes/quiz';
import certificatesRouter from './routes/certificates';
import videoUploadRouter from './routes/video-upload';
import coursesRouter from './routes/courses';
import enrollmentsRouter from './routes/enrollments';
import adminRouter from './routes/admin';

const app = express();

// CORS configuration for HTTPS
app.use(cors({
  origin: ['https://dothanministries.org', 'https://www.dothanministries.org', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: true
}));

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
app.use('/api/upload/video', videoUploadRouter);
app.use('/api/books', booksRouter);
app.use('/api/payment', paymentRouter);
app.use('/webhooks/chapa', chapaWebhook);

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res, path, stat) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

const PORT = 8081;

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
