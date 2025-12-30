# LinkUp System Design - Technical Interview Explanation

## 1. High-Level Architecture

### Overall System Flow

The application follows a **dual-server architecture** with clear separation of concerns:

**Client → Next.js App (Port 3000) → Socket.IO Server (Port 3001) → MongoDB**

- **Next.js Application**: Handles all HTTP requests, serves the React frontend, processes API routes, manages authentication
- **Socket.IO Server**: Standalone Express server dedicated to WebSocket connections and real-time event broadcasting
- **MongoDB**: Shared database for both servers, stores users, links, notifications, link requests

### Separation of Concerns

**Why separate Socket.IO from Next.js?**

- **Isolation**: WebSocket connections are long-lived and resource-intensive. Separating them prevents blocking HTTP requests
- **Scalability**: Socket server can be scaled independently based on real-time traffic patterns
- **Reliability**: If one server fails, the other continues operating
- **Resource Management**: Socket connections consume memory differently than HTTP requests, so they benefit from dedicated resources

**Communication Pattern:**

- Next.js API routes perform database operations, then emit events to Socket.IO server via HTTP
- Socket.IO server broadcasts events to connected clients
- Both servers share the same MongoDB connection for data consistency

---

## 2. AWS System Design

### Why AWS Was Chosen

**Cost-Effectiveness**: EC2 provides predictable pricing for a single-server deployment, avoiding over-engineering for current scale

**Control**: Full control over the server environment, allowing custom configurations for Docker, Nginx, and SSL

**Simplicity**: Single EC2 instance is easier to manage than multiple services (Lambda, API Gateway, etc.) for this use case

**Reliability**: EC2 instances run 24/7 without downtime, essential for Socket.IO connections

### EC2 Role and What Runs on It

**EC2 Instance Hosts:**

- **Docker Container**: Contains the Socket.IO server application
- **Nginx**: Runs as a reverse proxy on the host
- **SSL Certificates**: Managed by Nginx for HTTPS termination

**Why EC2 for Socket.IO?**

- Socket.IO requires persistent connections that can't be easily handled by serverless functions
- Long-running processes need a stable environment
- WebSocket connections need a consistent endpoint

### Nginx as Reverse Proxy

**Responsibilities:**

- **HTTPS Termination**: Handles SSL/TLS encryption, decrypts traffic before forwarding to backend
- **Request Routing**: Routes incoming requests to appropriate services
- **Load Balancing**: Can distribute requests across multiple instances (future scaling)
- **Security**: Acts as a buffer between internet and application, can implement rate limiting, DDoS protection

**Configuration Pattern:**

```
Internet → Nginx (Port 443 HTTPS) → Docker Container (Port 3001)
```

**Why Nginx Instead of Application-Level HTTPS?**

- Industry standard for production deployments
- Better performance for SSL/TLS operations
- Centralized security configuration
- Can handle multiple services behind one domain

### SSL/HTTPS Handling

**Process:**

1. SSL certificate obtained via Let's Encrypt or similar service
2. Certificate installed on Nginx
3. Nginx listens on port 443 (HTTPS)
4. All traffic encrypted before reaching application
5. Nginx forwards decrypted requests to Docker container on port 3001

**Why SSL Termination at Nginx?**

- Offloads encryption overhead from application
- Easier certificate management and renewal
- Standard practice for production deployments
- Allows HTTP internally between Nginx and container (simpler, faster)

### Availability and Stability

**Docker Health Checks:**

- Container includes health check endpoint
- Docker monitors container health every 30 seconds
- Automatically restarts container if health check fails

**Nginx Configuration:**

- Configured to handle connection timeouts gracefully
- Returns proper error responses if backend is unavailable

**DuckDNS Integration:**

- Provides free domain name that maps to EC2 public IP
- Required for SSL certificates (can't use raw IP addresses)
- Automatically updates if EC2 IP changes

**Monitoring Strategy:**

- Docker logs container output for debugging
- Nginx access logs track all incoming requests
- Application logs captured within container

---

## 3. Docker Strategy

### Why Docker is Used

**Consistency**: Application runs identically in development and production, eliminating "works on my machine" issues

**Isolation**: Socket.IO server runs in isolated environment, preventing conflicts with system packages

**Portability**: Container can be moved to any Docker-compatible host without configuration changes

**Deployment Simplicity**: Single command to start/stop/restart the entire application

### What is Containerized

**Socket.IO Server Only:**

- The standalone Socket.IO server runs in Docker
- Next.js application is deployed separately (Vercel or similar)
- This separation allows independent scaling and deployment

**Container Contents:**

- Node.js runtime (Node 20)
- Socket.IO server code and dependencies
- Environment variables for configuration
- Health check endpoint

### Docker Improves Consistency

**Development vs Production:**

- Same Node.js version in both environments
- Identical dependency versions
- Same file structure and paths
- Consistent environment variables

**Benefits:**

- Bugs caught in development will reproduce in production
- No surprises from version mismatches
- Faster debugging when issues occur

### Container Management and Restart

**Docker Compose or Systemd:**

- Container configured to restart automatically on failure
- Health checks ensure container is actually running, not just started
- Logs persist for debugging after restarts

**Restart Scenarios:**

- Container crash → Automatic restart
- Server reboot → Container starts on boot
- Health check failure → Docker restarts container
- Manual updates → Stop, rebuild, start with zero downtime if configured properly

**Process:**

1. Pull latest code
2. Rebuild Docker image
3. Stop old container
4. Start new container
5. Health check confirms new container is healthy

---

## 4. Backend Architecture

### API Structure

**Next.js API Routes Pattern:**

- Each feature has its own route file (e.g., `/api/links/create`, `/api/auth/signin`)
- Routes are organized by domain (auth, links, notifications, users)
- All protected routes use `requireAuth()` middleware

**Why Next.js API Routes?**

- Co-located with frontend code for easier development
- TypeScript support out of the box
- Built-in request/response handling
- Automatic route generation from file structure

### Cursor-Based Pagination Implementation

**Why Cursor-Based Instead of Offset?**

- **Performance**: Offset pagination gets slower as offset increases. Cursor-based is consistently fast
- **Data Consistency**: No duplicate or missing records when data changes during pagination
- **Real-Time Safe**: Works reliably with Socket.IO updates without breaking pagination

**How It Works:**

1. **Cursor Structure**: Each cursor contains `createdAt` (ISO string) and `_id` (string)
2. **Encoding**: Cursor is base64-encoded JSON for URL safety
3. **Database Query**: MongoDB aggregation pipeline filters records where `(createdAt < cursor.createdAt) OR (createdAt == cursor.createdAt AND _id < cursor._id)`
4. **Sorting**: Always sorted by `createdAt DESC, _id DESC` for stable ordering
5. **Response**: Returns batch of 10 items plus `nextCursor` (or `null` if no more data)

**Backend Implementation:**

- Cursor logic applied directly in MongoDB aggregation pipeline
- No in-memory filtering or sorting
- Database does all the heavy lifting
- Returns exactly 10 items per batch (fetches 11 to check if more exists)

**Frontend Handling:**

- Uses `useSWRInfinite` hook for paginated data
- Appends new batches to existing data
- Scroll detection triggers `loadMore()` function
- Prevents duplicate fetches with loading flags

### Authentication and Authorization

**JWT Token System:**

- **Access Token**: 15-minute expiry, stored in HttpOnly cookie, used for API authentication
- **Refresh Token**: 7-day expiry, stored in HttpOnly cookie, used to obtain new access tokens
- **Multi-Device Support**: Each device has its own refresh token stored in user's `refreshTokens` array

**Authentication Flow:**

1. User signs in → Server generates access + refresh tokens
2. Tokens stored in HttpOnly cookies (prevents XSS attacks)
3. Each API request includes access token in cookie
4. If access token expires → Client calls `/api/auth/refresh`
5. Refresh endpoint validates refresh token and issues new tokens

**Authorization:**

- `requireAuth()` middleware extracts userId from JWT
- All protected routes check authentication before processing
- User-specific data filtered by `userId` from token

**Why HttpOnly Cookies?**

- JavaScript cannot access cookies, preventing XSS token theft
- Automatically sent with requests, no manual token management
- Secure flag in production ensures HTTPS-only transmission

### Real-Time Updates (Socket.IO) Integration

**Architecture:**

- Socket.IO server runs separately from Next.js API
- API routes emit events to Socket.IO server via HTTP
- Socket.IO server broadcasts to connected clients
- Frontend receives events and updates SWR cache

**Event Flow Example (User Likes a Link):**

1. Frontend: Optimistic UI update (instant feedback)
2. Frontend: API call `POST /api/links/[linkId]/like`
3. Backend: Updates database
4. Backend: Emits event to Socket.IO server via HTTP
5. Socket.IO: Broadcasts `link:update` event to all connected clients
6. All Clients: Receive event, update local cache, UI updates in real-time

**Why This Pattern?**

- **Separation**: API handles data, Socket.IO handles distribution
- **Reliability**: If Socket.IO fails, API still works (just no real-time updates)
- **Scalability**: Socket.IO can be scaled independently
- **Cache Consistency**: All clients receive same event, ensuring UI consistency

**Socket Authentication:**

- Clients connect with JWT token in handshake
- Socket.IO middleware validates token before accepting connection
- Only authenticated users can receive real-time events

---

## 5. Scalability & Reliability

### Handling Growth

**Current Architecture (Single Server):**

- Handles current user base effectively
- MongoDB Atlas scales database independently
- Socket.IO can handle thousands of concurrent connections on single instance

**Future Scaling Options:**

**Horizontal Scaling (Multiple EC2 Instances):**

- Deploy Socket.IO server on multiple EC2 instances
- Use Redis adapter for Socket.IO to share connection state
- Load balancer distributes WebSocket connections
- Nginx can route to multiple backend instances

**Database Scaling:**

- MongoDB Atlas handles automatic scaling
- Read replicas for read-heavy operations
- Indexes ensure query performance as data grows

**Vertical Scaling (Larger EC2 Instance):**

- Upgrade to larger instance type for more CPU/memory
- Simplest scaling approach for moderate growth
- No code changes required

### Failure Recovery

**Container Failures:**

- Docker health checks detect failures
- Automatic container restart
- Health check endpoint confirms server is responding

**Database Failures:**

- MongoDB Atlas provides automatic failover
- Connection pooling handles transient errors
- Application retries failed database operations

**Network Failures:**

- Socket.IO automatically reconnects on connection loss
- Client-side reconnection logic handles temporary outages
- Events queued during disconnection (if configured)

**Application Errors:**

- Try-catch blocks in API routes return proper error responses
- Errors logged for debugging
- Frontend handles errors gracefully with user-friendly messages

### Pagination and Sockets Scaling

**Cursor Pagination Scaling:**

- Performance is O(log n) due to indexed `createdAt` and `_id` fields
- Query time remains constant regardless of dataset size
- No performance degradation as data grows

**Socket.IO Scaling:**

- Single instance can handle 10,000+ concurrent connections
- Redis adapter enables horizontal scaling across multiple instances
- Room-based broadcasting reduces unnecessary event distribution

**Cache Strategy:**

- SWR caches data in memory on client
- Reduces API calls significantly
- Socket events update cache, keeping data fresh
- No server-side cache needed for current scale

---

## 6. Security Considerations

### HTTPS and SSL Termination

**Implementation:**

- SSL certificate installed on Nginx
- All traffic encrypted between client and server
- Nginx terminates SSL, forwards HTTP internally

**Why This Matters:**

- Prevents man-in-the-middle attacks
- Protects authentication tokens in transit
- Required for modern web applications
- Builds user trust

### Environment Variable Handling

**Storage:**

- Sensitive values (JWT secrets, MongoDB URI, email credentials) stored in environment variables
- Never committed to version control
- Different values for development and production

**Security Practices:**

- Strong, randomly generated JWT secrets
- MongoDB connection strings with authentication
- Email credentials stored securely
- Environment variables loaded at runtime, not hardcoded

### Network Exposure and Port Safety

**Port Configuration:**

- **Port 443 (HTTPS)**: Exposed to internet via Nginx
- **Port 3001 (Socket.IO)**: Only accessible internally or through Nginx reverse proxy
- **Port 3000 (Next.js)**: Not exposed (deployed on Vercel, not EC2)

**Security Measures:**

- EC2 security group restricts inbound traffic to port 443 only
- Socket.IO server not directly accessible from internet
- Nginx acts as single entry point
- Firewall rules prevent unauthorized access

**Why This Matters:**

- Reduces attack surface
- Only Nginx needs to handle internet traffic
- Backend services protected behind reverse proxy
- Easier to implement rate limiting and DDoS protection at Nginx level

### Additional Security Measures

**JWT Token Security:**

- Tokens signed with strong secret keys
- Short-lived access tokens (15 minutes)
- Refresh token rotation on each use
- HttpOnly cookies prevent XSS attacks

**Input Validation:**

- All API routes validate request bodies
- Mongoose schemas enforce data types
- String length limits prevent DoS attacks
- ObjectId validation prevents injection attacks

**Authentication:**

- Passwords hashed with bcrypt (10 rounds)
- Never stored in plain text
- Multi-device token management for granular control
- Device-specific logout capability

---

## Summary

LinkUp uses a **dual-server architecture** with Next.js handling HTTP APIs and a separate Socket.IO server for real-time features. The system is deployed on **AWS EC2** with **Docker** for consistency and **Nginx** as a reverse proxy for HTTPS termination. **Cursor-based pagination** ensures scalable data loading, while **JWT authentication** with HttpOnly cookies provides security. The architecture balances simplicity with scalability, allowing for future growth through horizontal or vertical scaling while maintaining reliability through health checks and automatic recovery.

