/*
  # Add storage policies for images bucket

  1. Storage Policies
    - Enable public access to images
    - Allow authenticated users to upload images
    - Allow authenticated users to update their own images
*/

-- Create storage policies for the 'imagens' bucket
BEGIN;

-- Allow public access to read images
CREATE POLICY "Give public access to images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'imagens');

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'imagens');

-- Allow authenticated users to update their own images
CREATE POLICY "Allow users to update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'imagens' AND auth.uid() = owner);

-- Allow authenticated users to delete their own images
CREATE POLICY "Allow users to delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'imagens' AND auth.uid() = owner);

COMMIT;