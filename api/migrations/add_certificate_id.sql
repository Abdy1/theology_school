-- Add certificate ID column to Enrollment table
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "certificateId" VARCHAR(100);

-- Create index for certificate lookups
CREATE INDEX IF NOT EXISTS "idx_enrollment_certificate" ON "Enrollment"("certificateId");
