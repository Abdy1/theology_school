-- QuizAttempt table for detailed quiz tracking
CREATE TABLE "QuizAttempt" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "User"(id),
  "courseId" INTEGER REFERENCES "Course"(id),
  "moduleId" INTEGER REFERENCES "CourseModule"(id),
  "quizId" INTEGER REFERENCES "QuizQuestion"(id),
  "score" DECIMAL(5,2),
  "totalQuestions" INTEGER,
  "correctAnswers" INTEGER,
  "percentage" DECIMAL(5,2),
  "passed" BOOLEAN,
  "attemptNumber" INTEGER DEFAULT 1,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
