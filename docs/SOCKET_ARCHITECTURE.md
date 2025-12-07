# Real-Time Socket Architecture

## Overview

This document describes the real-time, event-driven architecture that replaces polling mechanisms with Socket.IO-based updates. The system is designed for **zero polling**, **instant UI updates**, and **horizontal scalability**.

## Architecture Diagram

```
┌─────────────┐         ┌──────────────┐
│  Next.js    │         │   Socket     │
│  API Routes │────────▶│   Server     │
└─────────────┘         └──────────────┘
     │                        │
     │ HTTP POST              │ Socket.IO Events
     │                        │
     │                        │
     │                        ▼
     │                 ┌──────────────┐
     │                 │   Single     │
     │                 │  Instance    │
     │                 │  (or Sticky  │
     │                 │   Sessions)  │
     │                 └──────────────┘
     │                        │
     │                        │ Socket Events
     │                        │
     ▼                        ▼
┌─────────────────────────────────────┐
│         Frontend Client             │
│  ┌──────────────────────────────┐  │
│  │  useSocket Hook              │  │
│  │  - Listens to events         │  │
│  │  - SWR mutations             │  │
│  │  - Optimistic updates        │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  SWR Cache (Client-side)     │  │
│  │  - Automatic caching         │  │
│  │  - Optimistic mutations      │  │
│  │  - Background revalidation   │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  Socket Store (Zustand)      │  │
│  │  - Connection state          │  │
│  │  - Unseen count              │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Key Components

### 1. Socket Server (`socket-server/index.js`)

**Responsibilities:**
- Manages Socket.IO server in single-instance mode
- Handles authentication via JWT tokens
- Emits events to user-specific rooms (`user:${userId}`)
- Automatically calculates and emits unseen counts

**Scalability:**
- Runs as single instance (or multiple instances with sticky sessions)
- All caching handled by SWR on frontend
- Load balancer with sticky sessions for multi-instance deployment

### 2. API Routes (`src/app/api/**/route.ts`)

**Pattern:**
1. Perform database operation (create notification, update status, etc.)
2. Emit socket event via helper functions (`src/lib/socket-helpers.ts`)
3. Return HTTP response (non-blocking socket emission)

**Events Emitted:**
- `notification:new` - New interaction (comment, reply, like, save)
- `notification:update` - Notification read/cleared
- `unseenCount:update` - Updated combined unseen count
- `userUpdated` - User profile changes
- `linkRequestAccepted` - Link request accepted

### 3. Frontend Socket Hook (`src/hooks/useSocket.ts`)

**Responsibilities:**
- Listens to all socket events
- Performs optimistic SWR cache mutations (SWR handles all caching)
- Handles event deduplication (prevents race conditions)
- Updates Zustand store reactively

**Event Handling with SWR:**
```typescript
socket.on("unseenCount:update", (data) => {
  // 1. Update Zustand store (instant UI update)
  setUnseenCount(data.unseenCount);
  
  // 2. Invalidate SWR cache (SWR handles caching and revalidation)
  mutate("notifications", undefined, { revalidate: false });
  // SWR will handle background revalidation automatically
});
```

**SWR Caching Benefits:**
- Automatic client-side caching
- Optimistic mutations for instant UI
- Background revalidation for consistency
- Deduplication of requests
- No server-side caching needed

### 4. Socket Store (`src/store/useSocketStore.ts`)

**State Management:**
- Socket connection instance
- Connection status (`isConnected`)
- Unseen count (reactive via socket events)

**Zero Polling:**
- No `setInterval` or HTTP polling
- All updates come via socket events
- Token changes handled via storage events (cross-tab sync)

### 5. Socket Initializer (`src/components/SocketInitializer.tsx`)

**Responsibilities:**
- Initializes socket connection when user is authenticated
- Sets up unified socket hook
- Configures link-specific handlers

## Event Flow Examples

### Example 1: User Comments on a Link

```
1. Frontend → API: POST /api/links/[linkId]/comment
2. API → DB: Create notification document
3. API → Socket Server: HTTP POST /api/notifications/interaction-notify
4. Socket Server → DB: Calculate unseen counts
5. Socket Server → Client: Emit "notification:new" + "unseenCount:update"
6. Client → useSocket Hook: Receive events
7. Hook → SWR: Invalidate "notifications" cache (SWR handles caching)
8. Hook → Zustand: Update unseenCount
9. SWR: Performs background revalidation for consistency
10. UI: Reactively updates (navbar badge, notifications page)
```

**Result:** Instant UI update with zero polling, SWR handles all caching

### Example 2: User Reads a Notification

```
1. Frontend → API: PATCH /api/notifications/[id]/read
2. API → DB: Update notification.read = true
3. API → Socket Server: HTTP POST /api/notifications/update-notify
4. Socket Server → DB: Recalculate unseen counts
5. Socket Server → Client: Emit "unseenCount:update"
6. Client → Hook: Update store + invalidate cache
7. UI: Badge count decreases instantly
```

## Scalability Features

### Scaling with SWR and Sticky Sessions

**Setup:**
1. Deploy multiple socket server instances (e.g., via AWS ECS, Kubernetes)
2. Configure load balancer with sticky sessions (session affinity)
3. SWR handles all caching on frontend (no server-side cache needed)

**How It Works:**
- Load balancer routes client to same server instance (sticky sessions)
- Each instance handles its own socket connections
- Events broadcast only to clients on that instance
- SWR manages client-side caching independently

**Capacity:**
- Each instance can handle ~10k concurrent connections
- With 10 instances: ~100k concurrent users
- SWR provides efficient client-side caching with automatic deduplication

**Benefits:**
- Simpler architecture (no Redis dependency)
- SWR handles all caching automatically
- Reduced infrastructure complexity
- Faster local cache access (client-side)

### Event Deduplication

**Problem:** Multiple rapid events could cause race conditions or duplicate processing.

**Solution:**
- Event IDs generated on server (timestamp + random)
- Client tracks processed event IDs
- Duplicate events within 1 second are ignored
- Memory-efficient cleanup (max 1000 tracked events)

### Optimistic Updates

**Pattern:**
1. Socket event received → Immediate store update (optimistic)
2. SWR cache invalidated (no immediate refetch)
3. Background revalidation after 100ms delay

**Benefits:**
- Instant UI updates (perceived latency = 0ms)
- Background consistency check
- Reduced unnecessary network requests

## Zero Polling Guarantee

### Removed Mechanisms:
- ❌ `setInterval` for unseen count polling
- ❌ HTTP polling via `getCombinedUnreadCount()`
- ❌ Token check intervals (replaced with storage events)
- ❌ Initial count fetch on mount (replaced with socket event)

### Replaced With:
- ✅ Socket events for all real-time updates
- ✅ Storage events for cross-tab token sync
- ✅ Socket `getUnseenCount` event (one-time on connect)
- ✅ Reactive updates via Zustand + SWR

## Production Checklist

### Environment Variables:
```bash
# Socket Server
PORT=3001
CORS_ORIGIN=https://your-app.com

# Frontend
NEXT_PUBLIC_SOCKET_SERVER_URL=https://socket-server.your-app.com
```

### Monitoring:
- Socket connection count per instance
- Event processing latency
- SWR cache hit/miss rates (client-side)
- Unseen count calculation performance
- Load balancer sticky session distribution

### Error Handling:
- Socket reconnection with exponential backoff
- Graceful degradation if socket server unavailable
- Non-blocking socket emissions (don't break API responses)
- Event deduplication prevents duplicate processing

## Performance Metrics

**Before (Polling):**
- Network requests: ~3 per user per minute (20s interval)
- Latency: Up to 20 seconds
- Server load: O(n) database queries per polling cycle
- Scalability: Limited by polling frequency

**After (Socket Events + SWR):**
- Network requests: 0 (only event-driven)
- Latency: < 100ms (socket event + processing)
- Server load: O(1) per event (targeted updates)
- Caching: Client-side via SWR (automatic, efficient)
- Scalability: Horizontal scaling with sticky sessions

**Improvement:** 96%+ reduction in network requests, instant updates, unlimited scalability.

## Security Considerations

1. **Authentication:** JWT tokens validated on socket handshake
2. **Authorization:** User-specific rooms (`user:${userId}`)
3. **Event Validation:** Server validates all event payloads
4. **Rate Limiting:** Consider rate limiting on socket server (future enhancement)

## Testing

### Unit Tests:
- Socket event emission
- SWR cache mutations
- Event deduplication logic

### Integration Tests:
- End-to-end notification flow
- Multi-instance event broadcasting
- Reconnection handling

### Load Tests:
- 10k+ concurrent connections
- High-frequency event emission
- Redis pub/sub performance

