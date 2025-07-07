/*
  # Add custom_fields column to Prompts table

  1. Changes
    - Add `custom_fields` JSONB column to `Prompts` table to store custom field data
    - Set default value to empty array
    - Add index for better query performance

  2. Notes
    - Uses JSONB for flexible schema and better performance
    - Adds index to improve query performance when filtering by custom fields
*/

DO $$ 
BEGIN
  -- Add custom_fields column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Prompts' AND column_name = 'custom_fields'
  ) THEN
    ALTER TABLE "Prompts" ADD COLUMN custom_fields JSONB DEFAULT '[]'::jsonb;
    CREATE INDEX idx_prompts_custom_fields ON "Prompts" USING gin(custom_fields);
  END IF;
END $$;