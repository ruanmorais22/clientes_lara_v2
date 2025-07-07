/*
  # Create custom fields table

  1. New Tables
    - `custom_fields`
      - `id` (uuid, primary key)
      - `prompt_id` (integer, references Prompts)
      - `label` (text)
      - `value` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on custom_fields table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id integer REFERENCES "Prompts"(id) ON DELETE CASCADE,
  label text NOT NULL,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read custom fields"
  ON custom_fields
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create custom fields"
  ON custom_fields
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update custom fields"
  ON custom_fields
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete custom fields"
  ON custom_fields
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_custom_fields_prompt_id ON custom_fields(prompt_id);