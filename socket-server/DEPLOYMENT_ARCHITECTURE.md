# Socket Server Deployment Architecture

## 1. Overview

### What the Socket Server Does

The socket server handles real-time communication in the application. It maintains persistent WebSocket connections with clients to deliver instant updates without requiring clients to constantly check for changes.

**Key responsibilities:**
- Maintains live connections with multiple users simultaneously
- Broadcasts notifications (new messages, link requests, interactions)
- Handles real-time events that need immediate delivery
- Manages connection state and authentication

### Why It Runs Separately

The socket server runs separately from the main backend API for several reasons:

**Resource isolation:** Socket connections are long-lived and memory-intensive. Separating them prevents the main API from being affected by connection management overhead.

**Scalability:** The socket server can be scaled independently based on connection load, while the main API scales based on request volume.

**Reliability:** If the socket server restarts, it doesn't affect the main API functionality. Users can still use the application; they just won't receive real-time updates temporarily.

**Technology optimization:** Socket.IO requires a persistent process that's always running. The main API handles request-response cycles and benefits from different resource allocation.

### Why Cloud Deployment is Required

**24/7 availability:** The socket server must run continuously. A local machine or laptop that turns off breaks all connections.

**Public accessibility:** Clients need to connect from anywhere on the internet. A local development environment isn't accessible to external users.

**Stable IP address:** While EC2 IPs can change, they're more stable than home internet connections and can be tied to a domain name.

**Resource guarantees:** Cloud servers provide consistent CPU and memory, ensuring reliable performance for multiple concurrent connections.

---

## 2. Socket Server Deployment on AWS

### Why AWS EC2

**Elastic Compute Cloud (EC2)** provides virtual servers that run continuously in Amazon's data centers. It was chosen because:

- **Cost-effective:** Free tier available for 12 months, then approximately $8-10/month for a t3.micro instance
- **Full control:** Complete access to the operating system and ability to install any software
- **Flexibility:** Easy to configure, scale, or replace without vendor lock-in
- **Proven reliability:** AWS infrastructure provides high uptime and global availability

### What is an EC2 Instance

An EC2 instance is a virtual computer running in Amazon's cloud. Think of it like renting a computer that:
- Runs 24/7 in a data center
- Has its own operating system (Ubuntu Linux in this case)
- Can be accessed remotely over the internet
- Has a public IP address for internet connectivity
- Can run any software you install on it

**In this project:** The EC2 instance is a small virtual server (t3.micro) running Ubuntu, hosting the socket server application.

### Why EC2 is Suitable for Socket Connections

**Persistent runtime:** EC2 instances run continuously, maintaining WebSocket connections without interruption.

**Network stability:** EC2 provides stable network connectivity with low latency, essential for real-time communication.

**Resource allocation:** Each instance has guaranteed CPU and memory, ensuring consistent performance for connection management.

**Scalability path:** As connection count grows, you can upgrade to larger instance types or deploy multiple instances behind a load balancer.

---

## 3. Docker Usage

### Why Docker is Used

Docker packages the socket server application and all its dependencies into a **container**—a standardized, isolated environment that runs consistently anywhere Docker is installed.

### Problems Docker Solves

**Environment consistency:** The socket server runs identically on your development machine, on EC2, and in any future deployment location. No "works on my machine" issues.

**Dependency management:** All required software (Node.js, npm packages, system libraries) is bundled together. No need to manually install and configure dependencies on the server.

**Isolation:** The socket server runs in its own container, isolated from other applications or system processes that might interfere.

**Deployment simplicity:** Instead of manually setting up Node.js, installing packages, and configuring the environment on EC2, you simply run the Docker container.

### How the Socket Server is Containerized

The `Dockerfile` defines how to build the container:

1. **Base image:** Starts with Node.js 20 (the JavaScript runtime)
2. **Working directory:** Sets up `/app` as the application folder
3. **Dependencies:** Installs npm packages from `package.json`
4. **Application code:** Copies the socket server code into the container
5. **Port exposure:** Makes port 3001 available for incoming connections
6. **Health check:** Automatically monitors if the server is responding
7. **Start command:** Defines how to run the server when the container starts

**Result:** A single, portable package containing everything needed to run the socket server.

### Benefits for Consistency and Reliability

**Reproducible deployments:** Every deployment uses the exact same container image, eliminating configuration drift.

**Quick recovery:** If the container crashes, Docker can automatically restart it. If the server needs replacement, deploying a new container takes seconds.

**Version control:** Different container images can represent different versions of the socket server, enabling easy rollbacks if needed.

**Resource limits:** Docker can enforce memory and CPU limits, preventing the socket server from consuming excessive resources.

---

## 4. Nginx Reverse Proxy

### What is Nginx

Nginx is a high-performance web server and reverse proxy installed directly on the EC2 instance (not in Docker). It acts as an intermediary between clients on the internet and the Docker container running the socket server.

### Why Nginx is Required

**SSL/TLS termination:** Nginx handles SSL certificate management and encryption/decryption. Let's Encrypt certificates are installed on the EC2 instance and managed by Nginx, not inside the Docker container.

**Security layer:** Nginx sits between the internet and the Docker container, providing protection and request validation before traffic reaches the application.

**Performance:** Nginx is optimized for handling many concurrent connections efficiently, making it ideal for WebSocket traffic management.

**Industry standard:** Using a reverse proxy is a standard practice in production deployments, separating concerns between SSL management and application logic.

### How Nginx Works in This Setup

**Configuration:**
- Nginx listens on port 443 (HTTPS) for incoming secure connections
- SSL certificates from Let's Encrypt are configured in Nginx
- Nginx forwards all requests to `http://localhost:3001` (the Docker container)
- WebSocket upgrade headers are properly handled to maintain persistent connections

**Process flow:**
1. Client connects to EC2 on port 443 (HTTPS)
2. Nginx receives the connection and performs SSL handshake
3. Nginx validates the SSL certificate
4. Nginx decrypts the traffic and forwards it to the Docker container on localhost:3001
5. Docker container processes the request and responds
6. Nginx encrypts the response and sends it back to the client

**Benefits:**
- **Separation of concerns:** SSL management is separate from application code
- **Security:** Container is not directly exposed to the internet
- **Flexibility:** Easy to add multiple services or modify routing without changing the container
- **Monitoring:** Nginx logs provide visibility into incoming requests and connection patterns

---

## 5. Running the Socket Server

### Nginx Setup (Prerequisite)

Nginx is installed on the EC2 instance to act as a reverse proxy and handle SSL/TLS termination.

**What Nginx does:**
- **SSL termination:** Receives HTTPS connections on port 443 and handles SSL certificate validation
- **Request forwarding:** Forwards incoming requests to the Docker container running on port 3001
- **WebSocket support:** Properly handles WebSocket connection upgrades (from HTTP to WebSocket protocol)
- **Load balancing:** Can distribute traffic across multiple containers if needed in the future

**Why Nginx is needed:**
- **SSL certificates:** Let's Encrypt SSL certificates are managed by Nginx, not inside the Docker container
- **Security:** Nginx provides an additional layer of security and can handle DDoS protection
- **Performance:** Nginx is highly optimized for handling many concurrent connections efficiently
- **Flexibility:** Makes it easy to add additional services or modify routing without changing the Docker container

**Nginx configuration:**
- Listens on port 443 (HTTPS) for incoming secure connections
- Terminates SSL using Let's Encrypt certificates
- Forwards all traffic to `localhost:3001` (the Docker container)
- Handles WebSocket upgrade headers to maintain persistent connections

### Docker Container Execution on EC2

Once the Docker image is built and pushed to a registry (Docker Hub), it's deployed to EC2:

**Deployment process:**
1. SSH into the EC2 instance
2. Pull the latest Docker image from the registry
3. Stop any existing container running the old version
4. Start a new container from the latest image
5. Container runs the socket server automatically

**Command structure:**
```bash
docker run -d \
  --name linkup-socket \
  --restart unless-stopped \
  -p 3001:3001 \
  --env-file .env \
  username/linkup-socket-server:latest
```

**Breakdown:**
- `-d`: Run in detached mode (background)
- `--name`: Give the container a recognizable name
- `--restart unless-stopped`: Automatically restart if the container crashes or the server reboots
- `-p 3001:3001`: Map port 3001 from the container to port 3001 on the EC2 instance
- `--env-file .env`: Load environment variables (database connection, secrets) from a file
- Last argument: The Docker image to run

### Port Exposure

**Port mapping (`-p 3001:3001`):** This connects the container's internal port 3001 to the EC2 instance's port 3001. However, this port is only accessible from within the EC2 instance (localhost), not directly from the internet.

**Why port 3001:** It's the standard port the socket server listens on. The container exposes this port internally, and Nginx forwards traffic to it.

**Network flow:** Internet → EC2 port 443 (Nginx with SSL) → Nginx forwards to localhost:3001 → Docker container port 3001 → Socket server application

**Security benefit:** The Docker container port (3001) is not directly exposed to the internet. Only Nginx on port 443 is publicly accessible, providing an additional security layer.

### Keeping the Server Running

**Docker restart policy:** The `--restart unless-stopped` flag ensures:
- If the container crashes, Docker automatically restarts it
- If the EC2 instance reboots, Docker starts the container on boot
- Manual stops are respected (won't restart if you explicitly stop it)

**Process management:** Docker acts as a process manager, monitoring the container and ensuring the socket server stays alive.

**Background operation:** Running in detached mode (`-d`) means the container continues running after you log out of the EC2 instance.

---

## 5. DuckDNS (Domain Setup)

### Why DuckDNS Instead of a Paid Domain

**Cost:** DuckDNS provides free subdomains, eliminating the $10-15/year domain registration cost.

**Simplicity:** Quick setup process—no domain registrar accounts or payment methods required.

**Purpose-fit:** For development or small projects, a free subdomain is sufficient. The socket server needs a domain for SSL certificates, not for branding.

**Flexibility:** Easy to change or abandon without financial commitment during development phases.

### What DuckDNS Does

DuckDNS is a free Dynamic DNS service. It provides:
- A free subdomain (e.g., `aws-socket-server.duckdns.org`)
- DNS hosting that points your subdomain to an IP address
- A simple interface to update the IP address if it changes

**In simple terms:** DuckDNS gives you a friendly name (`aws-socket-server.duckdns.org`) that always points to your EC2 server's IP address, even if that IP changes.

### How DuckDNS Points to EC2 Public IP

**Setup process:**
1. Create a DuckDNS account and claim a subdomain
2. Enter your EC2 instance's public IP address in the DuckDNS dashboard
3. DuckDNS updates its DNS records to point your subdomain to that IP
4. DNS propagation occurs (usually within minutes)

**DNS record created:**
- **Type:** A record
- **Name:** aws-socket-server.duckdns.org
- **Value:** 13.60.19.131 (your EC2 public IP)
- **TTL:** Time-to-live (how long DNS servers cache this mapping)

**Result:** When someone requests `aws-socket-server.duckdns.org`, DNS resolves it to your EC2 IP address.

### Why a Domain is Required Instead of Raw IP

**SSL certificates:** Let's Encrypt (free SSL provider) requires a domain name to issue certificates. IP addresses cannot get SSL certificates. Nginx uses these certificates to provide HTTPS.

**HTTPS requirement:** Modern browsers and security policies require HTTPS for WebSocket connections. Without a domain, you cannot obtain an SSL certificate for Nginx to use.

**Mixed content security:** If your frontend runs on HTTPS (like Vercel deployments), browsers block connections to HTTP endpoints. You need HTTPS for the socket server, which requires a domain with SSL certificates managed by Nginx.

**Maintainability:** If the EC2 IP changes (due to instance replacement), you only update the DNS record once. All clients continue using the same domain name.

**Human readability:** Domains are easier to remember and configure than IP addresses.

---

## 6. Connection Flow

### Complete Flow Diagram

```
Client Browser
    ↓
    │ (Initiates WebSocket connection via HTTPS)
    ↓
aws-socket-server.duckdns.org (Domain)
    ↓
    │ (DNS resolution: domain → IP address)
    ↓
EC2 Instance Public IP (13.60.19.131)
    ↓
    │ (Traffic arrives at EC2 network interface)
    ↓
EC2 Security Group (Firewall)
    ↓
    │ (Checks if port 443 is allowed for HTTPS)
    ↓
EC2 Port 443 (HTTPS)
    ↓
    │ (SSL/TLS handshake and encryption)
    ↓
Nginx (Reverse Proxy)
    ↓
    │ (Terminates SSL, validates certificate)
    ↓
    │ (Forwards to localhost:3001)
    ↓
EC2 localhost:3001
    ↓
    │ (Docker port mapping)
    ↓
Docker Container Port 3001
    ↓
    │ (Application receives connection)
    ↓
Socket Server Application
    ↓
    │ (Upgrades HTTP to WebSocket protocol)
    ↓
Connection Established ✓
```

### How WebSocket Connections Reach the Server

**Initial connection:**
1. Client requests `wss://aws-socket-server.duckdns.org/socket.io/` (secure WebSocket)
2. DNS resolves the domain to the EC2 public IP
3. Browser establishes TCP connection to EC2 IP on port 443 (HTTPS)
4. SSL/TLS handshake occurs between browser and Nginx
5. Nginx validates the SSL certificate (from Let's Encrypt)
6. Nginx forwards the encrypted request to the Docker container on localhost:3001
7. Docker container receives the request (already decrypted by Nginx)
8. Socket.IO server accepts the connection and upgrades to WebSocket protocol
9. Persistent bidirectional connection is established

**Data flow after connection:**
- **Client → Server:** Messages travel: Client → Domain → EC2 Port 443 → Nginx (SSL termination) → localhost:3001 → Docker Container → Socket Server
- **Server → Client:** Messages travel: Socket Server → Docker Container → localhost:3001 → Nginx → EC2 Port 443 (re-encrypted) → Domain → Client

**Nginx's role in WebSocket connections:**
- Nginx handles the initial HTTP connection and SSL termination
- When Socket.IO upgrades the connection to WebSocket, Nginx properly forwards the upgrade headers
- Once upgraded, Nginx passes WebSocket frames bidirectionally without interfering
- Nginx maintains connection state and efficiently handles multiple concurrent WebSocket connections

**Connection persistence:** Once established, the WebSocket connection remains open through Nginx, allowing instant message delivery without the overhead of HTTP request/response cycles.

---

## 7. Security & Stability (High Level)

### Ports Opened and Why

**Port 22 (SSH):** Allows remote access to the EC2 instance for administration. Restricted to specific IPs or managed through AWS Systems Manager for enhanced security.

**Port 443 (HTTPS):** Standard port for secure web traffic. Used by Nginx to receive encrypted connections from clients. Nginx terminates SSL and forwards decrypted traffic to the Docker container on port 3001.

**Port 3001 (internal):** Used internally between Nginx and the Docker container. Not exposed directly to the internet—only accessible from within the EC2 instance (localhost). This provides an additional security layer.

**Port 80 (HTTP):** Optional, used by Let's Encrypt for certificate validation. Can redirect all HTTP traffic to HTTPS for security.

**Security principle:** Only the minimum necessary ports are opened. The socket server itself isn't directly exposed to the internet; Nginx handles SSL termination and acts as a reverse proxy, protecting the Docker container from direct internet access.

### Basic Security Considerations

**SSL/TLS encryption:** All connections use HTTPS/WSS, encrypting data in transit between clients and Nginx. Nginx handles SSL termination, ensuring the Docker container doesn't need to manage certificates.

**Security groups:** AWS firewall rules restrict which IPs can access which ports, reducing attack surface. Only port 443 (HTTPS) and port 22 (SSH) are exposed to the internet.

**Nginx as a security layer:** Nginx sits between the internet and the Docker container, providing:
- SSL/TLS termination and certificate management
- Protection against common web attacks
- Rate limiting capabilities
- Request validation before forwarding to the container

**Internal-only container access:** The Docker container port (3001) is only accessible from localhost, meaning it cannot be reached directly from the internet. All traffic must go through Nginx.

**Environment variables:** Sensitive data (database credentials, API keys) are stored in environment variables, not hardcoded in the application.

**Container isolation:** Docker provides process isolation, preventing the socket server from affecting other system components or Nginx.

**Automatic updates:** Docker containers can be updated regularly to include security patches, and redeployment is straightforward. Nginx and SSL certificates can be updated independently.

### Production Safety

**Reliability:** Docker's restart policies ensure the socket server recovers from crashes automatically.

**Monitoring:** Health checks verify the server is responding correctly. Failed health checks can trigger alerts or automatic restarts.

**Scalability:** The containerized approach makes it easy to deploy multiple instances if needed, or upgrade to larger EC2 instances as load increases.

**Backup strategy:** The code and configuration are version-controlled. Environment variables are stored securely. Database connections use connection pooling and are separate from the socket server.

**Disaster recovery:** If the EC2 instance fails, you can launch a new instance, point the domain to the new IP, and redeploy the container. Recovery time is typically under 30 minutes.

---

## 8. Summary

### What Was Achieved

**Reliable deployment:** The socket server now runs 24/7 on AWS EC2, accessible from anywhere on the internet through a secure HTTPS connection.

**Standardized deployment:** Docker ensures the server runs identically in any environment, eliminating deployment inconsistencies.

**Secure communication:** HTTPS/WSS encryption protects all data in transit through Nginx's SSL termination, meeting modern security requirements.

**Professional infrastructure:** Nginx reverse proxy provides enterprise-grade request handling, SSL management, and security features.

**Domain-based access:** DuckDNS provides a stable domain name that works with SSL certificates (managed by Nginx via Let's Encrypt) and is easier to manage than raw IP addresses.

**Automated operations:** Docker's restart policies and health checks ensure the server stays running without manual intervention. Nginx runs as a system service, automatically starting on server reboot.

### Scalability and Reliability

**Scalability:**
- Easy to upgrade EC2 instance size if connection count grows
- Can deploy multiple container instances behind a load balancer
- Docker images can be deployed to any cloud provider or on-premises server

**Reliability:**
- EC2 provides 99.99% uptime SLA
- Docker automatically restarts failed containers
- Health checks provide early warning of issues
- Isolated containers prevent cascading failures

**Maintainability:**
- Code changes trigger automatic redeployment via CI/CD
- Environment configuration is centralized and version-controlled
- Rolling back to previous versions is as simple as deploying an older Docker image

**Cost efficiency:**
- Free tier covers first 12 months
- Low ongoing cost (~$8-10/month) for production-ready infrastructure
- No over-provisioning—pay only for what you use

This architecture provides a solid foundation for production real-time communication while remaining cost-effective and maintainable.

