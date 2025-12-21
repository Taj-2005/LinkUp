# LinkUp Socket.IO Server

Standalone Socket.IO server for LinkUp real-time features.

## Setup

1. Install dependencies:
```bash
cd socket-server
npm install
```

2. Create `.env` file:
```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_access_secret
CORS_ORIGIN=http://localhost:3000
```

3. Start the server:
```bash
npm run dev  # Development mode with nodemon
# or
npm start    # Production mode
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `MONGODB_URI`: MongoDB connection string (must match the main app's database)
- `JWT_ACCESS_SECRET`: JWT secret for token verification (must match the main app's secret)
- `CORS_ORIGIN`: Frontend URL for CORS (default: http://localhost:3000)

## API Endpoints

All endpoints require Bearer token authentication.

- `POST /api/link-requests/send` - Send a link request
- `POST /api/link-requests/accept` - Accept a link request
- `POST /api/link-requests/reject` - Reject a link request
- `GET /api/link-requests/get` - Get all pending requests for user
- `POST /api/link-requests/status` - Get link status between users
- `GET /api/link-requests/unseen-count` - Get unseen request count
- `POST /api/link-requests/mark-seen` - Mark request as seen

## Socket.IO Events

### Client → Server

- `sendLinkRequest` - Send a link request
- `acceptLinkRequest` - Accept a link request
- `rejectLinkRequest` - Reject a link request
- `getUnseenCount` - Get unseen request count
- `markRequestAsSeen` - Mark request as seen
- `unlink` - Unlink users

### Server → Client

- `linkRequestReceived` - New link request received
- `linkRequestAccepted` - Link request accepted
- `linkRequestRejected` - Link request rejected
- `unseenRequestCount` - Unseen request count update
- `unlinked` - Users unlinked
- `error` - Error occurred

## Architecture

- `controllers/` - Request handlers
- `services/` - Business logic
- `routes/` - Express routes
- `sockets/` - Socket.IO event handlers
- `models/` - Database models
- `utils/` - Utility functions

## Notes

- The server uses the same MongoDB database as the main Next.js app
- JWT tokens are verified using the same secret as the main app
- User data updates (linked_to, linked_by) are handled by Next.js API routes

## Deployment

Deployed to AWS EC2 via GitHub Actions CI/CD. See `.github/workflows/deploy-socket-server.yml` for deployment configuration.

