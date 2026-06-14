# 🧠 Smart Interview Simulator

Adaptive AI-powered technical interview simulator with performance tracking, weak-topic detection, and follow-up questions.

---

## 📁 Project Structure

```
interview-simulator/
├── server/                    ← Node.js + Express backend
│   ├── server.js              ← Entry point
│   ├── config/db.js           ← MongoDB connection
│   ├── routes/interviewRoutes.js
│   ├── controllers/interviewController.js
│   ├── services/
│   │   ├── aiService.js       ← OpenAI / Gemini integration
│   │   └── performanceService.js
│   ├── models/sessionModel.js
│   └── .env.example
│
└── client/                    ← React frontend
    ├── src/
    │   ├── App.js / App.css
    │   ├── hooks/useInterview.js
    │   ├── pages/
    │   │   ├── SetupPage.jsx
    │   │   ├── InterviewPage.jsx
    │   │   └── ResultsPage.jsx
    │   ├── components/
    │   │   ├── ScoreBadge.jsx
    │   │   └── TopicTag.jsx
    │   └── utils/api.js
    └── public/index.html
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your keys (MONGO_URI, OPENAI_API_KEY)
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install
npm start
```

App runs at `http://localhost:3000`, API at `http://localhost:5000`

---

## ⚙️ Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/interview-simulator
OPENAI_API_KEY=sk-...
AI_PROVIDER=openai          # or "gemini"
GEMINI_API_KEY=             # only if using Gemini
CLIENT_URL=http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint                   | Description                 |
|--------|----------------------------|-----------------------------|
| POST   | /api/session/start         | Start a new session         |
| POST   | /api/session/answer        | Submit answer, get feedback |
| POST   | /api/session/end           | End session, get summary    |
| GET    | /api/session/:sessionId    | Get session details         |
| GET    | /api/history/:userId       | Get all sessions for user   |

---

## 🌐 Deployment

| Component | Platform      |
|-----------|---------------|
| Frontend  | Vercel        |
| Backend   | Render        |
| Database  | MongoDB Atlas |

Set `REACT_APP_API_URL=https://your-backend.render.com/api` in Vercel env vars.

---

## 🔑 Key Features

- **Adaptive questions** — follows up on weak topics
- **Follow-up detection** — probes medium scores (4–7) deeper
- **Performance radar** — topic-by-topic scoring with charts
- **Safe JSON parsing** — handles unpredictable LLM output
- **Rate limiting** — prevents abuse in live demos
- **Persistent userId** — localStorage-based, no auth needed
