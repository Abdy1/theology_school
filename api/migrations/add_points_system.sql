-- Add point values to assignments and quizzes
ALTER TABLE "ModuleAssignment" ADD COLUMN IF NOT EXISTS "points" DECIMAL(5,2) DEFAULT 10;
ALTER TABLE "QuizQuestion" ADD COLUMN IF NOT EXISTS "points" DECIMAL(5,2) DEFAULT 10;

-- Update enrollment to track total points
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "totalPoints" DECIMAL(5,2) DEFAULT 0;
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "earnedPoints" DECIMAL(5,2) DEFAULT 0;
