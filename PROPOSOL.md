# 📸 LinkUp — A Social Photo-Sharing Web App

## 🚩 Problem Statement

Social photo sharing and discovery are central to how people express themselves and connect, but building a performant, real-time, and production-minded demo that showcases authentication, media uploads, social graphs (follow/unfollow), and live interactions is non-trivial.

**LinkUp** provides a clean, responsive Instagram-style web app that demonstrates secure authentication, efficient media handling via Cloudinary, and live features (notifications/comments) via WebSockets — ideal for portfolio and internship demos.

---

## 🏗️ System Architecture

**Frontend (Next.js)** → **Backend (Node.js + Express + Socket.io)** → **Database (MongoDB Atlas via Mongoose)** → **Media Storage/CDN (Cloudinary)**

---

## 🧩 Components & Responsibilities

### Frontend (Next.js)
- Routing (pages + dynamic routes)
- SSR/SSG for public pages
- Client-side fetching for authenticated flows
- Image upload UI
- UI components
- Auth context

### Backend (Node.js + Express)
- REST API (auth, users, posts, comments, notifications)
- JWT auth middleware
- Optional server-side image mediation
- Socket.io server for real-time events

### Database (MongoDB + Mongoose)
- Users
- Posts
- Comments
- Notifications
- Followers/Following relationships

### Cloudinary
- Image storage
- Responsive image transforms
- CDN delivery  
- Store only image metadata + URLs in MongoDB

### Hosting
- **Frontend:** Vercel  
- **Backend:** Vercel  
- **Database:** MongoDB Atlas  

---

## 🏗️ Architecture Overview

### System Architecture
LinkUp uses a **dual-server architecture** with separation of concerns:

```
┌─────────────────────┐         ┌──────────────────────┐
│   Next.js App       │         │  Socket.IO Server    │
│   (Port 3000)       │◄───────►│   (Port 3001)        │
│                     │  HTTP   │                      │
│  • API Routes       │         │  • Real-time Events  │
│  • SSR/SSG          │         │  • WebSocket         │
│  • Auth Middleware  │         │  • Event Broadcasting│
└──────────┬──────────┘         └──────────-┬──────────┘
           │                                │
           └────────────┬───────────────────┘
                        │
                ┌───────▼───────┐
                │    MongoDB    │
                │   Database    │
                └───────────────┘
```



---

## ☁️ Hosting Details

| Component | Platform | Notes |
|----------|----------|-------|
| Frontend | Vercel (Next.js) | Automatic GitHub integration |
| Backend  | Render / Railway / Fly.io | Node/Express with env variables |
| Database | MongoDB Atlas | Free tier |
| Images/CDN | Cloudinary | Free tier |
| Optional | Redis | For scaling Socket.io pub/sub |

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- User signup, login, logout
- Secure JWT (HTTP-only cookies) or next-auth
- Protected API routes

### 👤 User Profiles
- Profile page
- Edit bio & profile picture
- Followers/following lists

### 🖼️ Posts
- Upload image + caption
- Cloudinary upload
- Store image URL + metadata
- Post grid & detail view

### 🤝 Social Interactions
- Follow/unfollow users
- Like/unlike posts
- Comments & view counts

### 📰 Feed & Explore
- Home feed (followed users’ posts)
- Explore page (trending/recent)
- Infinite scroll & pagination

### 🔍 Search
- Search users by name/username

### 🔃 Sorting
- By newest, most liked, or most commented

### 🧭 Filtering
- By city, state, country, or age group

### 📄 Pagination
- Infinite scroll for home & explore feeds

### ⚡ Real-time
- Live notifications via Socket.io
- Optional live comments & presence indicator

### 🖼️ Media Handling
- Cloudinary image transforms (`w_auto`, `q_auto`)
- Thumbnails & lazy loading

### 🛡️ Admin / Moderation (Optional)
- Flag posts
- Admin moderation dashboard

### 🚀 Hosting & Deployment
- Public deployment with CI/CD
- Vercel + Render integration

---

## 🧑‍💻 Tech Stack

| Layer | Technologies |
|------|--------------|
| Frontend | Next.js (React), React Query / SWR, Tailwind CSS, Axios / fetch, next/image |
| Backend | Node.js, Express.js, Socket.io, multer |
| Database | MongoDB Atlas, Mongoose ODM |
| Storage/CDN | Cloudinary |
| Authentication | JWT (HTTP-only cookies) or next-auth |
| Dev/Hosting | Vercel, Render/Railway, GitHub Actions (optional) |
| Extras | Redis (optional), Sentry (optional) |

---

## 🔌 API Overview

| Endpoint | Method | Description | Access |
|---------|--------|-------------|--------|
| `/api/auth/signup` | POST | Register new user | Public |
| `/api/auth/login` | POST | Login, return/set JWT | Public |
| `/api/auth/logout` | POST | Clear auth cookie/token | Authenticated |
| `/api/auth/refresh` | POST | Refresh access token | Authenticated |
| `/api/users/:username` | GET | Get public user profile + posts | Public |
| `/api/users/:id/follow` | POST | Follow a user | Authenticated |
| `/api/users/:id/unfollow` | POST | Unfollow a user | Authenticated |
| `/api/posts` | GET | Get feed/explore posts | Auth/Public |
| `/api/posts` | POST | Create post | Authenticated |
| `/api/posts/:id` | GET | Get post details | Public |
| `/api/posts/:id/like` | POST | Like/unlike post | Authenticated |
| `/api/posts/:id/comments` | POST | Add comment | Authenticated |
| `/api/posts/:id/comments` | GET | Fetch comments | Public |
| `/api/uploads` | POST | Server upload to Cloudinary | Authenticated |
| `/api/notifications` | GET | Get user notifications | Authenticated |
| `/api/search/users` | GET | Search users | Public |
| `/api/filter/users` | GET | Filter users by location/age | Public |
| `/api/admin/moderate` | POST/PUT | Admin moderation | Admin |

---