/*
  # Create folders table and update prompts table

  1. New Tables
    - `folders`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `created_at` (timestamp)

  2. Changes to Existing Tables
    - Add `folder_id` to `Prompts` table
    - Add foreign key constraint

  3. Security
    - Enable RLS on `folders` table
    - Add policies for authenticated users
*/

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add folder_id to Prompts table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Prompts' AND column_name = 'folder_id'
  ) THEN
    ALTER TABLE "Prompts" ADD COLUMN folder_id uuid REFERENCES folders(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read folders"
  ON folders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create folders"
  ON folders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their folders"
  ON folders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);