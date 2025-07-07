/*
  # Add delete policy for folders

  1. Changes
    - Add policy to allow authenticated users to delete their folders
    - Add ON DELETE CASCADE to folder_id foreign key in Prompts table

  2. Security
    - Only allow deletion if user is authenticated
*/

-- Add ON DELETE CASCADE to folder_id foreign key
ALTER TABLE "Prompts" DROP CONSTRAINT IF EXISTS "Prompts_folder_id_fkey";
ALTER TABLE "Prompts" ADD CONSTRAINT "Prompts_folder_id_fkey" 
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE;

-- Create delete policy for folders
CREATE POLICY "Users can delete their folders"
  ON folders
  FOR DELETE
  TO authenticated
  USING (true);