-- Update AssignmentSubmission with weight and remove reviewText (using enrollment grade field)
ALTER TABLE "AssignmentSubmission" ADD COLUMN IF NOT EXISTS "weight" DECIMAL(5,2) DEFAULT 1.0;
ALTER TABLE "AssignmentSubmission" DROP COLUMN IF EXISTS "reviewText";
