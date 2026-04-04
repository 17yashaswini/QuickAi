# ⚡ QuickAI — MERN AI Chat App

A production-ready AI chat application built with the MERN stack, Groq API (LLaMA 3), and JWT authentication.

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas or local) |
| AI | Groq API — LLaMA 3.3 70B |
| Auth | JWT + bcrypt |

## 📁 Project Structure

```
quickai/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── api/         # Axios instance
│       ├── components/  # Sidebar, ChatMessage, etc.
│       ├── context/     # AuthContext
│       └── pages/       # Login, Register, Chat
└── server/          # Express backend
    ├── config/      # MongoDB connection
    ├── middleware/  # JWT auth middleware
    ├── models/      # User, Chat schemas
    └── routes/      # auth.js, chat.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free) OR local MongoDB
- Groq API key (free at https://console.groq.com)

---

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd quickai
```

### 2. Setup the Server

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/quickai
JWT_SECRET=any_long_random_string_here
GROQ_API_KEY=gsk_your_groq_key_here
CLIENT_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```

### 3. Setup the Client

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Getting API Keys

### MongoDB Atlas (Free)
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Click Connect → Drivers → copy the connection string
4. Replace `<password>` with your DB user password

### Groq API Key (Free)
1. Go to https://console.groq.com
2. Sign up and create an API key
3. Free tier: very generous rate limits

---

## ✨ Features

- 🔐 JWT-based auth (register / login / logout)
- 💬 Real-time AI chat with LLaMA 3.3 70B via Groq
- 📜 Persistent chat history per user in MongoDB
- 🗂️ Multiple chat sessions with auto-generated titles
- 🗑️ Delete individual chats
- 📋 Copy AI responses
- ⌨️ Markdown rendering with syntax highlighting
- 📱 Collapsible sidebar
- 💡 Suggested prompts on empty state

---

## 🏗️ API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Chat
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/chat` | Get all user chats |
| POST | `/api/chat/new` | Create new chat |
| GET | `/api/chat/:id` | Get chat with messages |
| POST | `/api/chat/:id/message` | Send message, get AI reply |
| DELETE | `/api/chat/:id` | Delete a chat |
