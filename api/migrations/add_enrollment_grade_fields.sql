-- Add grade fields to Enrollment table
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "assignmentGrade" DECIMAL(5,2) DEFAULT 0;
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "quizGrade" DECIMAL(5,2) DEFAULT 0;
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "finalGrade" DECIMAL(5,2);
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "gradeLetter" VARCHAR(2);
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "certificateIssued" BOOLEAN DEFAULT FALSE;
