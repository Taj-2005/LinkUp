# Link Creation Feature Documentation

## Overview

The Link Creation feature allows users to create Instagram-style posts/links with images, descriptions, locations, likes, and nested comments/replies. This document provides a comprehensive guide to understanding, using, and extending this feature.

## Table of Contents

1. [Architecture](#architecture)
2. [Data Model](#data-model)
3. [API Endpoints](#api-endpoints)
4. [UI Components](#ui-components)
5. [Image Upload Flow](#image-upload-flow)
6. [Comments & Replies Structure](#comments--replies-structure)
7. [Environment Variables](#environment-variables)
8. [Socket Integration Hooks](#socket-integration-hooks)
9. [Extending the Feature](#extending-the-feature)

---

## Architecture

### Technology Stack

- **Frontend**: Next.js 14 App Router, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Image Storage**: Cloudinary
- **Real-time**: Socket.IO (ready for integration)

### File Structure

```
src/
├── models/
│   └── Link.ts                    # MongoDB schema for links/posts
├── app/
│   ├── api/
│   │   ├── links/
│   │   │   └── create/
│   │   │       └── route.ts      # Link creation API
│   │   └── cloudinary/
│   │       └── upload-link-image/
│   │           └── route.ts      # Image upload API
│   └── (protected)/
│       └── newlink/
│           └── page.tsx          # Main link creation page
└── components/
    └── links/
        └── ImageUploader.tsx      # Drag-and-drop image uploader
```

---

## Data Model

### Link Schema

Each link/post is stored in MongoDB with the following structure:

```typescript
interface ILink {
  _id: string;
  userId: string;              // Creator's user ID
  imageUrl: string;             // Cloudinary URL
  description?: string;         // Max 2200 characters
  location?: string;            // Max 100 characters
  likes: string[];              // Array of user IDs who liked
  comments: IComment[];         // Array of comments
  createdAt: Date;
  updatedAt: Date;
}
```

### Comment Schema

```typescript
interface IComment {
  _id: string;
  userId: string;               // Commenter's user ID
  username: string;             // Commenter's username
  user_avatar?: string;         // Commenter's avatar URL
  text: string;                 // Comment text
  replies: IReply[];            // Nested replies
  createdAt: Date;
  updatedAt: Date;
}
```

### Reply Schema

```typescript
interface IReply {
  _id: string;
  userId: string;               // Replier's user ID
  username: string;             // Replier's username
  user_avatar?: string;         // Replier's avatar URL
  text: string;                 // Reply text
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Indexes

- `userId + createdAt` (descending) - For efficient user feed queries

---

## API Endpoints

### 1. Create Link

**Endpoint**: `POST /api/links/create`

**Authentication**: Required (JWT token in cookies)

**Request Body**:
```json
{
  "imageUrl": "https://res.cloudinary.com/...",
  "description": "Optional description text",
  "location": "Optional location"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "link": {
    "_id": "...",
    "userId": "...",
    "imageUrl": "...",
    "description": "...",
    "location": "...",
    "likes": [],
    "comments": [],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses**:
- `400` - Validation error (missing imageUrl, description too long, etc.)
- `401` - Unauthorized
- `500` - Server error

### 2. Upload Link Image

**Endpoint**: `POST /api/cloudinary/upload-link-image`

**Authentication**: Required (JWT token in cookies)

**Request Body**:
```json
{
  "file": "data:image/jpeg;base64,..."
}
```

**Response** (200 OK):
```json
{
  "secure_url": "https://res.cloudinary.com/.../link_images/...",
  "public_id": "link_images/..."
}
```

**Image Specifications**:
- **Folder**: `link_images` (in Cloudinary)
- **Max Size**: 10MB (enforced in frontend)
- **Transformations**: Auto-optimized, max 1080x1080px
- **Formats**: PNG, JPG, GIF, WebP

---

## UI Components

### NewLink Page (`src/app/(protected)/newlink/page.tsx`)

The main link creation interface with:

- **Image Upload Section**: Drag-and-drop zone with preview
- **Description Field**: Textarea with character counter (max 2200)
- **Location Field**: Text input (max 100 characters)
- **Submit/Cancel Buttons**: Form actions

**Features**:
- Real-time image preview
- Form validation
- Loading states
- Error handling with toast notifications
- Responsive design

### ImageUploader Component (`src/components/links/ImageUploader.tsx`)

A reusable drag-and-drop image uploader with:

**Props**:
```typescript
interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
  initialImageUrl?: string;
}
```

**Features**:
- Drag-and-drop support
- Click to browse
- Image preview
- Upload progress indication
- Error handling
- File validation (type, size)
- Remove image functionality

**User Experience**:
1. User drags image or clicks to browse
2. Immediate preview shown
3. Image uploads to Cloudinary in background
4. Preview updates with Cloudinary URL
5. User can remove and re-upload

---

## Image Upload Flow

### Step-by-Step Process

1. **User Action**: User drags image or selects file
2. **Frontend Validation**:
   - Check file type (must be image)
   - Check file size (max 10MB)
3. **Preview**: Show immediate preview using FileReader
4. **Upload to Cloudinary**:
   - Convert file to base64 data URL
   - POST to `/api/cloudinary/upload-link-image`
   - Cloudinary processes and optimizes image
5. **Store URL**: Save Cloudinary URL in component state
6. **Link Creation**: When form submitted, image URL included in link data

### Cloudinary Configuration

Images are uploaded with:
- **Folder**: `link_images`
- **Transformation**: Auto-optimized, max dimensions 1080x1080
- **Quality**: Auto (Cloudinary optimizes)
- **Format**: Auto (best format for browser)

---

## Comments & Replies Structure

### Nested Threading

Comments support unlimited nested replies, similar to Instagram:

```
Link
├── Comment 1
│   ├── Reply 1.1
│   ├── Reply 1.2
│   │   └── (Future: Reply to Reply 1.2)
│   └── Reply 1.3
├── Comment 2
│   └── Reply 2.1
└── Comment 3
```

### Data Access Pattern

```typescript
// Access comments
link.comments.forEach(comment => {
  console.log(comment.text);
  console.log(comment.username);
  
  // Access replies
  comment.replies.forEach(reply => {
    console.log(reply.text);
    console.log(reply.username);
  });
});
```

### Future Extensions

The structure supports:
- Replies to replies (add `replies` field to `IReply`)
- Comment likes (add `likes` array to `IComment`)
- Reply likes (add `likes` array to `IReply`)
- Comment editing/deletion
- Mention notifications

---

## Environment Variables

### Required Variables

Add these to your `.env.local` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# MongoDB (if not already set)
MONGODB_URI=your_mongodb_connection_string
```

### Getting Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy:
   - Cloud Name
   - API Key
   - API Secret

---

## Socket Integration Hooks

### Current State

The feature is designed to be socket-ready but doesn't currently emit socket events. The infrastructure is in place for real-time updates.

### Integration Points

#### 1. Link Creation Event

**Location**: `src/app/api/links/create/route.ts`

**Add after link creation**:
```typescript
// After successful link creation
try {
  await fetch(`${SOCKET_SERVER_URL}/api/links/link-created-notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      linkId: link._id,
      userId: userId
    }),
  });
} catch (socketError) {
  // Silently fail - link creation still succeeded
}
```

**Socket Server Handler** (to be added):
```javascript
app.post("/api/links/link-created-notify", (req, res) => {
  const { linkId, userId } = req.body;
  
  if (io) {
    const authenticatedNamespace = io.of("/");
    
    // Notify all followers or feed subscribers
    authenticatedNamespace.emit("newLinkCreated", {
      linkId,
      userId,
      timestamp: new Date().toISOString(),
    });
  }
  
  res.json({ success: true });
});
```

#### 2. Like Event

**Future API**: `POST /api/links/:linkId/like`

**Socket Event**: `linkLiked`
```javascript
authenticatedNamespace.emit("linkLiked", {
  linkId,
  userId,
  likeCount: link.likes.length
});
```

#### 3. Comment Event

**Future API**: `POST /api/links/:linkId/comments`

**Socket Event**: `commentAdded`
```javascript
authenticatedNamespace.emit("commentAdded", {
  linkId,
  commentId,
  userId,
  text
});
```

#### 4. Reply Event

**Future API**: `POST /api/links/:linkId/comments/:commentId/replies`

**Socket Event**: `replyAdded`
```javascript
authenticatedNamespace.emit("replyAdded", {
  linkId,
  commentId,
  replyId,
  userId,
  text
});
```

### Frontend Socket Listeners

**Example** (to be added to `NavbarLayoutWrapper.tsx`):
```typescript
useEffect(() => {
  if (!socket || !isConnected) return;

  const handleNewLink = (data: { linkId: string; userId: string }) => {
    // Refresh links feed
    mutateLinksFeed();
  };

  socket.on("newLinkCreated", handleNewLink);

  return () => {
    socket.off("newLinkCreated", handleNewLink);
  };
}, [socket, isConnected]);
```

---

## Extending the Feature

### 1. Add Like Functionality

**API Route**: `src/app/api/links/[linkId]/like/route.ts`

```typescript
export async function POST(
  req: Request,
  { params }: { params: { linkId: string } }
) {
  // Toggle like
  // Emit socket event
  // Return updated like count
}
```

**Frontend Component**: Like button with heart icon, real-time count

### 2. Add Comment Functionality

**API Route**: `src/app/api/links/[linkId]/comments/route.ts`

```typescript
export async function POST(
  req: Request,
  { params }: { params: { linkId: string } }
) {
  // Create comment
  // Emit socket event
  // Return comment with user info
}
```

**Frontend Component**: Comment section with input, list of comments

### 3. Add Reply Functionality

**API Route**: `src/app/api/links/[linkId]/comments/[commentId]/replies/route.ts`

```typescript
export async function POST(
  req: Request,
  { params }: { params: { linkId: string; commentId: string } }
) {
  // Create reply
  // Emit socket event
  // Return reply with user info
}
```

**Frontend Component**: Reply input nested under each comment

### 4. Add Link Feed

**API Route**: `src/app/api/links/feed/route.ts`

```typescript
export async function GET(req: Request) {
  // Get links from followed users
  // Paginate results
  // Return with user info populated
}
```

**Frontend Component**: Infinite scroll feed component

### 5. Add Link Details Page

**Page**: `src/app/(protected)/links/[linkId]/page.tsx`

- Full-size image
- All comments and replies
- Like button
- Share functionality

### 6. Add Link Editing

**API Route**: `src/app/api/links/[linkId]/route.ts` (PATCH)

- Allow editing description and location
- Only by link owner

### 7. Add Link Deletion

**API Route**: `src/app/api/links/[linkId]/route.ts` (DELETE)

- Soft delete or hard delete
- Only by link owner
- Clean up Cloudinary image

### 8. Add Image Cropping

**Component**: Extend `ImageUploader` with crop functionality

- Use `react-easy-crop` (already in project)
- Similar to avatar cropping in settings

### 9. Add Multiple Images

**Model Update**: Change `imageUrl` to `imageUrls: string[]`

**UI Update**: Allow multiple file selection, carousel view

### 10. Add Hashtags & Mentions

**Model Update**: Add `hashtags: string[]` and `mentions: string[]`

**Parsing**: Extract from description text
- `#hashtag` → hashtags array
- `@username` → mentions array

**Socket Events**: Notify mentioned users

---

## Best Practices

### Security

1. **Authentication**: All API routes require authentication
2. **Validation**: Server-side validation for all inputs
3. **File Upload**: Validate file type and size
4. **Rate Limiting**: Consider adding rate limits for link creation
5. **Image Optimization**: Cloudinary handles optimization automatically

### Performance

1. **Image Loading**: Use Next.js Image component with optimization
2. **Pagination**: Implement pagination for feeds
3. **Caching**: Use SWR for data fetching and caching
4. **Lazy Loading**: Lazy load comments/replies
5. **CDN**: Cloudinary provides CDN for images

### User Experience

1. **Loading States**: Show loading indicators during uploads
2. **Error Handling**: Clear error messages
3. **Optimistic Updates**: Update UI immediately, sync with server
4. **Real-time Updates**: Use sockets for likes/comments
5. **Accessibility**: Proper ARIA labels and keyboard navigation

---

## Testing Checklist

- [ ] Image upload works (drag-and-drop and click)
- [ ] Image preview shows correctly
- [ ] Form validation works (required fields, character limits)
- [ ] Link creation succeeds with valid data
- [ ] Error handling works (network errors, validation errors)
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Authentication required for API routes
- [ ] Cloudinary upload succeeds
- [ ] MongoDB storage works correctly
- [ ] Image removal works

---

## Troubleshooting

### Image Upload Fails

1. Check Cloudinary environment variables
2. Verify file size is under 10MB
3. Check browser console for errors
4. Verify network connectivity

### Link Creation Fails

1. Check MongoDB connection
2. Verify authentication token
3. Check server logs for errors
4. Verify all required fields are provided

### Images Not Displaying

1. Check Cloudinary URL is valid
2. Verify CORS settings in Cloudinary
3. Check Next.js Image component configuration
4. Verify image is publicly accessible

---

## Support

For issues or questions:
1. Check this documentation
2. Review code comments
3. Check server logs
4. Review API responses

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

