<div align="center">

# ⚡ QuickAI

### A Production-Ready AI Chat Application

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-purple?style=for-the-badge&logo=vercel)](https://quick-ai-lyart-pi.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/17yashaswini/QuickAi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

![QuickAI Banner](https://img.shields.io/badge/MERN%20Stack-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node-green?style=for-the-badge)

</div>

---

## 🚀 About

**QuickAI** is a full-stack AI chat application powered by **Groq's ultra-fast LLaMA 3.3 70B** model. Built with the MERN stack, it features real-time streaming responses, JWT authentication, persistent chat history, image understanding, voice input, and multiple AI personas — all in a clean, dark/light mode UI.

> 💬 Think ChatGPT, but built from scratch with your own stack.

---

## ✨ Features

| Feature | Description |
|---|---|
| ⚡ **Streaming Responses** | Real-time typewriter effect via Server-Sent Events |
| 🔐 **JWT Authentication** | Secure register/login/logout with bcrypt password hashing |
| 💬 **Persistent Chat History** | All chats saved to MongoDB, per user |
| 🎨 **5 AI Personas** | QuickAI, Coder, Tutor, Writer, Analyst |
| 🖼️ **Image Understanding** | Upload images and ask questions using LLaMA Vision |
| 🎤 **Voice Input** | Speak your message using the Web Speech API |
| 📝 **Rename Chats** | Click to rename any chat inline |
| 🔍 **Search Chats** | Filter through your chat history instantly |
| 🌙 **Dark / Light Mode** | Theme toggle with localStorage persistence |
| 📊 **Token Counter** | Live token usage displayed per session |
| 📤 **Export Chats** | Download as `.txt` or save as PDF |
| 📋 **Copy Responses** | One-click copy any AI message |

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)
![React Router](https://img.shields.io/badge/React%20Router-6-CA4245?style=flat-square&logo=react-router)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=json-web-tokens)

### AI & Services
![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-F55036?style=flat-square)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)

---

## 📁 Project Structure

```
quickai/
├── client/                   # React + Vite Frontend
│   └── src/
│       ├── api/              # Axios instance with JWT interceptor
│       ├── components/       # Sidebar, ChatMessage, PersonaSelector...
│       ├── context/          # AuthContext, ThemeContext
│       └── pages/            # Login, Register, Chat
│
└── server/                   # Node + Express Backend
    ├── config/               # MongoDB connection
    ├── middleware/            # JWT auth middleware
    ├── models/               # User, Chat Mongoose schemas
    └── routes/               # /auth, /chat (with SSE streaming)
```

---

## ⚙️ Getting Started Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repo
```bash
git clone https://github.com/17yashaswini/QuickAi.git
cd QuickAi/quickai
```

### 2. Setup Backend
```bash
cd server
npm install
cp .env.example .env
```

Fill in `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/quickai
JWT_SECRET=your_long_random_secret
GROQ_API_KEY=gsk_your_groq_key_here
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../client
npm install
npm run dev
```

Open **http://localhost:5173** 🎉

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Get current user |

### Chat
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/chat` | Get all user chats |
| `POST` | `/api/chat/new` | Create new chat |
| `GET` | `/api/chat/:id` | Get chat with messages |
| `POST` | `/api/chat/:id/stream` | Stream AI response (SSE) |
| `PATCH` | `/api/chat/:id/rename` | Rename a chat |
| `DELETE` | `/api/chat/:id` | Delete a chat |

---

## 🌍 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | [quick-ai-lyart-pi.vercel.app](https://quick-ai-lyart-pi.vercel.app) |
| Backend | Render | Auto-deployed from GitHub |
| Database | MongoDB Atlas | Cloud hosted |

---

## 📸 Screenshots

> Login Page · Chat Interface · Dark/Light Mode · AI Personas

*(Add screenshots here)*

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made by [Yashaswini](https://github.com/17yashaswini)

⭐ **Star this repo if you found it helpful!**

</div>
