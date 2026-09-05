# 📸 Image Collaboration Tool

A real-time platform for teams to collaborate on images with pin-based comments, shareable links, and admin moderation tools.

## ✨ Features

### 🔐 Authentication

- User signup and login with email/password
- JWT token-based authentication
- Protected routes for authorized users

### 🖼️ Image Management

- Upload multiple images at once
- Image library with thumbnails, upload dates, and activity tracking
- Delete images with confirmation

### 📌 Real-time Comments

- Click anywhere on an image to place a comment pin
- Threaded replies with real-time updates via Socket.IO
- Resolve/reopen comment threads
- Attachment support in comments

### 🔗 Image Sharing

- Generate secure shareable links
- Optional expiration dates
- Enable/disable share links
- Revoke access anytime

### 👑 Admin Dashboard

- View platform statistics (users, images, comments, reports)
- User management (view, ban, promote/demote roles)
- Image management (view and delete any image)
- Report queue (review and resolve reports)

### 📧 Email Notifications

- New thread created
- New reply added
- Thread resolved or reopened
- Owner always gets notifications
- Participants automatically subscribed

## 🛠️ Tech Stack

### Frontend

- **React** – UI framework
- **Vite** – Build tool
- **React Router** – Navigation
- **Axios** – API calls
- **Socket.IO Client** – Real-time updates
- **React Zoom Pan Pinch** – Image zoom & pan

### Backend

- **Node.js** – Runtime
- **Express** – Web framework
- **Prisma** – ORM
- **PostgreSQL** – Database
- **Socket.IO** – Real-time communication
- **JWT** – Authentication
- **bcrypt** – Password hashing
- **Nodemailer** – Email notifications

### Deployment

- **Frontend**: Vercel / Netlify
- **Backend**: Render / Fly.io
- **Database**: Neon / Supabase

## 📦 Installation

### Prerequisites

- Node.js (v18+)
- PostgreSQL database (Neon/Supabase)

### Clone the Repository

```bash
git clone https://github.com/bamlakyemane/Image-collab-tool.git
cd Image-collab-tool
```
