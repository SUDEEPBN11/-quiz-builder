# Quiz Builder — Kahoot-Style Quiz Platform

A real-time interactive quiz platform with AI-powered question generation, live leaderboards, and PPTX import support.

---

## Prerequisites

Make sure the following are installed on your system before running the project.

### Required

| Dependency | Version | How to Check | Download |
|------------|---------|--------------|----------|
| **Node.js** | v18 or higher | `node --version` | [nodejs.org](https://nodejs.org) |
| **npm** | v9 or higher | `npm --version` | Comes with Node.js |
| **MongoDB** | v6 or higher | `mongod --version` | [mongodb.com](https://www.mongodb.com/try/download/community) |
| **Git** | Any | `git --version` | [git-scm.com](https://git-scm.com) |

### Optional (for AI question generation)

| Dependency | Purpose |
|------------|---------|
| **OpenAI API Key** | Generate questions using GPT |
| **Google Gemini API Key** | Generate questions using Gemini |

> You can run the app without AI keys — all other features will work normally.

---

## Installation

### Step 1 — Clone the repository

```bash
git clone https://github.com/SUDEEPBN11/-quiz-builder.git
cd -quiz-builder
```

### Step 2 — Install backend dependencies

```bash
cd backend
npm install
```

### Step 3 — Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## Configuration

### Step 4 — Set up backend environment variables

Copy the example file and fill in your values:

```bash
cd ../backend
cp .env.example .env
```

Open `backend/.env` and update:

```env
# Server port
PORT=4000

# MongoDB connection — choose one:
# Local MongoDB:
MONGODB_URI=mongodb://127.0.0.1:27017/kahoot-platform
# OR MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kahoot-platform

# Frontend URL (keep as-is for local dev)
CLIENT_URL=http://localhost:5173

# AI Provider: openai | gemini (optional)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...        # Add your OpenAI key here (optional)
GEMINI_API_KEY=AIza...       # Add your Gemini key here (optional)

# Secret key
JWT_SECRET=your-secret-here
```

### Step 5 — Set up frontend environment variables

```bash
cd ../frontend
cp .env.example .env
```

The default `frontend/.env` works out of the box:

```env
VITE_API_URL=http://localhost:4000
```

---

## Running the Project

You need **two terminal windows** — one for the backend, one for the frontend.

### Step 6 — Start MongoDB (local only)

If using a local MongoDB installation:

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Verify it's running
mongosh --eval "db.runCommand({ ping: 1 })"
```

> If using MongoDB Atlas, skip this step — your cloud DB is always running.

### Step 7 — Start the backend

```bash
cd backend
npm run dev
```

You should see:
```
[DB] MongoDB connected successfully.
[Server] Running on http://localhost:4000
[Server] Socket.IO ready
```

### Step 8 — Start the frontend

Open a **new terminal tab/window**:

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x  ready in Xms
➜  Local:   http://localhost:5173/
```

### Step 9 — Open the app

Go to **http://localhost:5173** in your browser.

---

## Project Structure

```
quiz-builder/
├── backend/                  # Node.js + Express + Socket.IO
│   ├── src/
│   │   ├── ai/               # AI question generation (OpenAI / Gemini)
│   │   ├── analytics/        # Session analytics
│   │   ├── config/           # DB and AI config
│   │   ├── leaderboard/      # Real-time leaderboard
│   │   ├── pptx/             # PPTX file import
│   │   ├── question/         # Question management
│   │   ├── session/          # Quiz session management
│   │   ├── socket/           # Socket.IO event handlers
│   │   ├── user/             # Participant management
│   │   └── server.js         # Entry point
│   └── package.json
│
├── frontend/                 # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   └── services/         # API and socket services
│   └── package.json
│
└── README.md
```

---

## Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot-reload (development) |
| `npm start` | Start without hot-reload (production) |
| `npm test` | Run test suite |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Troubleshooting

**MongoDB connection error**
- Make sure MongoDB is running locally (`brew services start mongodb-community` on macOS)
- Or switch to MongoDB Atlas and update `MONGODB_URI` in `backend/.env`

**Port already in use**
- Backend default: `4000` — change `PORT` in `backend/.env`
- Frontend default: `5173` — Vite will auto-pick the next available port

**AI generation not working**
- Add a valid `OPENAI_API_KEY` or `GEMINI_API_KEY` to `backend/.env`
- Make sure `AI_PROVIDER` matches the key you provided (`openai` or `gemini`)
