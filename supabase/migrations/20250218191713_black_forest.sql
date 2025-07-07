/*
  # Add timestamp columns to Prompts table

  1. Changes
    - Add `created_at` and `updated_at` timestamp columns to `Prompts` table
    - Set default value for `created_at` to `now()`
    - Set default value for `updated_at` to `now()`

  2. Notes
    - Uses IF NOT EXISTS to prevent errors if columns already exist
    - Adds columns safely without affecting existing data
*/

DO $$ 
BEGIN
  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Prompts' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE "Prompts" ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Prompts' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE "Prompts" ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;