# 🚀 Quick Supabase Storage Setup

Your project is already configured to use: **https://fwzguzhppvzzyybnhjkj.supabase.co**

## ⚡ Quick Steps (5 minutes)

### Step 1: Get Your Anon Key ✅

1. Go to: https://supabase.com/dashboard/project/fwzguzhppvzzyybnhjkj/settings/api
2. Find the **anon** / **public** key (long text starting with `eyJ...`)
3. Copy it
4. Open `.env` file in this project
5. Replace this line:
   ```env
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3emd1emhwcHZ6enl5Ym5oamtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MzUyNzAsImV4cCI6MjA1NjUxMTI3MH0.wvC_Ggq_2yx-cxU2Qn4kzZ91DJxM9n4QZVNsw0EqR7Y
   ```
   With your actual anon key

### Step 2: Create Storage Bucket 🪣

1. Go to: https://supabase.com/dashboard/project/fwzguzhppvzzyybnhjkj/storage/buckets
2. Click **"New bucket"** button
3. Fill in:
   - **Name:** `chat-media`
   - **Public bucket:** ✅ Toggle ON (IMPORTANT!)
   - Click **"Create bucket"**

### Step 3: Set Policies 🔐

1. Click on your new `chat-media` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"** button
4. Select **"For full customization"**
5. Create these 4 policies:

#### Policy 1: Public Reads

- **Policy name:** Public Read
- **Allowed operation:** SELECT
- **Target roles:** public
- **USING expression:** `bucket_id = 'chat-media'`
- Click **Save policy**

#### Policy 2: Public Inserts

- **Policy name:** Public Upload
- **Allowed operation:** INSERT
- **Target roles:** public
- **WITH CHECK expression:** `bucket_id = 'chat-media'`
- Click **Save policy**

#### Policy 3: Public Updates

- **Policy name:** Public Update
- **Allowed operation:** UPDATE
- **Target roles:** public
- **USING expression:** `bucket_id = 'chat-media'`
- Click **Save policy**

#### Policy 4: Public Deletes

- **Policy name:** Public Delete
- **Allowed operation:** DELETE
- **Target roles:** public
- **USING expression:** `bucket_id = 'chat-media'`
- Click **Save policy**

### Step 4: Restart & Test 🧪

```bash
# Restart your dev server
npm run dev
```

Then in browser console (F12):

```javascript
testSupabaseStorage();
```

You should see: ✅ Supabase Storage test successful

## 📝 Notes

- **Database:** App still uses Firebase Firestore for rooms/messages data
- **Storage:** Only media files (images/videos) use Supabase Storage
- **Tables:** You don't need Supabase database tables - Firebase handles that

## 🐛 Troubleshooting

### Upload fails with 403

- ✅ Bucket is Public?
- ✅ All 4 policies created?
- ✅ Policies target **public** role?

### Images don't show

- ✅ Public Read policy enabled?
- ✅ Bucket is Public?

### "Not configured" message

- ✅ Anon key starts with `eyJ...`?
- ✅ Dev server restarted after changing `.env`?

## 🔑 Your Current Config

```env
VITE_SUPABASE_URL=https://fwzguzhppvzzyybnhjkj.supabase.co
VITE_SUPABASE_ANON_KEY=<get this from Settings > API>
```
