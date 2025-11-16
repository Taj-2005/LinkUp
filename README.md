# 📱 LinkUp — Modern Social Connection Platform

LinkUp is a full‑stack social networking application designed to help users discover, connect, and communicate seamlessly. Built with **Next.js 14 App Router**, **TypeScript**, **MongoDB**, and **Framer Motion**, the platform prioritizes UI smoothness, authentication security, and scalable architecture.

Future enhancements include **WebSockets for real‑time chat**, **Cloudinary for media uploads**, and additional personalization features.

---

## 🚀 Features

### 🔐 Authentication & Security

* JWT‑based **Access + Refresh Tokens** (Rotation + Database Validation)
* HttpOnly secure cookies for token storage
* Auto‑refresh mechanism with safe_single_refresh lock
* Protected API routes using server middleware

### 👤 User System

* Create users with avatar, bio, location, links, etc.
* Gender‑based and location‑based user suggestions
* Profile page with stats (links, linked_by, linked_to)
* Dark & Light theme support (Next Themes)

### 💬 Messaging System (Upcoming)

* Real‑time chat with WebSockets
* Seen/delivered indicators
* Online/offline statuses

### 🧭 Navigation & UI

* Animated sidebar navigation
* Separate sections:

  * LiveLinks
  * LinkFinder (Search)
  * LinkUps (Chats)
  * LinkUp Requests
  * New Link
  * LinkHub (Profiles)
* Skeleton loading states (Shimmer)
* Smooth animations using Framer Motion

### 🔍 Search System

* Auto‑sorted search results
* Intelligent suggestions:

  * Same city prioritized first
  * Opposite gender next
  * Remaining users last

### 🖼️ Media Handling (Future)

* Cloudinary integration
* Update profile picture
* Upload post images

---

## 🛠️ Tech Stack

### **Frontend**

* **Next.js 14 App Router**
* **TypeScript**
* **TailwindCSS**
* **Framer Motion**
* **React Icons**
* **Next Themes**

### **Backend**

* **Next.js Server Actions & Routes**
* **MongoDB + Mongoose**
* **JWT (jsonwebtoken)**
* **Secure Cookie Management**

### **Tools & Deployment**

* **ESLint + Prettier**
* **Vercel** / Node Hosting
* **Cloudinary (Future)**
* **WebSockets (Future)**

---

## 📁 Folder Structure Overview

```
linkup/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── signin/route.ts
│   │   │   │   ├── signup/route.ts
│   │   │   │   ├── refresh/route.ts
│   │   │   │   └── signout/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── users/route.ts
│   │   ├── livelinks/page.tsx
│   │   ├── linkfinder/page.tsx
│   │   ├── linkups/page.tsx
│   │   ├── linkhub/[username]/page.tsx
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── Navbar/...
│   │   ├── home/...
│   │   ├── search/...
│   │   ├── messages/...
│   │   └── profile/...
│   │
│   ├── lib/
│   │   ├── dbConnect.ts
│   │   ├── tokens.ts
│   │   ├── auth.ts
│   │   ├── authHelpers.ts
│   │   ├── refreshLock.ts
│   │   └── authClient.ts
│   │
│   ├── models/
│   │   └── User.ts
│   │
│   ├── utils/
│   │   └── api.ts
│   │
│   └── constants/
│       └── User.ts (temporary dummy data)
│
├── public/
│   ├── dark-profile.png
│   ├── light-profile.png
│   └── favicon.ico
│
├── .env.local
├── package.json
├── README.md
└── tsconfig.json
```

---

## ⚙️ Environment Variables

Create a `.env.local` file:

```
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
```

---

## 🏁 Running the Project

### Install Dependencies

```
yarn install
# or
npm install
```

### Start Development Server

```
yarn dev
# or
npm run dev
```

Visit:

```
http://localhost:3000
```

---

## 🔮 Upcoming Features

### ⚡ Real‑time Messaging

* WebSocket based chat
* Online/offline presence
* Message status

### 🖼️ Cloudinary Media Upload

* Profile picture upload
* Story uploads
* Image optimization

### ❤️ Match System

* Mutual linking detection
* Smart recommendations

---

## 🧑‍💻 Author

**Taj — Web Developer**
Building modern full‑stack web applications with elegant UI and scalable architecture.

---

## ⭐ Contribution Guide (Future)

* Fork the repo
* Create a feature branch
* Submit PR

---

## 📜 License

This project is currently private and not open-source. Future licensing will be updated.

---