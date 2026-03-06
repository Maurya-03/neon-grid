# Debugging Media Display Issues

## Quick Diagnostic Steps

### 1. Check Browser Console

Open your browser's developer console (F12) and look for these logs:

#### When a message is received:

```
🔊 Firestore snapshot received for room {roomId}: X docs
  📄 Doc 0 ({messageId}):
    sender: "username"
    type: "media" or "text" or "mixed"
    hasText: true/false
    hasMediaUrl: true/false
    mediaUrl: "https://..."
    mediaType: "image/png"
```

#### When rendering:

```
🎨 Rendering message:
  hasMediaUrl: true/false
  mediaUrl: "https://..."
  mediaType: "image/png"
```

#### For media-only messages:

```
✅ MEDIA-ONLY MESSAGE - WILL RENDER:
  mediaUrl: "https://..."
  mediaType: "image/png"
```

### 2. Common Issues & Solutions

#### Issue: Images uploaded but not appearing

**Check 1: Field Name Mismatch**

- Old messages might use `mediaURL` (capital URL)
- New code uses `mediaUrl` (lowercase url)
- **Solution**: Code already handles both, but verify in console

**Check 2: MIME Type**

- Check console log shows `mediaType: "image/png"` or similar
- Should start with `image/` or `video/`
- **Solution**: If null or wrong type, image won't display

**Check 3: URL Format**

- Should be full URL: `https://...`
- Not a path like `/uploads/...`
- **Solution**: Check Supabase storage URL is correct

**Check 4: CORS Issues**

- Browser may block loading from Supabase
- Check console for CORS errors
- **Solution**: Configure Supabase bucket CORS settings

### 3. Test in Browser Console

Run these commands in your browser console to debug:

```javascript
// Get all messages and check their structure
const messages = document.querySelectorAll('[class*="animate-fade-in-glow"]');
console.log("Message count:", messages.length);

// Check if images exist in DOM
const images = document.querySelectorAll('img[alt="Shared image"]');
console.log("Image elements:", images.length);
images.forEach((img, i) => {
  console.log(`Image ${i}:`, {
    src: img.src,
    displayed: img.complete && img.naturalHeight !== 0,
  });
});

// Check videos
const videos = document.querySelectorAll("video");
console.log("Video elements:", videos.length);
```

### 4. Manual Firestore Check

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to Firestore Database
3. Find: `rooms/{your-room-id}/messages`
4. Check a message document:
   - Does it have `mediaUrl` or `mediaURL` field?
   - Does it have `mediaType` field?
   - Is the URL correct?

### 5. Force Rebuild

If you made changes recently:

```bash
# Clean and rebuild
npm run build

# Or for dev server
npm run dev
```

Then hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### 6. Check Network Tab

1. Open DevTools → Network tab
2. Try to upload an image
3. Look for:
   - Upload to Supabase (should succeed)
   - Firestore write (should succeed)
   - Image load request (should show the image URL)

If image load fails:

- Check response status (404, 403, etc.)
- Check response headers for CORS
- Verify URL is accessible

### 7. Supabase Storage Configuration

If images upload but can't be displayed:

1. Go to Supabase Dashboard
2. Storage → Policies
3. Ensure `chat-media` bucket has a policy allowing public reads:

```sql
-- Policy for public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'chat-media' );
```

### 8. Quick Fix: Clear Old Messages

If old messages have wrong field names, you can:

**Option A: Update via Firestore Console**

- Manually edit documents to use `mediaUrl`

**Option B: Send New Test Message**

- Upload a new image after the fix
- Should work immediately with new field structure

## Expected Working Flow

1. **Upload file** → See progress bar
2. **Message sent** → Console shows `✅ Message sent to Firestore successfully`
3. **Snapshot received** → Console shows message with `mediaUrl`
4. **Rendering** → Console shows `🎨 Rendering message` with `hasMediaUrl: true`
5. **Image loads** → Console shows `✅ Image loaded successfully`
6. **UI displays** → Image appears in chat bubble

## Still Not Working?

If none of the above helps, provide:

1. Screenshot of browser console logs
2. Screenshot of Firestore message document
3. Example of the image URL being used
4. Any error messages in console
