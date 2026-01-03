-- Add instructor ID column to Course table
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "instructorId" INTEGER REFERENCES "User"(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS "idx_course_instructor" ON "Course"("instructorId");
