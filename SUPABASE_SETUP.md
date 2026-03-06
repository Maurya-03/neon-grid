# Supabase Storage Setup Guide

This application now uses Supabase for media storage instead of Firebase Storage.

## Prerequisites

You need a Supabase project. If you don't have one:

1. Go to https://supabase.com
2. Sign up/login and create a new project
3. Wait for the project to finish setting up

## Configuration Steps

### 1. Get Your Supabase Credentials

From your Supabase dashboard:

1. Go to **Project Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy the following:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (a long JWT token)

### 2. Update Environment Variables

Edit the `.env` file in the project root and replace these values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note:** The keys provided in this file are placeholders. Replace them with your actual Supabase credentials.

### 3. Create Storage Bucket

In your Supabase dashboard:

1. Go to **Storage** in the left sidebar
2. Click **New bucket**
3. Name it: `chat-media`
4. **Make it Public** (toggle the Public bucket option)
5. Click **Create bucket**

### 4. Set Storage Policies

After creating the bucket, go to the **Policies** tab for `chat-media`:

#### Allow Public Read Access

```sql
-- Policy name: Public Read Access
-- Allowed operation: SELECT
-- Policy definition:
create policy "Public Read Access"
on storage.objects for select
using ( bucket_id = 'chat-media' );
```

#### Allow Authenticated Uploads

```sql
-- Policy name: Allow Uploads
-- Allowed operation: INSERT
-- Policy definition:
create policy "Allow Uploads"
on storage.objects for insert
with check ( bucket_id = 'chat-media' );
```

#### Allow Authenticated Deletes

```sql
-- Policy name: Allow Deletes
-- Allowed operation: DELETE
-- Policy definition:
create policy "Allow Deletes"
on storage.objects for delete
using ( bucket_id = 'chat-media' );
```

### 5. Test the Configuration

After configuring, you can test the storage by:

1. Start the development server: `npm run dev`
2. Open the browser console
3. Run: `testSupabaseStorage()`
4. Check for success messages

## Features

- ✅ Upload images and videos up to 10MB
- ✅ Automatic file deletion when messages/rooms are deleted
- ✅ Public URL generation for media sharing
- ✅ Mock storage fallback if Supabase is not configured

## Troubleshooting

### "Supabase not configured" message

- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env`
- Make sure the URL doesn't contain `your-project` or `placeholder`
- Restart the dev server after changing `.env`

### Upload fails with 403 error

- Check that the `chat-media` bucket exists
- Verify the bucket is set to **Public**
- Ensure storage policies are correctly configured

### Images don't display

- Check browser console for CORS errors
- Verify the bucket's RLS policies allow public read access
- Make sure the bucket is set to Public

## Security Notes

- The anon key is safe to expose in client-side code
- Storage policies control what users can access
- Consider adding file size limits and file type validation in policies
- For production, consider adding rate limiting

## Migration from Firebase

The codebase maintains the same function names (`uploadToFirebaseStorage`, `deleteFromFirebaseStorage`) for compatibility. No changes needed in components that use these functions.
