# Unverified User Cleanup API

## Overview

Secure, scalable API endpoint for cleaning up unverified users older than 7 days. This endpoint performs cascading deletes across related collections (Links, Notifications, LinkRequests) and cleans up user references in other documents.

## Endpoint

```
GET /api/cleanup/unverified?token=<bcrypt-hash>
```

## Authentication

The endpoint uses bcrypt-hashed token authentication. The token must be a bcrypt hash of the `CLEANUP_SECRET` environment variable.

### Generating the Token

Create a script to generate the bcrypt hash:

```javascript
// scripts/generate-cleanup-token.js
const bcrypt = require('bcryptjs');
const secret = process.env.CLEANUP_SECRET || 'your-secret-here';

bcrypt.hash(secret, 10).then(hash => {
  console.log('Cleanup token:', hash);
  console.log('Use this in the API: /api/cleanup/unverified?token=' + hash);
});
```

Or using Node.js REPL:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash(process.env.CLEANUP_SECRET || 'your-secret', 10).then(h => console.log(h))"
```

## Usage

### cURL Example

```bash
curl "https://your-domain.com/api/cleanup/unverified?token=<bcrypt-hash>"
```

### Response Format

**Success (200):**
```json
{
  "success": true,
  "deletedCount": 42,
  "deletedLinksCount": 150,
  "deletedNotificationsCount": 300,
  "deletedLinkRequestsCount": 25,
  "updatedUsersCount": 10,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Unauthorized (401):**
```json
{
  "error": "Unauthorized"
}
```

**Missing Token (400):**
```json
{
  "error": "Missing token parameter"
}
```

**Server Error (500):**
```json
{
  "error": "Internal Server Error",
  "details": "Error message"
}
```

## Cascading Deletes

When an unverified user is deleted, the following cascading operations occur:

1. **Links**: All links created by the user are deleted
2. **Notifications**: All notifications where the user is the recipient (`userId`) or actor (`actorId`) are deleted
3. **LinkRequests**: All link requests where the user is the requester or receiver are deleted
4. **User References**: The user ID is removed from:
   - `linked_to` arrays in other users
   - `linked_by` arrays in other users
   - `savedLinks` arrays in other users (for links that were deleted)

## Scalability Features

- **Indexed Queries**: Uses compound index on `{ isVerified: 1, createdAt: 1 }` for O(1) query performance
- **Batch Processing**: Processes user references in batches of 1000 to avoid memory issues
- **Parallel Operations**: Cascading deletes run in parallel using `Promise.all()`
- **Lean Queries**: Uses `.lean()` for memory-efficient queries when fetching user IDs
- **Bulk Operations**: Uses `deleteMany()` for efficient bulk deletions

## MongoDB Indexes

The following indexes are recommended (and automatically created in the User model):

```javascript
UserSchema.index({ isVerified: 1, createdAt: 1 });
```

Additional indexes that should exist (verify in your database):

- `Link`: `{ userId: 1, createdAt: -1 }` (already exists)
- `Notification`: `{ userId: 1, read: 1, createdAt: -1 }` (already exists)
- `LinkRequest`: `{ requesterId: 1, receiverId: 1, status: 1 }` (already exists)

## Environment Variables

Required:
- `CLEANUP_SECRET`: Original secret string used to generate the bcrypt token
- `MONGODB_URI`: MongoDB connection string

## Security Considerations

1. **Never log secrets**: The original `CLEANUP_SECRET` is never logged or exposed
2. **Token validation**: Uses bcrypt comparison to prevent timing attacks
3. **HTTPS only**: In production, ensure the endpoint is only accessible via HTTPS
4. **Rate limiting**: Consider adding rate limiting middleware for production use
5. **Monitoring**: Log cleanup operations (without sensitive data) for audit trails

## Scheduled Execution

Recommended: Set up a cron job to run this endpoint periodically (e.g., daily):

```bash
# Example cron job (runs daily at 2 AM)
0 2 * * * curl -s "https://your-domain.com/api/cleanup/unverified?token=<bcrypt-hash>" > /dev/null
```

Or using a service like:
- **Vercel Cron Jobs**: Add to `vercel.json`
- **GitHub Actions**: Scheduled workflow
- **AWS Lambda**: EventBridge scheduled rule
- **Node-cron**: Internal scheduler

## Testing

### Unit Tests

Test the service function:

```typescript
import { cleanupUnverifiedUsers } from '@/lib/services/userCleanup';

// Mock User, Link, Notification models
// Test with mock data
```

### Integration Tests

Test the API endpoint:

```bash
# Generate token first
TOKEN=$(node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('test-secret', 10).then(h => console.log(h))")

# Test endpoint
curl "http://localhost:3000/api/cleanup/unverified?token=$TOKEN"
```

## Error Handling

The endpoint handles:
- Missing token: Returns 400
- Invalid token format: Returns 400
- Unauthorized token: Returns 401
- Database errors: Returns 500 with sanitized error message
- Missing environment variables: Throws error on server startup

## Performance

- **Query Time**: O(1) with proper indexes
- **Memory**: Batch processing prevents memory bloat
- **Concurrency**: Parallel operations reduce total execution time
- **Scalability**: Handles millions of users efficiently

## Architecture

- **Separation of Concerns**: Route handler (`route.ts`) handles HTTP, service (`userCleanup.ts`) handles business logic
- **Modularity**: Service function is exportable for reuse/testing
- **Type Safety**: Full TypeScript with proper interfaces
- **Non-blocking**: All operations are async/await

