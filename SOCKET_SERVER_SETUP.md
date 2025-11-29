# Socket.IO Server Setup Guide

This guide explains how to set up and run the standalone Socket.IO server for LinkUp real-time features.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB database (same as your Next.js app)
- Access to your JWT secrets

## Installation

1. Navigate to the socket-server directory:
```bash
cd socket-server
```

2. Install dependencies:
```bash
npm install
```

## Configuration

1. Create a `.env` file in the `socket-server` directory:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/linkup
JWT_ACCESS_SECRET=your_jwt_access_secret_here
CORS_ORIGIN=http://localhost:3000
```

**Important:** 
- `MONGODB_URI` must be the same as your Next.js app's MongoDB connection
- `JWT_ACCESS_SECRET` must match your Next.js app's `JWT_ACCESS_SECRET`
- `CORS_ORIGIN` should be your frontend URL

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 3001 (or the port specified in `.env`).

## Frontend Configuration

Add this to your Next.js `.env.local` file:
```env
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3001
```

## Testing

1. Start the Socket.IO server
2. Start your Next.js app
3. The frontend will automatically connect to the socket server when a user logs in

## Architecture

- **Backend (socket-server/)**: Standalone Express + Socket.IO server
- **Frontend**: Next.js app with Socket.IO client integration
- **Database**: Shared MongoDB instance
- **Authentication**: JWT tokens shared between frontend and backend

## Features

- Real-time link request notifications
- Toast notifications for new requests
- Bell icon badge with unseen count
- Real-time status updates
- Unlink functionality

## Troubleshooting

- **Connection errors**: Check that the Socket.IO server is running and CORS_ORIGIN is correct
- **Authentication errors**: Verify JWT_ACCESS_SECRET matches between frontend and backend
- **Database errors**: Ensure MONGODB_URI is correct and accessible

