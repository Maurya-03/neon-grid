-- Supabase Storage Setup for NeonGrid Chat Media
-- Run this in your Supabase SQL Editor

-- Note: Storage buckets are created via the UI, not SQL
-- This file contains the policies you need to apply

-- ============================================
-- STEP 1: Create the bucket via Supabase UI
-- ============================================
-- 1. Go to Storage in Supabase dashboard
-- 2. Click "New bucket"
-- 3. Name: chat-media
-- 4. Toggle "Public bucket" to ON
-- 5. Click "Create bucket"

-- ============================================
-- STEP 2: Apply these policies
-- ============================================
-- Go to Storage > chat-media > Policies tab
-- Click "New Policy" for each of these:

-- Policy 1: Allow public reads
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'chat-media' );

-- Policy 2: Allow anyone to upload
CREATE POLICY "Allow Uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'chat-media' );

-- Policy 3: Allow anyone to update
CREATE POLICY "Allow Updates"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'chat-media' );

-- Policy 4: Allow anyone to delete
CREATE POLICY "Allow Deletes"
ON storage.objects FOR DELETE
USING ( bucket_id = 'chat-media' );

-- ============================================
-- Optional: File size restriction
-- ============================================
-- You can add a policy to restrict file sizes:
-- CREATE POLICY "Limit file size to 10MB"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'chat-media' AND
--   (octet_length(decode(payload, 'base64')) < 10485760)
-- );
