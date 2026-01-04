-- Add video type and title columns to ModuleVideo table
ALTER TABLE "ModuleVideo" ADD COLUMN IF NOT EXISTS "videoType" VARCHAR(20) DEFAULT 'youtube';
ALTER TABLE "ModuleVideo" ADD COLUMN IF NOT EXISTS "videoTitle" VARCHAR(255);

-- Update existing records to have default values
UPDATE "ModuleVideo" SET "videoType" = 'youtube' WHERE "videoType" IS NULL;
UPDATE "ModuleVideo" SET "videoTitle" = 'Video' WHERE "videoTitle" IS NULL;
