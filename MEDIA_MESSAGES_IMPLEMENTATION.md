# Media Messages Implementation

## Overview

This document describes the implementation of media message support in the real-time chat application. The system now correctly handles three types of messages: text-only, media-only, and mixed (text + media).

## Architecture

### Storage Responsibilities

#### Supabase Storage

- Stores the actual media files (images, videos, etc.)
- Provides public URLs for accessing media
- Configured bucket: `chat-media`

#### Firestore

- **Single source of truth** for the chat UI
- Stores all message metadata including media references
- Messages are scoped to rooms using subcollections
- Structure: `rooms/{roomId}/messages/{messageId}`

### Data Model

```typescript
interface Message {
  id?: string;
  sender: string; // username
  text: string | null; // can be null for media-only messages
  mediaUrl: string | null; // can be null for text-only messages
  mediaType: string | null; // MIME type (e.g., 'image/png', 'video/mp4')
  type: "text" | "media" | "mixed"; // message classification
  timestamp: Timestamp | Date;
  flagged: boolean; // default: false
  deleted: boolean; // default: false
}
```

### Message Types

#### 1. Text-Only Message

```typescript
{
  text: "Hello, world!",
  mediaUrl: null,
  mediaType: null,
  type: "text"
}
```

#### 2. Media-Only Message

```typescript
{
  text: null,
  mediaUrl: "https://supabase.storage/.../image.png",
  mediaType: "image/png",
  type: "media"
}
```

#### 3. Mixed Message

```typescript
{
  text: "Check this out!",
  mediaUrl: "https://supabase.storage/.../video.mp4",
  mediaType: "video/mp4",
  type: "mixed"
}
```

## Upload Flow

### When a User Sends a Message with Media:

1. **Client validates** that at least text OR media exists
2. **Upload to Supabase Storage**
   - File is uploaded to `chat-media` bucket
   - Progress callback updates UI
   - Returns public URL
3. **Create Firestore document**
   - Includes `mediaUrl`, `mediaType`, `text` (if provided)
   - System automatically classifies message type
   - Stored in room-specific messages subcollection
4. **Real-time listener updates UI**
   - All clients subscribed to the room receive update
   - UI renders the new message immediately

## Rendering Rules

### UI Behavior

The chat UI renders messages according to these rules:

- **If `message.text` exists**: Render text bubble
- **If `message.mediaUrl` exists**: Render media element
- **Media detection by MIME type**:
  - `image/*` → Render `<img>` with preview
  - `video/*` → Render `<video>` player with controls
  - Other types → Render download link

### Key Implementation Details

```tsx
{/* Text rendering - independent */}
{message.text && message.text.trim() && (
  <p className="text-white break-words">
    {message.text}
  </p>
)}

{/* Media rendering - independent */}
{message.mediaUrl && message.mediaUrl.trim() && (
  <div className="mt-2">
    {message.mediaType?.startsWith("image/") ? (
      <img src={message.mediaUrl} alt="Shared image" ... />
    ) : message.mediaType?.startsWith("video/") ? (
      <video src={message.mediaUrl} controls ... />
    ) : (
      <a href={message.mediaUrl} download>Download file</a>
    )}
  </div>
)}
```

## Room Isolation

Messages are properly isolated by room:

- Each room has its own messages subcollection
- Path: `rooms/{roomId}/messages`
- Firestore query always filters by `roomId`
- Media from one room never appears in another

## Files Changed

### Core Service Layer

- **`src/lib/room-service.ts`**
  - Updated `Message` interface with required fields
  - Field name consistency: `mediaUrl` (lowercase 'url')
  - Improved `subscribeToMessages()` with field normalization
  - Enhanced `sendMessage()` with validation
  - Fixed `getMediaMessages()` to use correct field names

### UI Components

- **`src/components/ChatRoom.tsx`**
  - Updated upload flow to store full MIME type
  - Changed field name from `mediaURL` to `mediaUrl`
  - Enhanced rendering logic for all three message types
  - Added better media type detection (MIME-based)
  - Improved styling and layout for media messages

### Legacy Service (for consistency)

- **`src/lib/chat-service.ts`**
  - Updated to match new data model
  - Not currently used but kept consistent

## Testing

Build completed successfully:

```bash
npm run build
✓ 1740 modules transformed
✓ built in 4.53s
```

## Expected Behavior

### ✅ Text Message

- User types text and clicks send
- Message appears with text bubble
- No media element

### ✅ Media Message

- User selects file, sends without text
- Upload progress shown
- Message appears with media preview
- **No text bubble** (this was the bug we fixed)
- Timestamp displayed below media

### ✅ Mixed Message

- User types text AND selects file
- Upload progress shown
- Message appears with both text and media
- Text above, media below, timestamp at bottom

## Important Notes

1. **Validation**: Messages must have at least text OR media (enforced in `sendMessage()`)
2. **Field Consistency**: Always use `mediaUrl` (not `mediaURL`)
3. **MIME Types**: Store full MIME type (e.g., `image/png`, not just `image`)
4. **Firestore is Source of Truth**: UI never queries Supabase directly
5. **Room Scoping**: All messages are isolated to their respective rooms

## Future Enhancements

Possible improvements:

- Add file size display in UI
- Support more file types (PDF, documents)
- Add media gallery view
- Implement image thumbnails for large images
- Add video thumbnail generation
- Support audio messages
- Add message reactions
